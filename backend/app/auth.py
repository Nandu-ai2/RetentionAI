# JWT auth logic goes here

from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session

from dotenv import load_dotenv
import os

from .database import get_db
from .models import User

load_dotenv()

# ==========================================
# ENV VARIABLES
# ==========================================

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        60
    )
)

# ==========================================
# PASSWORD HASHING
# ==========================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# ==========================================
# TOKEN AUTH
# ==========================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)

# ==========================================
# PASSWORD FUNCTIONS
# ==========================================

def hash_password(password: str):

    if not password:
        raise ValueError(
            "Password cannot be empty"
        )

    print(
        f"Password Length: {len(password)}"
    )

    password = str(password).strip()

    password = password[:72]

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
):

    plain_password = str(
        plain_password
    ).strip()

    plain_password = plain_password[:72]

    return pwd_context.verify(
        plain_password,
        hashed_password
    )

# ==========================================
# JWT TOKEN CREATION
# ==========================================

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
):

    to_encode = data.copy()

    if expires_delta:

        expire = (
            datetime.utcnow()
            + expires_delta
        )

    else:

        expire = (
            datetime.utcnow()
            + timedelta(
                minutes=
                ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )

    to_encode.update(
        {"exp": expire}
    )

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt

# ==========================================
# AUTHENTICATE USER
# ==========================================

def authenticate_user(
    email: str,
    password: str,
    db: Session
):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return False

    if not verify_password(
        password,
        user.hashed_password
    ):
        return False

    return user

# ==========================================
# GET CURRENT USER
# ==========================================

def get_current_user(
    token: str = Depends(
        oauth2_scheme
    ),
    db: Session = Depends(
        get_db
    )
):

    credentials_exception = (
        HTTPException(
            status_code=
            status.HTTP_401_UNAUTHORIZED,
            detail=
            "Invalid authentication credentials",
            headers={
                "WWW-Authenticate":
                "Bearer"
            },
        )
    )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[
                ALGORITHM
            ]
        )

        email: str = payload.get(
            "sub"
        )

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user is None:
        raise credentials_exception

    return user

# ==========================================
# ACTIVE USER CHECK
# ==========================================

def get_current_active_user(
    current_user: User = Depends(
        get_current_user
    )
):

    if not current_user.is_active:

        raise HTTPException(
            status_code=400,
            detail="Inactive user"
        )

    return current_user