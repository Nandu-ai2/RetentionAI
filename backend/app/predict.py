import os
import joblib
import numpy as np
import pandas as pd
import shap

from dotenv import load_dotenv

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from .database import get_db
from .models import Prediction, User
from .schemas import (
    PredictionInput,
    PredictionResponse
)
from .auth import get_current_user

import shutil
from pathlib import Path

# ==========================================
# LOAD ENV
# ==========================================

load_dotenv()

# ==========================================
# MODEL PATHS
# ==========================================

MODEL_PATH = os.getenv(
    "MODEL_PATH",
    "ml/model.pkl"
)

PREPROCESSOR_PATH = os.getenv(
    "PREPROCESSOR_PATH",
    "ml/preprocessor.pkl"
)

print(f"MODEL PATH: {MODEL_PATH}")
print(f"PREPROCESSOR PATH: {PREPROCESSOR_PATH}")

# ==========================================
# LOAD MODEL
# ==========================================

try:

    model = joblib.load(MODEL_PATH)

    preprocessor = joblib.load(
        PREPROCESSOR_PATH
    )

    # If the saved model is a sklearn Pipeline, TreeExplainer
    # needs the underlying tree estimator (XGBClassifier).
    model_for_explainer = model
    if hasattr(model, "named_steps") and "classifier" in model.named_steps:
        model_for_explainer = model.named_steps["classifier"]

    explainer = shap.TreeExplainer(
        model_for_explainer
    )

    print("Model loaded successfully")

except Exception as e:

    print(
        f"Error loading ML assets: {e}"
    )

    model = None
    preprocessor = None
    explainer = None


router = APIRouter(
    prefix="/predict",
    tags=["predict"]
)


# ==========================
# DATASET UPLOAD / LIST
# ==========================

ML_DIR = Path(__file__).resolve().parents[1] / "ml"
ML_DIR.mkdir(parents=True, exist_ok=True)

MODEL_FEATURES = [
    "tenure",
    "MonthlyCharges",
    "TotalCharges",
    "Contract",
    "PaymentMethod",
    "InternetService",
    "OnlineSecurity",
    "TechSupport",
    "PaperlessBilling",
]


def _prepare_dataset_for_model(df: pd.DataFrame) -> pd.DataFrame:
    prepared = df.copy()

    missing = [col for col in MODEL_FEATURES if col not in prepared.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing)}")

    numeric_cols = ["tenure", "MonthlyCharges", "TotalCharges"]
    for col in numeric_cols:
        prepared[col] = pd.to_numeric(prepared[col], errors="coerce").fillna(0)

    categorical_cols = [col for col in MODEL_FEATURES if col not in numeric_cols]
    for col in categorical_cols:
        prepared[col] = prepared[col].fillna("Unknown").astype(str)

    return prepared[MODEL_FEATURES]


def _predict_dataset(df: pd.DataFrame):
    if model is None:
        raise HTTPException(status_code=500, detail="Prediction model not loaded")

    prepared_df = _prepare_dataset_for_model(df)
    probabilities = model.predict_proba(prepared_df)[:, 1]
    predictions = ["Yes" if p >= 0.5 else "No" for p in probabilities]

    return probabilities, predictions


def _build_shap_values(input_df: pd.DataFrame) -> dict:
    if explainer is None or model is None:
        return {}

    try:
        if hasattr(model, "named_steps") and "preprocessor" in model.named_steps:
            preprocessor = model.named_steps["preprocessor"]
            transformed = preprocessor.transform(input_df)
            feature_names = [str(name) for name in preprocessor.get_feature_names_out()]
        else:
            transformed = input_df
            feature_names = [str(col) for col in input_df.columns]

        shap_vals = explainer.shap_values(transformed)

        if isinstance(shap_vals, list):
            shap_vals = shap_vals[1] if len(shap_vals) > 1 else shap_vals[0]

        values = np.asarray(shap_vals)
        if values.ndim == 3:
            values = values[:, 0, :]
        elif values.ndim > 2:
            values = values.reshape(values.shape[0], -1)

        if values.ndim == 1:
            values = values.reshape(1, -1)

        if values.shape[0] == 0:
            return {}

        sample_values = values[0]
        if len(sample_values) != len(feature_names):
            if len(sample_values) > len(feature_names):
                sample_values = sample_values[: len(feature_names)]
            else:
                feature_names = feature_names[: len(sample_values)]

        return {
            feature_name: float(value)
            for feature_name, value in zip(feature_names, sample_values)
        }
    except Exception as e:
        return {"error": str(e)}


@router.post("/datasets/upload")
def upload_dataset(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Upload a dataset CSV, save it, and analyze it with the trained churn model."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    dest = ML_DIR / file.filename

    try:
        with dest.open("wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    try:
        file.file.seek(0)
        dataset_df = pd.read_csv(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read uploaded CSV: {e}")

    try:
        probabilities, predictions = _predict_dataset(dataset_df)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {e}")

    high_risk = sum(1 for p in probabilities if p >= 0.7)
    churn_count = sum(1 for p in predictions if p == "Yes")

    top_risks = []
    for idx, (probability, prediction) in enumerate(zip(probabilities, predictions)):
        if len(top_risks) >= 5:
            break
        top_risks.append({
            "row": int(idx + 1),
            "prediction": prediction,
            "probability": round(float(probability), 4),
        })

    return {
        "filename": file.filename,
        "path": str(dest),
        "rows": int(len(dataset_df)),
        "predicted_churn": int(churn_count),
        "predicted_stay": int(len(dataset_df) - churn_count),
        "high_risk": int(high_risk),
        "average_probability": round(float(probabilities.mean()), 4),
        "top_risks": top_risks,
    }


@router.get("/datasets")
def list_datasets(current_user: User = Depends(get_current_user)):
    files = []
    for p in sorted(ML_DIR.glob("*.csv")):
        files.append({"name": p.name, "path": str(p), "size": p.stat().st_size})
    return files


@router.get("/history")
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .all()
    )
    return [
        {
            "id": row.id,
            "tenure": row.tenure,
            "monthly_charges": row.monthly_charges,
            "total_charges": row.total_charges,
            "contract": row.contract,
            "payment_method": row.payment_method,
            "internet_service": row.internet_service,
            "online_security": row.online_security,
            "tech_support": row.tech_support,
            "paperless_billing": row.paperless_billing,
            "churn_prediction": row.churn_prediction,
            "churn_probability": row.churn_probability,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]


@router.post(
    "/",
    response_model=PredictionResponse
)
def make_prediction(
    prediction: PredictionInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if model is None or preprocessor is None:
        raise HTTPException(
            status_code=500,
            detail="Prediction model not loaded"
        )

    input_df = pd.DataFrame([prediction.dict()])

    try:
        probability = float(
            model.predict_proba(input_df)[:, 1][0]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {e}"
        )

    prediction_label = (
        "Yes" if probability >= 0.5 else "No"
    )

    shap_values = _build_shap_values(input_df)

    new_prediction = Prediction(
        user_id=current_user.id,
        tenure=prediction.tenure,
        monthly_charges=prediction.MonthlyCharges,
        total_charges=prediction.TotalCharges,
        contract=prediction.Contract,
        payment_method=prediction.PaymentMethod,
        internet_service=prediction.InternetService,
        online_security=prediction.OnlineSecurity,
        tech_support=prediction.TechSupport,
        paperless_billing=prediction.PaperlessBilling,
        churn_prediction=prediction_label,
        churn_probability=probability
    )

    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)

    return PredictionResponse(
        prediction=prediction_label,
        probability=probability,
        shap_values=shap_values
    )
