from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("SQLDATABASE_URL", "postgresql://user:password@localhost/dbname")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# MongoDB is optional (only used by legacy scripts)
try:
    from pymongo import MongoClient
    MONGODB_URI = os.getenv("NoSQLDATABASE_URL", "mongodb://localhost:27017")
    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
    mongo_db = mongo_client["genetic_risk"]
    metadata_collection = mongo_db["model_metadata"]
    genetic_inputs_collection = mongo_db["genetic_inputs"]
except Exception:
    print("[Startup] MongoDB not available. Running in local-only mode.")
    metadata_collection = None
    genetic_inputs_collection = None

