# XGBoost training pipeline goes here
import pandas as pd
import joblib
import pickle

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score

from xgboost import XGBClassifier

# ==========================
# LOAD DATA
# ==========================

df = pd.read_csv(
    "ml/WA_Fn-UseC_-Telco-Customer-Churn.csv"
)

# ==========================
# CLEAN DATA
# ==========================

df["TotalCharges"] = pd.to_numeric(
    df["TotalCharges"],
    errors="coerce"
)

df = df.dropna()

# ==========================
# SELECT FEATURES
# ==========================

features = [
    "tenure",
    "MonthlyCharges",
    "TotalCharges",
    "Contract",
    "PaymentMethod",
    "InternetService",
    "OnlineSecurity",
    "TechSupport",
    "PaperlessBilling"
]

target = "Churn"

X = df[features]

y = df[target].map({
    "No": 0,
    "Yes": 1
})

# ==========================
# CATEGORICAL FEATURES
# ==========================

categorical_features = [
    "Contract",
    "PaymentMethod",
    "InternetService",
    "OnlineSecurity",
    "TechSupport",
    "PaperlessBilling"
]

numeric_features = [
    "tenure",
    "MonthlyCharges",
    "TotalCharges"
]

# ==========================
# PREPROCESSOR
# ==========================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "cat",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features
        )
    ],
    remainder="passthrough"
)

# ==========================
# TRAIN TEST SPLIT
# ==========================

X_train, X_test, y_train, y_test = (
    train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )
)

# ==========================
# MODEL PIPELINE
# ==========================

model = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "classifier",
            XGBClassifier(
                n_estimators=200,
                max_depth=4,
                learning_rate=0.05,
                random_state=42
            )
        )
    ]
)

# ==========================
# TRAIN
# ==========================

model.fit(
    X_train,
    y_train
)

# ==========================
# EVALUATE
# ==========================

predictions = model.predict(
    X_test
)

accuracy = accuracy_score(
    y_test,
    predictions
)

print(
    f"Accuracy: {accuracy:.4f}"
)

# ==========================
# SAVE MODEL
# ==========================


with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

# Save preprocessor separately

joblib.dump(
    preprocessor,
    "preprocessor.pkl"
)

print(
    "Model saved successfully."
)