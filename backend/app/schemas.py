# Pydantic schemas go here
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


# ==========================
# AUTH SCHEMAS
# ==========================

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# ==========================
# USER RESPONSE
# ==========================

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================
# PREDICTION INPUT
# ==========================

class PredictionInput(BaseModel):
    tenure: float
    MonthlyCharges: float
    TotalCharges: float

    Contract: str
    PaymentMethod: str
    InternetService: str
    OnlineSecurity: str
    TechSupport: str
    PaperlessBilling: str


# ==========================
# PREDICTION RESPONSE
# ==========================

class PredictionResponse(BaseModel):
    prediction: str
    probability: float
    shap_values: dict


# ==========================
# HISTORY RESPONSE
# ==========================

class HistoryResponse(BaseModel):
    id: int

    tenure: float
    monthly_charges: float
    total_charges: float

    contract: str
    payment_method: str
    internet_service: str
    online_security: str
    tech_support: str
    paperless_billing: str

    churn_prediction: str
    churn_probability: float

    created_at: datetime

    class Config:
        from_attributes = True