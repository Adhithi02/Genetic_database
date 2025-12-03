from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("SQLDATABASE_URL", "postgresql://user:password@localhost/dbname")
MONGODB_URI = os.getenv("NoSQLDATABASE_URL", "mongodb://localhost:27017")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,   # Recycle connections after 1 hour
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

mongo_client = MongoClient(MONGODB_URI)
mongo_db = mongo_client["genetic_risk"]
metadata_collection = mongo_db["model_metadata"]
genetic_inputs_collection = mongo_db["genetic_inputs"]
