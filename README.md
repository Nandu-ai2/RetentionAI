# RetentionAI - Customer Churn Prediction Platform

RetentionAI is a full-stack machine learning web application that predicts whether a customer is likely to churn based on service usage and account information. The application combines a FastAPI backend, React frontend, PostgreSQL database, and an XGBoost machine learning model to provide accurate churn predictions along with feature importance explanations using SHAP.

The goal of this project is to help businesses identify customers who are at risk of leaving so they can take proactive retention measures.

---

# Live Demo

**Frontend**

https://customer-retention-ai-crx5.onrender.com

**Backend API**

https://retention-ai-backend-gcul.onrender.com/docs

---

# Project Overview

Customer churn is one of the biggest challenges faced by subscription-based businesses such as telecom companies, banks, SaaS products, and online services.

Instead of manually analyzing customer behavior, this application uses Machine Learning to estimate the probability that a customer will leave based on several important attributes.

The application also explains *why* a prediction was made using SHAP values, making the model more transparent and easier to understand.

---

# Features

## Authentication

* User Registration
* Secure Login
* JWT Authentication
* Protected API Routes
* Password Hashing using bcrypt

---

## Customer Prediction

Predict customer churn using the following information:

* Customer tenure
* Monthly charges
* Total charges
* Contract type
* Payment method
* Internet service
* Online security
* Tech support
* Paperless billing

Output includes:

* Churn Prediction (Yes / No)
* Churn Probability
* SHAP Feature Importance

---

## Dataset Upload

Users can upload CSV files containing multiple customers.

The application automatically:

* Validates the dataset
* Runs predictions for every customer
* Calculates:

  * Total customers
  * Expected churn customers
  * Customers likely to stay
  * High-risk customers
  * Average churn probability

---

## Prediction History

Every prediction is stored inside PostgreSQL.

Users can later review:

* Customer details
* Prediction result
* Churn probability
* Date and time

---

## Explainable AI

The application uses SHAP (SHapley Additive exPlanations) to explain the prediction made by the machine learning model.

Instead of simply saying a customer will churn, it shows which features contributed the most.

---

# Machine Learning Model

Algorithm:

* XGBoost Classifier

Dataset:

IBM Telco Customer Churn Dataset

Libraries Used:

* Pandas
* NumPy
* Scikit-learn
* XGBoost
* SHAP
* Joblib

---

# Technology Stack

## Frontend

* React
* React Router
* Axios
* CSS3

## Backend

* FastAPI
* SQLAlchemy
* Uvicorn
* JWT Authentication
* Passlib
* Python-Jose

## Database

PostgreSQL

## Machine Learning

* XGBoost
* SHAP
* Scikit-learn
* Pandas
* NumPy

## Deployment

* Render
* GitHub

---

# Project Structure

```
RetentionAI
│
├── backend
│   ├── app
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── predict.py
│   │   ├── schemas.py
│   │   └── ...
│   │
│   ├── ml
│   │   ├── model.pkl
│   │   ├── preprocessor.pkl
│   │   └── train.py
│   │
│   └── requirements.txt
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── api.js
│   │   └── ...
│   │
│   └── package.json
│
└── README.md
```

---

# Application Workflow

```
User Login
      │
      ▼
JWT Authentication
      │
      ▼
Dashboard
      │
      ▼
Enter Customer Details
      │
      ▼
FastAPI API
      │
      ▼
Machine Learning Model
      │
      ▼
Prediction + SHAP Values
      │
      ▼
Save Prediction
      │
      ▼
Prediction History
```

---

# REST API

## Authentication

```
POST /register
POST /login
GET  /me
```

## Prediction

```
POST /predict
GET  /predict/history
```

## Dataset

```
POST /predict/datasets/upload
GET  /predict/datasets
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Nandu-ai2/RetentionAI.git
cd RetentionAI
```

## Backend

```bash
cd backend

python -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Environment Variables

Backend

```
DATABASE_URL=

SECRET_KEY=

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60

MODEL_PATH=ml/model.pkl

PREPROCESSOR_PATH=ml/preprocessor.pkl
```

Frontend

```
VITE_API_BASE_URL=https://retention-ai-backend-gcul.onrender.com
```

---

# Future Improvements

* Customer management dashboard
* Role-based authentication
* Email notifications
* Model retraining pipeline
* Prediction reports in PDF
* Advanced analytics dashboard
* Docker deployment
* CI/CD pipeline
* Model monitoring
* Multi-model comparison

---

# Screenshots

Include screenshots of:

* Login Page
* Dashboard
* Prediction Result
* SHAP Feature Impact
* CSV Upload
* History Page
* Settings Page

---

# Learning Outcomes

This project helped me gain practical experience with:

* Building REST APIs using FastAPI
* JWT Authentication
* PostgreSQL integration
* Machine Learning model deployment
* Explainable AI using SHAP
* React frontend development
* API integration using Axios
* Full-stack application deployment on Render

---

# Author

**Kesireddy Rupa Srinivasa Sai Manikanta**

B.Tech (Data Science)
kesireddynandu004@gmail.com
Passionate about Machine Learning, Data Analytics, AI, and Full-Stack Development.

Feel free to connect and share your feedback.
