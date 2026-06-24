# Churn Prediction App — Complete AI Prompt Library
### Use these prompts in order, in any new Claude or ChatGPT chat

---

## HOW TO USE THIS FILE

1. Always start every new chat session with **Prompt 0 (Master Context)**
2. Then use prompts in order for each day
3. For errors, use the Debug prompts at the bottom
4. For interview prep, use the last section

---

---

# DAY 1 — ML MODEL

---

## Prompt 0 — Master Context (SEND THIS FIRST IN EVERY NEW CHAT)

```
I am a recent BTech Data Science graduate from India building a portfolio project to get a data science job in Germany. I am building a Customer Churn Prediction SaaS App.

Full tech stack:
- Frontend: React 18, React Router, Recharts, Axios
- Backend: FastAPI (Python 3.11), SQLAlchemy, PostgreSQL
- ML: XGBoost, SHAP, Scikit-learn, Pandas, Joblib
- Auth: JWT with python-jose and passlib bcrypt
- Deployment: Docker, Docker Compose, Render (free tier)

Project folder structure:
churn-app/
├── backend/app/ (main.py, models.py, schemas.py, auth.py, predict.py, database.py)
├── backend/ml/ (train.py, model.pkl, preprocessor.pkl)
├── frontend/src/pages/ (Login.jsx, Register.jsx, Dashboard.jsx, History.jsx)
├── frontend/src/components/ (UploadBox.jsx, ResultsTable.jsx, ShapChart.jsx, Navbar.jsx)
├── frontend/src/api.js
└── docker-compose.yml

Dataset: IBM Telco Customer Churn from Kaggle (7043 customers, 21 features)
Features used: tenure, MonthlyCharges, TotalCharges, Contract, PaymentMethod, InternetService, OnlineSecurity, TechSupport, PaperlessBilling

Keep this context for the entire conversation. I will ask you to build each file one by one.
```

---

## Prompt 1 — Generate train.py (ML training script)

```
Write the complete ml/train.py file for my churn prediction project.

Requirements:
1. Load data from data/WA_Fn-UseC_-Telco-Customer-Churn.csv
2. Clean data: convert TotalCharges to numeric, drop nulls, encode Churn as 0/1
3. Use these exact features: tenure, MonthlyCharges, TotalCharges, Contract, PaymentMethod, InternetService, OnlineSecurity, TechSupport, PaperlessBilling
4. Build a ColumnTransformer: StandardScaler for numeric, OneHotEncoder for categorical
5. Train XGBoost with: n_estimators=200, max_depth=5, learning_rate=0.05, scale_pos_weight=2
6. Print classification_report and ROC-AUC score
7. Verify SHAP TreeExplainer works on 5 test rows and print shape
8. Save model.pkl and preprocessor.pkl using joblib

Write the complete file with no placeholders. Add inline comments explaining each step.
```

---

## Prompt 2 — Understand SHAP (so you can explain it in interviews)

```
My XGBoost churn model is trained and SHAP is working.

Explain to me in simple terms:
1. What is a SHAP value and what does it mean in my churn context?
2. If Contract_Month-to-month has SHAP value +0.45 for a customer, what does that mean?
3. If tenure has SHAP value -0.30, what does that mean?
4. How would I explain this to a German interviewer who asks "why should I trust your model's predictions?"
5. What is the EU AI Act and why does SHAP explainability matter for German companies specifically?

Give me a simple 2-sentence answer for each that I can actually say in an interview.
```

---

---

# DAY 2 — BACKEND

---

## Prompt 3 — Generate database.py + models.py

```
Write the complete backend/app/database.py and backend/app/models.py files for my churn prediction app.

database.py requirements:
- SQLAlchemy connection using DATABASE_URL from environment variable
- Default fallback: postgresql://user:pass@localhost/churndb
- get_db() dependency function for FastAPI

models.py requirements:
- User table: id, email (unique), hashed_password, created_at
- Prediction table: id, user_id (FK to users), filename, total_customers, churn_count, churn_rate (float), result_json (Text), shap_json (Text), created_at

Write both complete files with no placeholders. Include all imports.
```

---

## Prompt 4 — Generate auth.py + predict.py

```
Write the complete backend/app/auth.py and backend/app/predict.py files.

auth.py requirements:
- JWT with python-jose, SECRET_KEY from env variable
- Token expires in 24 hours
- hash_password(), verify_password() using passlib bcrypt
- create_access_token() that encodes user id as "sub"
- decode_token() FastAPI dependency that returns user_id string
- Raise HTTP 401 if token is invalid or expired

predict.py requirements:
- Load model.pkl and preprocessor.pkl using joblib at startup (not on every request)
- Create SHAP TreeExplainer at startup
- FEATURES list: tenure, MonthlyCharges, TotalCharges, Contract, PaymentMethod, InternetService, OnlineSecurity, TechSupport, PaperlessBilling
- run_prediction(df) function:
  * Select only FEATURES columns from df
  * Transform with preprocessor
  * Get predict_proba for churn class (index 1)
  * Compute SHAP values for first 10 rows only (for speed)
  * Return top 8 SHAP features per customer sorted by absolute value
  * Risk level: High if prob > 0.7, Medium if > 0.4, Low otherwise
  * Return (results list, shap_data list)

Write both complete files with all imports and inline comments.
```

---

## Prompt 5 — Generate main.py (all API routes)

```
Write the complete backend/app/main.py for my churn prediction FastAPI app.

Requirements:
- Import from database, models, auth, predict
- Create all DB tables on startup using Base.metadata.create_all
- Add CORS middleware allowing all origins (for development)
- POST /register: takes email and password query params, check duplicate email, hash password, save user, return success message
- POST /login: verify email and password, return JWT access token and token type
- POST /predict: protected route (JWT required), accepts UploadFile CSV, reads with pandas, calls run_prediction(), saves full result to Prediction table, returns results + shap + prediction_id
- GET /history: protected route, returns all past predictions for current user
- GET /health: public route returning {"status": "ok"} for Render health checks

Write the complete file. Add a comment above each route explaining what it does.
```

---

## Prompt 6 — How to test backend with Postman

```
My FastAPI backend for the churn app is ready. Give me step-by-step Postman instructions to test all 5 routes before I build the frontend.

For each route give me:
1. Method and URL
2. Exact request body or params to use
3. What the successful response should look like
4. What to do if it fails

Routes to test:
- GET /health
- POST /register
- POST /login (and how to save the token for next requests)
- POST /predict (how to upload a CSV file in Postman)
- GET /history

Also tell me how to check data was saved in PostgreSQL using a simple psql command.
```

---

---

# DAY 3 — FRONTEND

---

## Prompt 7 — Setup React + generate api.js

```
Help me set up my React frontend for the churn prediction app.

1. Give me the exact terminal commands to create the React app and install all dependencies:
   - axios (API calls)
   - react-router-dom (routing)
   - recharts (charts)

2. Write the complete frontend/src/api.js file:
   - BASE_URL from process.env.REACT_APP_API_URL or http://localhost:8000
   - getHeaders() helper that reads token from localStorage
   - register(email, password) → POST /register
   - login(email, password) → POST /login, saves token to localStorage
   - logout() → removes token from localStorage
   - predict(file) → POST /predict with FormData
   - getHistory() → GET /history
   - isLoggedIn() → returns true if token exists in localStorage

Write the complete api.js file with no placeholders.
```

---

## Prompt 8 — Generate Login.jsx + Register.jsx

```
Write complete Login.jsx and Register.jsx pages for my React churn app.

Both pages:
- Centered card layout, clean minimal design, inline styles only
- Colors: background #f9f9f9, card white with border, button #1D9E75 green
- Email and password inputs with validation
- Show loading spinner while API call is running
- Show error message in red if login/register fails
- No form tags — use div with onClick handlers only

Login.jsx specific:
- On success: save token via api.login(), redirect to /dashboard using useNavigate
- Link to /register at the bottom
- "Use demo account" button that auto-fills demo@test.com / demo1234

Register.jsx specific:
- Confirm password field that validates both match before submitting
- On success: show "Registered! Redirecting to login..." then redirect after 2 seconds
- Link to /login at the bottom

Write both complete files with all imports.
```

---

## Prompt 9 — Generate Dashboard.jsx + UploadBox.jsx + ResultsTable.jsx

```
Write three complete React files for my churn app dashboard.

UploadBox.jsx:
- Drag and drop area + click to browse, accept .csv only
- Show filename after selection
- Show "Analysing customers..." spinner while prediction runs
- On file select call onUpload(file) prop
- Show error message if wrong file type or API fails

ResultsTable.jsx:
- Props: results (array), onSelect(index), selected (index)
- Summary stats at top: total customers, churn count, churn rate %
- Table columns: #, Churn probability (%), Prediction, Risk level
- Row colors: red for High risk, yellow for Medium, green for Low
- Clicking a row calls onSelect(index) and highlights it
- Hint text: "Click a row to see why this customer is at risk"

Dashboard.jsx:
- Protected route: redirect to /login if not logged in
- Show UploadBox when no results yet
- After prediction: show 3 summary metric cards, then ResultsTable, then ShapChart for selected row
- Logout button in top right corner

Write all three complete files with all imports.
```

---

---

# DAY 4 — SHAP CHART + DOCKER

---

## Prompt 10 — Generate ShapChart.jsx (MOST IMPORTANT FILE)

```
Write a complete ShapChart.jsx React component for my churn prediction app.

Props:
- data: array of {feature: string, value: number} (top 8 SHAP features for one customer)
- customerIndex: number
- churnProbability: number (0 to 1)

Requirements:
- Title: "Why customer #[index] is predicted to churn" or "...to stay"
- Subtitle: churn probability as percentage, red if > 50%, green if <= 50%
- Horizontal Recharts BarChart with layout="vertical"
- Positive SHAP bars (push toward churn): color #D85A30 orange-red
- Negative SHAP bars (push away from churn): color #378ADD blue
- Custom Tooltip: "Feature: [name] | Impact: [value] | [pushes toward/away from churn]"
- Legend: "Red = increases churn risk · Blue = reduces churn risk"
- Plain English summary below the chart generated dynamically from top positive and negative SHAP features. Example: "The biggest risk factor is this customer's month-to-month contract. Their long tenure of 48 months reduces the risk."

This is the most important component in the whole project. Make it fully functional and professional looking with clean inline styles.

Write the complete file with all imports.
```

---

## Prompt 11 — Generate History.jsx

```
Write a complete History.jsx page for my churn prediction React app.

Requirements:
- Protected route: redirect to /login if no token
- On mount: call getHistory() from api.js
- Show loading state while fetching
- Empty state if no predictions: "No predictions yet. Go to Dashboard to upload your first file."
- Table columns: Date, Filename, Total customers, Churners, Churn rate, Action
- Churn rate color: red if > 30%, yellow if > 15%, green if lower
- "Download results" button per row that converts result_json to CSV and downloads it
- "Back to Dashboard" link at the top

Write the complete file with all imports.
```

---

## Prompt 12 — Generate Docker files

```
Write all Docker configuration files for my churn prediction app.

1. backend/Dockerfile:
   - Base: python:3.11-slim
   - Install requirements.txt
   - Copy ml/ folder (model.pkl + preprocessor.pkl)
   - Copy app/ folder
   - Run uvicorn on port 8000

2. frontend/Dockerfile:
   - Base: node:18-alpine
   - Build React app with npm run build
   - Serve with nginx on port 80
   - Include nginx.conf that handles React Router (all routes return index.html)

3. docker-compose.yml:
   - Services: db (postgres:15), backend, frontend
   - db: POSTGRES_DB=churndb, POSTGRES_USER=user, POSTGRES_PASSWORD=password, port 5432, named volume pgdata
   - backend: build ./backend, port 8000, DATABASE_URL env var pointing to db, depends_on db
   - frontend: build ./frontend, port 3000:80, REACT_APP_API_URL=http://localhost:8000

Write all three complete files with comments on key lines.
```

---

---

# DAY 5 — DEPLOY + README

---

## Prompt 13 — Deploy to Render step by step

```
My churn prediction app is working locally with Docker. Now help me deploy it on Render free tier.

Give me exact step-by-step instructions for:
1. What to push to GitHub (folder structure, what to include/exclude in .gitignore)
2. Creating PostgreSQL database on Render free tier
3. Deploying the FastAPI backend as a Web Service on Render
4. Setting all environment variables on Render for the backend
5. Deploying the React frontend as a Static Site on Render
6. Setting REACT_APP_API_URL for the frontend
7. How to run the database migration (create tables) after deployment
8. How to test the live deployment end to end
9. How to keep the free tier alive using UptimeRobot (so it doesn't sleep during my demo)

Give exact clicks, settings, and commands for each step.
```

---

## Prompt 14 — Generate complete README.md

```
Write a professional README.md for my Customer Churn Prediction SaaS app.

My project facts:
- Live URL: [YOUR_RENDER_URL]
- GitHub: [YOUR_GITHUB_URL]
- Model: XGBoost, ROC-AUC 0.86, Accuracy 82%
- Stack: React, FastAPI, PostgreSQL, Docker, SHAP, XGBoost
- Dataset: IBM Telco Churn (7043 customers)
- Demo login: demo@test.com / demo1234

Include these sections:
1. Header with live demo badge, tech stack badges (shields.io), demo video link
2. Business problem — why churn matters, 5x cost of acquiring vs retaining
3. Key features list with icons
4. Why SHAP explainability matters — mention EU AI Act and German company requirements
5. Tech stack table
6. Model performance table (Accuracy, ROC-AUC, Precision, Recall, Dataset size)
7. Screenshots section (3 placeholder tags)
8. Run locally — exact Docker commands
9. API endpoints table
10. Project folder structure tree
11. What I learned section

Tone: confident, professional, junior developer who understands what they built and why.
```

---

## Prompt 15 — Generate demo test CSV

```
Generate a realistic sample CSV I can use to demo my churn prediction app.

Requirements:
- 20 rows of realistic customer data
- Columns must exactly match: tenure, MonthlyCharges, TotalCharges, Contract, PaymentMethod, InternetService, OnlineSecurity, TechSupport, PaperlessBilling
- Valid values:
  * Contract: "Month-to-month", "One year", "Two year"
  * PaymentMethod: "Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"
  * InternetService: "DSL", "Fiber optic", "No"
  * OnlineSecurity, TechSupport: "Yes", "No", "No internet service"
  * PaperlessBilling: "Yes", "No"
  * tenure: 1 to 72
  * MonthlyCharges: 20.00 to 120.00
  * TotalCharges: roughly tenure x MonthlyCharges
- Mix clearly: some high churn risk customers (month-to-month, high charges, low tenure) and some low risk (two year contract, long tenure, lower charges)

Output the complete CSV content I can save directly as demo_customers.csv
```

---

---

# DEBUG PROMPTS — USE WHEN YOU HIT ERRORS

---

## Debug 1 — Fix any Python or FastAPI error

```
I am building a Customer Churn Prediction app with FastAPI and React. I have this error:

[PASTE YOUR FULL ERROR MESSAGE HERE]

This error is in this file: [FILE NAME]

Here is my current code:
[PASTE YOUR FULL FILE CODE HERE]

Fix the error and give me the complete corrected file. Explain in 1 sentence what caused the error.
```

---

## Debug 2 — Fix CORS errors (very common)

```
My React frontend is getting a CORS error calling my FastAPI backend.

Browser console error:
[PASTE CORS ERROR HERE]

My current CORS setup in main.py:
[PASTE YOUR CORS CODE]

React is on http://localhost:3000
FastAPI is on http://localhost:8000

Fix the CORS configuration. Give me the complete corrected section and tell me if I need to change anything in React too.
```

---

## Debug 3 — Fix SHAP or XGBoost errors

```
I am getting an error with SHAP or XGBoost in my churn prediction project.

Error message:
[PASTE ERROR HERE]

My current predict.py:
[PASTE YOUR predict.py]

Features: tenure, MonthlyCharges, TotalCharges, Contract, PaymentMethod, InternetService, OnlineSecurity, TechSupport, PaperlessBilling

Preprocessor: ColumnTransformer with StandardScaler for numeric and OneHotEncoder for categorical.

Fix the error and give me the complete corrected predict.py. If it is a version mismatch between training and loading, tell me the exact fix.
```

---

## Debug 4 — Fix Docker errors

```
I am getting this error running Docker for my churn app:

[PASTE FULL DOCKER ERROR OR RENDER DEPLOY LOG]

My docker-compose.yml:
[PASTE YOUR docker-compose.yml]

My backend Dockerfile:
[PASTE YOUR backend/Dockerfile]

Tell me exactly what is wrong and give me the corrected files. Also tell me how to verify the fix worked.
```

---

## Debug 5 — React component not working

```
My React component is not working correctly. Here is the problem:

[DESCRIBE WHAT IS WRONG — e.g. "SHAP chart is not showing", "CSV upload gives no response", "login redirects to wrong page"]

Here is the component code:
[PASTE YOUR COMPONENT CODE]

Here is the API response I am getting (check browser Network tab):
[PASTE API RESPONSE]

Fix the component and give me the complete corrected file. Explain what was wrong.
```

---

---

# INTERVIEW PREP PROMPTS

---

## Interview Prep 1 — Practice technical questions

```
I built a Customer Churn Prediction SaaS app with XGBoost, SHAP, FastAPI, React, PostgreSQL and Docker. I am preparing for data science job interviews at German companies like Zalando, Delivery Hero, SAP, and N26.

Ask me 10 realistic technical interview questions about this project — mix of ML, backend, frontend, and system design questions.

After I answer each one, tell me:
1. Was my answer good or what did I miss?
2. The ideal answer in 3-4 sentences

Start with question 1 only and wait for my answer before asking the next one.
```

---

## Interview Prep 2 — Build your 2-minute pitch

```
Help me write a 2-minute verbal pitch for my Customer Churn Prediction project for German data science interviews.

Project facts:
- XGBoost model: ROC-AUC 0.86, Accuracy 82%
- SHAP explainability showing why each customer is at risk
- Full stack: React, FastAPI, PostgreSQL, Docker, deployed on Render
- Dataset: IBM Telco (7043 customers)
- Relevant to EU AI Act explainability requirements in Germany

Write a natural, confident 2-minute pitch that:
1. Starts with the business problem — not the technology
2. Explains what I built simply
3. Highlights SHAP explainability as the key differentiator
4. Mentions tech stack naturally (not as a list)
5. Ends with what I learned

Write it in first person as natural speech. No bullet points. Conversational, not like a presentation.
```

---

## Interview Prep 3 — Understand any concept deeply

```
I used [REPLACE WITH CONCEPT — e.g. XGBoost / JWT / SHAP / Docker / ColumnTransformer / ROC-AUC] in my churn project but want to truly understand it before my interview.

Explain it 3 ways:
1. Simple analogy — explain like I am 15 years old
2. Technical definition — 2 to 3 sentences
3. How it specifically works in MY churn app — reference my actual code and data

Then give me 2 interview questions a German company might ask about this concept and the ideal answer for each.
```

---

## Interview Prep 4 — Prepare for "tell me about yourself"

```
I am a recent BTech Data Science graduate from India applying for data science jobs in Germany. I have no work experience but I built a Customer Churn Prediction SaaS app as my main portfolio project.

Write me a strong 60-second "tell me about yourself" answer for German job interviews that:
1. Mentions my BTech in Data Science
2. Explains why I built the churn project and what it does
3. Highlights my key technical skills: Python, XGBoost, SHAP, FastAPI, React, Docker
4. Expresses genuine interest in working in Germany
5. Ends with why I am a good fit for a junior data science role

Keep it natural, confident, and honest. No exaggeration.
```

---

---

# GOLDEN RULES — READ THESE

1. Always send Prompt 0 (Master Context) at the start of every new chat
2. Build and test one file before moving to the next
3. Read every file Claude writes — even 10 minutes of reading is enough
4. Paste your full error message when debugging — never paraphrase it
5. The SHAP chart (Prompt 10) is the most important file — spend extra time on it
6. Deploy early (Day 5) so you have a live URL to share in applications
7. Record your demo video on Loom (free) — a video beats a GitHub link every time

---

*Built for: Customer Churn Prediction App — Germany Data Science Job Hunt*