import time
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.core.rate_limit import (
    limiter,
    InMemorySlidingWindowStore,
    extract_client_ip,
    get_client_identifier,
    resolve_endpoint_category,
    anonymize_client_id
)
from app.core.security import create_access_token


@pytest.fixture(autouse=True)
def mock_smtp_background():
    """Mock background email dispatching so rate limit tests run instantly without network lag."""
    with patch("app.api.v1.auth.send_otp_email", return_value=True):
        yield


@pytest.fixture(autouse=True)
def reset_limiter_store():
    """Reset the limiter store before each test."""
    limiter.store.reset()
    yield
    limiter.store.reset()


@pytest.fixture
def client():
    return TestClient(app)


def test_requests_below_limit_succeed_with_rate_limit_headers(client):
    """1. Requests below configured limit succeed and contain rate-limit headers."""
    response = client.get("/api/v1/jobs")
    # Even if unauthenticated, it should return headers and not 429
    assert response.status_code != 429
    assert "x-ratelimit-limit" in response.headers
    assert "x-ratelimit-remaining" in response.headers
    assert "x-ratelimit-reset" in response.headers


def test_requests_exceeding_limit_return_429(client):
    """2. Requests exceeding limit return HTTP 429 with Retry-After and retry_after payload."""
    login_limit = settings.RATE_LIMIT_LOGIN_LIMIT  # Default: 5

    # Consume allowed quota
    for i in range(login_limit):
        res = client.post("/api/v1/auth/login", json={"email_or_app_id": f"test_{i}@example.com", "password": "wrong"})
        assert res.status_code != 429

    # Next request must be rate limited
    blocked_res = client.post("/api/v1/auth/login", json={"email_or_app_id": "test_exceed@example.com", "password": "wrong"})
    assert blocked_res.status_code == 429

    # Verify headers and response structure
    assert "retry-after" in blocked_res.headers
    assert int(blocked_res.headers["retry-after"]) >= 1
    assert blocked_res.headers["x-ratelimit-remaining"] == "0"

    data = blocked_res.json()
    assert "detail" in data
    assert "retry_after" in data
    assert "login" in data["detail"].lower()


def test_limits_reset_or_expire_correctly():
    """3. Sliding window limits expire properly after window duration."""
    store = InMemorySlidingWindowStore()
    key = "ip:10.0.0.1"
    category = "test_cat"
    limit = 2
    window = 1  # 1 second window

    # 1st and 2nd allowed
    ok1, rem1, _, _ = store.check_and_increment(key, category, limit, window)
    ok2, rem2, _, _ = store.check_and_increment(key, category, limit, window)
    assert ok1 is True and rem1 == 1
    assert ok2 is True and rem2 == 0

    # 3rd blocked
    ok3, _, retry_after, _ = store.check_and_increment(key, category, limit, window)
    assert ok3 is False
    assert retry_after >= 1

    # Wait for window to expire
    time.sleep(1.1)

    # Next request must now be allowed
    ok4, rem4, _, _ = store.check_and_increment(key, category, limit, window)
    assert ok4 is True
    assert rem4 == 1


def test_different_users_have_independent_limits(client):
    """4. Different authenticated users or different IPs have independent rate limit quotas."""
    token_user_a = create_access_token({"sub": "user_111111111111111111111111", "role": "student"})
    token_user_b = create_access_token({"sub": "user_222222222222222222222222", "role": "student"})

    headers_a = {"Authorization": f"Bearer {token_user_a}"}
    headers_b = {"Authorization": f"Bearer {token_user_b}"}

    # Consume all login limit quota for user A
    for _ in range(settings.RATE_LIMIT_LOGIN_LIMIT):
        client.post("/api/v1/auth/login", headers=headers_a, json={"email_or_app_id": "a@test.com", "password": "x"})

    # User A blocked
    blocked_a = client.post("/api/v1/auth/login", headers=headers_a, json={"email_or_app_id": "a@test.com", "password": "x"})
    assert blocked_a.status_code == 429

    # User B should NOT be blocked
    allowed_b = client.post("/api/v1/auth/login", headers=headers_b, json={"email_or_app_id": "b@test.com", "password": "x"})
    assert allowed_b.status_code != 429


def test_unauthenticated_requests_protected_by_ip(client):
    """5. Unauthenticated requests are isolated and limited by their IP address."""
    otp_gen_limit = settings.RATE_LIMIT_OTP_GEN_LIMIT  # Default: 3

    for _ in range(otp_gen_limit):
        res = client.post("/api/v1/auth/send-otp", json={"email": "student@example.com"})
        assert res.status_code != 429

    # 4th request must be rate limited by IP
    blocked = client.post("/api/v1/auth/send-otp", json={"email": "student@example.com"})
    assert blocked.status_code == 429
    assert "otp_gen" in blocked.json()["detail"]


def test_sensitive_endpoints_receive_intended_policies():
    """6. Ensure specific sensitive endpoint categories resolve to distinct limits."""
    assert resolve_endpoint_category("/api/v1/auth/login", "POST") == "login"
    assert resolve_endpoint_category("/api/v1/auth/register", "POST") == "register"
    assert resolve_endpoint_category("/api/v1/auth/send-otp", "POST") == "otp_gen"
    assert resolve_endpoint_category("/api/v1/auth/verify-otp", "POST") == "otp_verify"
    assert resolve_endpoint_category("/api/v1/auth/forgot-password", "POST") == "forgot_password"
    assert resolve_endpoint_category("/api/v1/auth/reset-password", "POST") == "reset_password"
    assert resolve_endpoint_category("/api/v1/resume/upload", "POST") == "resume_upload"
    assert resolve_endpoint_category("/api/v1/recruiter/interviews", "POST") == "ai_mock_interview"
    assert resolve_endpoint_category("/api/v1/roadmap/my-roadmap", "GET") == "ai_analysis"
    assert resolve_endpoint_category("/api/v1/jobs", "GET") == "general"


def test_disabled_rate_limiting_allows_excess_requests(client):
    """7. When RATE_LIMIT_ENABLED is False, requests exceeding limits are allowed."""
    with patch.object(settings, "RATE_LIMIT_ENABLED", False):
        # Exceed login limit many times
        for _ in range(settings.RATE_LIMIT_LOGIN_LIMIT + 3):
            res = client.post("/api/v1/auth/login", json={"email_or_app_id": "admin@test.com", "password": "x"})
            assert res.status_code != 429


def test_storage_failure_fails_open_gracefully(client):
    """8. Storage failure does not crash requests (fails open for availability)."""
    with patch.object(limiter.store, "check_and_increment", side_effect=Exception("Database down")):
        res = client.get("/api/v1/jobs")
        # Should not throw 500 or 429
        assert res.status_code != 429
        assert res.status_code != 500


def test_anti_spoofing_untrusted_proxy_headers():
    """9. Headers like X-Forwarded-For are rejected if peer socket IP is untrusted."""
    mock_request = MagicMock()
    mock_request.client.host = "203.0.113.50"  # Public untrusted client
    mock_request.headers = {"x-forwarded-for": "1.2.3.4, 5.6.7.8"}

    trusted = {"127.0.0.1", "::1"}
    ip = extract_client_ip(mock_request, trusted)
    # Must use real peer IP (203.0.113.50), not spoofed X-Forwarded-For
    assert ip == "203.0.113.50"


def test_trusted_proxy_headers_parsed_safely():
    """10. Headers like X-Forwarded-For are safely parsed when peer is a trusted reverse proxy."""
    mock_request = MagicMock()
    mock_request.client.host = "127.0.0.1"  # Local Nginx reverse proxy
    mock_request.headers = {"x-forwarded-for": "198.51.100.22, 127.0.0.1"}

    trusted = {"127.0.0.1", "::1"}
    ip = extract_client_ip(mock_request, trusted)
    assert ip == "198.51.100.22"


def test_anonymize_client_id_masking():
    """11. Anonymization masks sensitive IPv4, IPv6, and User IDs for logs."""
    assert anonymize_client_id("ip:192.168.1.55") == "ip:192.168.***.***"
    assert "usr:" in anonymize_client_id("usr:6724a0000000000000000001")
    assert "672" in anonymize_client_id("usr:6724a0000000000000000001")
    assert "001" in anonymize_client_id("usr:6724a0000000000000000001")
    assert anonymize_client_id("usr:6724a0000000000000000001") != "usr:6724a0000000000000000001"
