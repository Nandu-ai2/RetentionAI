# Customer Churn Prediction SaaS App

A full-stack churn prediction application with:
- React + Vite frontend
- FastAPI backend
- XGBoost-based churn model
- SHAP feature impact visualization
- Dataset upload and analysis
- Prediction history

## Run locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Docker

### Backend
```bash
docker build -t churn-backend ./backend
docker run -p 8000:8000 churn-backend
```

### Frontend
```bash
docker build -t churn-frontend ./frontend
docker run -p 5173:5173 churn-frontend
```

## Deployment notes
- Backend API expects to run on port 8000
- Frontend expects to reach the backend at http://localhost:8000
- For production hosting, replace the local API base URL in the frontend with your deployed backend URL
