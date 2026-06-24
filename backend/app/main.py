import os
from datetime import timedelta

from fastapi import FastAPI
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from .database import engine
from .database import Base
from .database import get_db

from .models import User, Prediction

from .schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token
)

from .auth import (
    hash_password,
    authenticate_user,
    create_access_token,
    get_current_user
)

from .predict import router as predict_router

# =====================================
# CREATE DATABASE TABLES
# =====================================

Base.metadata.create_all(bind=engine)

# =====================================
# FASTAPI APP
# =====================================

app = FastAPI(
    title="Customer Churn Prediction API",
    version="1.0.0"
)

# =====================================
# CORS
# =====================================

origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# HEALTH CHECK
# =====================================

@app.get("/")
def root():
    return {
        "message":
        "Customer Churn Prediction API Running"
    }

# =====================================
# REGISTER
# =====================================

@app.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    print("=" * 50)
    print("REGISTER REQUEST")
    print("USERNAME:", user.username)
    print("EMAIL:", user.email)
    print("PASSWORD:", user.password)
    print("PASSWORD LENGTH:", len(user.password))
    print("=" * 50)

    existing_email = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    existing_username = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    hashed_password = hash_password(
        user.password
    )

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# =====================================
# LOGIN
# =====================================

@app.post(
    "/login",
    response_model=Token
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    authenticated_user = (
        authenticate_user(
            user.email,
            user.password,
            db
        )
    )

    if not authenticated_user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = (
        create_access_token(
            data={
                "sub":
                authenticated_user.email
            }
        )
    )

    return {
        "access_token":
        access_token,

        "token_type":
        "bearer"
    }

# =====================================
# INCLUDE ML ROUTES
# =====================================

app.include_router(
    predict_router
)