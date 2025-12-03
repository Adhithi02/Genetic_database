End-to-End Setup & Run Guide
Create Accounts
Postgres (Neon)
Sign up at https://console.neon.tech. Create a project + branch (defaults fine). Note generated connection string (postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require). Keep user, password, host, database name handy.
MongoDB Atlas
Sign up at https://www.mongodb.com/atlas/database. Create free cluster, user, and IP access (allow current IP). Keep the SRV URI (mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority) ready.
Local Environment
Install Python 3.12+ (if not already).
From repo root, create venv and install deps:
requirements.txt already includes SQLAlchemy, FastAPI, Uvicorn, scikit-learn, etc., so no manual install needed.
Database Preparation
In Neon, connect via psql or GUI and run migrations to add the tables: simplest is to let SQLAlchemy create them:
(This script needs env vars set first; see next step.)
Ensure Mongo Atlas cluster has database genetic_risk (auto-created on first insert).
Environment Variables
In project root, create .env (used by database.py via os.getenv), e.g.:
Replace placeholders with real credentials. The SQL URL must include +psycopg2 so SQLAlchemy loads the Postgres driver.
Train Once Offline
Activate venv and run the new pipeline to clean the dataset, populate SQL, train, and store the model metadata in Mongo:
Confirm Mongo Atlas genetic_risk.model_metadata now has a document (via Atlas Data Explorer).
Run Backend
From backend folder (still in venv):
/init/ will simply confirm the cached model; /predict/ handles incoming requests.
Run Frontend
In another terminal:
Ensure the frontend’s API URL points to http://localhost:8000 (already in inputForm.js).
Workflow Summary
Any time the dataset changes, rerun train_pipeline.py to refresh the model metadata.
Backend fetches the latest model from Mongo at startup; predictions are stored in Postgres, raw inputs + derived features in Mongo, and results are shown instantly on the React app.
Verification Steps
Optional: call curl http://localhost:8000/init/ to verify model id is available.
Submit a form via frontend; check Postgres tables (patient, prediction) and Mongo genetic_inputs to confirm data flow end-to-end.
Let me know if you need help wiring the .env file on Windows or creating Neon/Atlas users with least privilege.