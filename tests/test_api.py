import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 404 # No root route defined

def test_auth_missing_token():
    response = client.get("/queues")
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}

def test_login_invalid_credentials():
    response = client.post("/auth/login", data={"username": "wrong", "password": "wrong"})
    assert response.status_code == 401
