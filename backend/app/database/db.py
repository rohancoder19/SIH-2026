from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pymongo import MongoClient
from app.config.settings import settings

# 1. Relational / SQLite / PostGIS Engine
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 2. MongoDB Atlas Connection
try:
    mongo_client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=5000)
    mongo_db = mongo_client.get_database("surakshitsthan")
    # Quick connectivity check
    ping_res = mongo_client.admin.command('ping')
    mongo_connected = ping_res.get('ok') == 1
except Exception as e:
    mongo_client = None
    mongo_db = None
    mongo_connected = False
    print(f"MongoDB connection warning: {e}")

def get_mongo_db():
    return mongo_db
