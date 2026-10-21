import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import app
from app.seed.seed_data import seed_database

# Sử dụng test database SQLite riêng biệt
TEST_DB_URL = "sqlite:///./test_zen_agarwood.db"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Tạo schema và nạp dữ liệu mẫu trước khi chạy test suite."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield

    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_zen_agarwood.db"):
        try:
            os.remove("./test_zen_agarwood.db")
        except:
            pass


@pytest.fixture
def db_session():
    """Tạo database session riêng cho từng test case."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    """Cung cấp TestClient với database override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
