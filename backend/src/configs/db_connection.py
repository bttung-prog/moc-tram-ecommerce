import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DB_URL = os.getenv("DB_URL")

engine = create_engine(
    DB_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False
)

def check_db_connection():
    try:
        with engine.connect() as connection:
            print("Connect db successfully!")
    except Exception as e:
        print("Error connecting to database: ", e)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()