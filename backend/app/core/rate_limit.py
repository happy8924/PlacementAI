"""
Centralized Rate Limiting Module for PlacementAI
------------------------------------------------
Provides production-oriented rate limiting using a sliding window algorithm.
Supports IP-based limits for unauthenticated traffic and User-based limits
for authenticated requests (preventing IP-spoofing bypasses).

STORAGE ARCHITECTURE & DEPLOYMENT LIMITATIONS:
----------------------------------------------
- InMemorySlidingWindowStore (Default):
  Maintains timestamp deques in local process memory using reentrant thread locks.
  Limitation: When running multiple Uvicorn workers (--workers N) or multiple
  container replicas without sticky sessions, counters are local to each worker.
- RedisRateLimitStore:
  Enables distributed multi-instance rate limiting via Redis sorted sets.
  Activated automatically if REDIS_URL is configured and redis-py is installed.
"""

import time
import math
import logging
import threading
from abc import ABC, abstractmethod
from typing import Tuple, Dict, List, Optional, Set, Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from fastapi import Request, Response, HTTPException, status

from app.core.config import settings
from app.core.security import decode_access_token

logger = logging.getLogger("placementai.rate_limit")


def anonymize_client_id(client_id: str) -> str:
    """Mask client identifier for safe logging without leaking sensitive IP or token data."""
    if client_id.startswith("ip:"):
        ip_part = client_id[3:]
        if "." in ip_part:
            parts = ip_part.split(".")
            if len(parts) == 4:
                return f"ip:{parts[0]}.{parts[1]}.***.***"
        elif ":" in ip_part:
            parts = ip_part.split(":")
            return f"ip:{parts[0]}:***:***"
        return "ip:masked"
    elif client_id.startswith("usr:"):
        usr_part = client_id[4:]
        if len(usr_part) > 6:
            return f"usr:{usr_part[:3]}...{usr_part[-3:]}"
        return f"usr:{usr_part[:2]}***"
    return "client:masked"


# ─────────────────────────────────────────────────────────
# Rate Limit Store Abstraction
# ─────────────────────────────────────────────────────────

class RateLimitStore(ABC):
    @abstractmethod
    def check_and_increment(
        self, key: str, category: str, limit: int, window: int
    ) -> Tuple[bool, int, int, int]:
        """
        Check if request is allowed, increment counter if allowed.
        Returns:
            (is_allowed: bool, remaining: int, retry_after: int, reset_epoch: int)
        """
        pass

    @abstractmethod
    def reset(self):
        """Reset all counters (for testing and lifecycle cleanup)."""
        pass


class InMemorySlidingWindowStore(RateLimitStore):
    """
    Thread-safe in-memory sliding window rate limit counter.

    DEPLOYMENT LIMITATION:
    Counters are stored in Python process memory. In multi-worker deployments
    (e.g., Uvicorn workers > 1), each process maintains its own independent state.
    For global distributed limits across multiple nodes, configure REDIS_URL.
    """
    def __init__(self, cleanup_interval_seconds: int = 300):
        self._lock = threading.Lock()
        self._store: Dict[str, List[float]] = {}
        self._last_cleanup = time.time()
        self._cleanup_interval = cleanup_interval_seconds

    def check_and_increment(
        self, key: str, category: str, limit: int, window: int
    ) -> Tuple[bool, int, int, int]:
        now = time.time()
        composite_key = f"{key}:{category}"
        cutoff = now - window

        with self._lock:
            # Periodic cleanup of expired keys
            if now - self._last_cleanup > self._cleanup_interval:
                self._cleanup_expired(now)
                self._last_cleanup = now

            timestamps = self._store.get(composite_key, [])
            # Keep only timestamps inside current window
            valid_timestamps = [t for t in timestamps if t > cutoff]

            if len(valid_timestamps) >= limit:
                # Rate limit exceeded
                oldest = valid_timestamps[0]
                retry_after = max(1, int(math.ceil(oldest + window - now)))
                reset_epoch = int(math.ceil(oldest + window))
                self._store[composite_key] = valid_timestamps
                return False, 0, retry_after, reset_epoch

            # Request allowed: record current timestamp
            valid_timestamps.append(now)
            self._store[composite_key] = valid_timestamps
            remaining = max(0, limit - len(valid_timestamps))
            reset_epoch = int(math.ceil(now + window))
            return True, remaining, 0, reset_epoch

    def _cleanup_expired(self, now: float):
        keys_to_remove = []
        for k, ts in self._store.items():
            if not ts or ts[-1] < (now - 3600):
                keys_to_remove.append(k)
        for k in keys_to_remove:
            self._store.pop(k, None)

    def reset(self):
        with self._lock:
            self._store.clear()


class RedisRateLimitStore(RateLimitStore):
    """
    Distributed Redis-backed sliding window rate limit counter using sorted sets.
    """
    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self._client = None
        self._init_redis()

    def _init_redis(self):
        try:
            import redis
            self._client = redis.from_url(self.redis_url, decode_responses=True)
            self._client.ping()
            logger.info("Connected to Redis rate limit store: %s", self.redis_url)
        except Exception as e:
            logger.warning("Could not connect to Redis (%s). Fallback to in-memory store.", e)
            self._client = None

    def check_and_increment(
        self, key: str, category: str, limit: int, window: int
    ) -> Tuple[bool, int, int, int]:
        if not self._client:
            raise RuntimeError("Redis store not available")

        now = time.time()
        composite_key = f"rl:{key}:{category}"
        cutoff = now - window

        pipe = self._client.pipeline()
        pipe.zremrangebyscore(composite_key, 0, cutoff)
        pipe.zcard(composite_key)
        pipe.zrange(composite_key, 0, 0, withscores=True)
        results = pipe.execute()

        current_count = results[1]
        oldest_entry = results[2]

        if current_count >= limit:
            oldest_ts = oldest_entry[0][1] if oldest_entry else now
            retry_after = max(1, int(math.ceil(oldest_ts + window - now)))
            reset_epoch = int(math.ceil(oldest_ts + window))
            return False, 0, retry_after, reset_epoch

        # Add current timestamp
        pipe = self._client.pipeline()
        pipe.zadd(composite_key, {str(now): now})
        pipe.expire(composite_key, window + 10)
        pipe.execute()

        remaining = max(0, limit - (current_count + 1))
        reset_epoch = int(math.ceil(now + window))
        return True, remaining, 0, reset_epoch

    def reset(self):
        if self._client:
            keys = self._client.keys("rl:*")
            if keys:
                self._client.delete(*keys)


# ─────────────────────────────────────────────────────────
# Rate Limiter Engine & Client Identification
# ─────────────────────────────────────────────────────────

class RateLimitPolicy:
    def __init__(self, category: str, limit: int, window: int):
        self.category = category
        self.limit = limit
        self.window = window


def get_trusted_proxies() -> Set[str]:
    raw = getattr(settings, "RATE_LIMIT_TRUSTED_PROXIES", "127.0.0.1,::1")
    return {ip.strip() for ip in raw.split(",") if ip.strip()}


def extract_client_ip(request: Request, trusted_proxies: Set[str]) -> str:
    """
    Safely extract client IP.
    Headers like X-Forwarded-For or X-Real-IP are ONLY inspected if the
    immediate peer socket IP is in the trusted_proxies list.
    """
    peer_ip = request.client.host if request.client else "127.0.0.1"

    # If peer is untrusted, NEVER trust forwarded headers
    if peer_ip not in trusted_proxies:
        return peer_ip

    # Peer is trusted: inspect X-Forwarded-For right-to-left
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        ips = [ip.strip() for ip in forwarded.split(",") if ip.strip()]
        for ip in reversed(ips):
            if ip not in trusted_proxies:
                return ip
        if ips:
            return ips[0]

    real_ip = request.headers.get("x-real-ip")
    if real_ip and real_ip.strip() not in trusted_proxies:
        return real_ip.strip()

    return peer_ip


def get_client_identifier(request: Request, trusted_proxies: Set[str]) -> Tuple[str, bool]:
    """
    Identify client.
    - If valid Authorization Bearer token exists: returns ('usr:<user_id>', True)
    - Otherwise returns ('ip:<safe_client_ip>', False)
    This prevents authenticated users from bypassing limits by changing headers or IPs.
    """
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            return f"usr:{payload['sub']}", True

    client_ip = extract_client_ip(request, trusted_proxies)
    return f"ip:{client_ip}", False


def resolve_endpoint_category(path: str, method: str) -> str:
    """
    Map request URL path and HTTP method to configured rate limit category.
    """
    path_clean = path.rstrip("/")
    m = method.upper()

    if m == "POST":
        if path_clean == "/api/v1/auth/login":
            return "login"
        elif path_clean == "/api/v1/auth/register":
            return "register"
        elif path_clean == "/api/v1/auth/send-otp":
            return "otp_gen"
        elif path_clean == "/api/v1/auth/verify-otp":
            return "otp_verify"
        elif path_clean == "/api/v1/auth/forgot-password":
            return "forgot_password"
        elif path_clean == "/api/v1/auth/reset-password":
            return "reset_password"
        elif path_clean == "/api/v1/resume/upload":
            return "resume_upload"
        elif path_clean in ("/api/v1/recruiter/interviews", "/api/v1/student/interviews"):
            return "ai_mock_interview"
        elif path_clean == "/api/v1/roadmap/update-milestone":
            return "ai_analysis"

    if m == "GET":
        if path_clean == "/api/v1/roadmap/my-roadmap":
            return "ai_analysis"

    return "general"


class RateLimiter:
    def __init__(self):
        self.store = self._init_store()

    def _init_store(self) -> RateLimitStore:
        redis_url = getattr(settings, "REDIS_URL", None)
        if redis_url:
            try:
                return RedisRateLimitStore(redis_url)
            except Exception as e:
                logger.warning("Redis store init failed: %s. Using in-memory store.", e)
        return InMemorySlidingWindowStore()

    def get_policy(self, category: str, is_authenticated: bool) -> RateLimitPolicy:
        if category == "login":
            return RateLimitPolicy("login", settings.RATE_LIMIT_LOGIN_LIMIT, settings.RATE_LIMIT_LOGIN_WINDOW)
        elif category == "register":
            return RateLimitPolicy("register", settings.RATE_LIMIT_REGISTER_LIMIT, settings.RATE_LIMIT_REGISTER_WINDOW)
        elif category == "otp_gen":
            return RateLimitPolicy("otp_gen", settings.RATE_LIMIT_OTP_GEN_LIMIT, settings.RATE_LIMIT_OTP_GEN_WINDOW)
        elif category == "otp_verify":
            return RateLimitPolicy("otp_verify", settings.RATE_LIMIT_OTP_VERIFY_LIMIT, settings.RATE_LIMIT_OTP_VERIFY_WINDOW)
        elif category == "forgot_password":
            return RateLimitPolicy("forgot_password", settings.RATE_LIMIT_FORGOT_PASSWORD_LIMIT, settings.RATE_LIMIT_FORGOT_PASSWORD_WINDOW)
        elif category == "reset_password":
            return RateLimitPolicy("reset_password", settings.RATE_LIMIT_RESET_PASSWORD_LIMIT, settings.RATE_LIMIT_RESET_PASSWORD_WINDOW)
        elif category == "resume_upload":
            return RateLimitPolicy("resume_upload", settings.RATE_LIMIT_RESUME_UPLOAD_LIMIT, settings.RATE_LIMIT_RESUME_UPLOAD_WINDOW)
        elif category == "ai_analysis":
            return RateLimitPolicy("ai_analysis", settings.RATE_LIMIT_AI_ANALYSIS_LIMIT, settings.RATE_LIMIT_AI_ANALYSIS_WINDOW)
        elif category == "ai_mock_interview":
            return RateLimitPolicy("ai_mock_interview", settings.RATE_LIMIT_AI_MOCK_INTERVIEW_LIMIT, settings.RATE_LIMIT_AI_MOCK_INTERVIEW_WINDOW)
        elif is_authenticated:
            return RateLimitPolicy("general_authenticated", settings.RATE_LIMIT_DEFAULT_LIMIT, settings.RATE_LIMIT_DEFAULT_WINDOW)
        else:
            return RateLimitPolicy("general_unauthenticated", settings.RATE_LIMIT_UNAUTH_LIMIT, settings.RATE_LIMIT_UNAUTH_WINDOW)

    def check(
        self,
        request: Request,
        category: Optional[str] = None,
        custom_limit: Optional[int] = None,
        custom_window: Optional[int] = None
    ) -> Tuple[bool, int, int, int, RateLimitPolicy, str]:
        """
        Evaluate rate limit for an incoming request.
        Returns:
            (is_allowed, remaining, retry_after, reset_epoch, policy, client_id)
        """
        trusted_proxies = get_trusted_proxies()
        client_id, is_authenticated = get_client_identifier(request, trusted_proxies)

        resolved_cat = category or resolve_endpoint_category(request.url.path, request.method)
        policy = self.get_policy(resolved_cat, is_authenticated)

        limit = custom_limit if custom_limit is not None else policy.limit
        window = custom_window if custom_window is not None else policy.window

        try:
            is_allowed, remaining, retry_after, reset_epoch = self.store.check_and_increment(
                key=client_id,
                category=policy.category,
                limit=limit,
                window=window
            )
            return is_allowed, remaining, retry_after, reset_epoch, policy, client_id
        except Exception as e:
            # Storage failure safe handling: log and fail open to prevent denial-of-service on legitimate users
            logger.error("Rate limit store error for client %s: %s. Failing open.", anonymize_client_id(client_id), e)
            return True, limit, 0, int(time.time() + window), policy, client_id


# Global rate limiter singleton
limiter = RateLimiter()


# ─────────────────────────────────────────────────────────
# FastAPI Dependency Helper
# ─────────────────────────────────────────────────────────

def depends_rate_limit(
    category: Optional[str] = None,
    limit: Optional[int] = None,
    window: Optional[int] = None
):
    """
    Reusable FastAPI route dependency to enforce endpoint-specific limits.
    Marks request.state._rate_limit_checked so middleware does not double-count.
    """
    async def dependency(request: Request):
        if not getattr(settings, "RATE_LIMIT_ENABLED", True):
            return

        is_allowed, remaining, retry_after, reset_epoch, policy, client_id = limiter.check(
            request=request,
            category=category,
            custom_limit=limit,
            custom_window=window
        )
        request.state._rate_limit_checked = True

        if not is_allowed:
            logger.warning(
                "Rate limit exceeded: client=%s category=%s path=%s retry_after=%ds limit=%d/%ds",
                anonymize_client_id(client_id),
                policy.category,
                request.url.path,
                retry_after,
                policy.limit,
                policy.window
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests for {policy.category}. Please try again in {retry_after} seconds.",
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(policy.limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_epoch),
                }
            )

    return dependency


# ─────────────────────────────────────────────────────────
# Centralized Rate Limit Middleware
# ─────────────────────────────────────────────────────────

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    ASGI Middleware that automatically applies rate limits across all incoming requests
    while avoiding public documentation/health paths and honoring route-level dependencies.
    """
    EXCLUDED_PREFIXES = ("/docs", "/redoc", "/openapi.json", "/favicon.ico")

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Check master toggle
        if not getattr(settings, "RATE_LIMIT_ENABLED", True):
            return await call_next(request)

        # Bypass docs and health check root
        path = request.url.path
        if path == "/" or any(path.startswith(prefix) for prefix in self.EXCLUDED_PREFIXES):
            return await call_next(request)

        # Check if already processed by an explicit route dependency
        if getattr(request.state, "_rate_limit_checked", False):
            return await call_next(request)

        is_allowed, remaining, retry_after, reset_epoch, policy, client_id = limiter.check(request)

        if not is_allowed:
            logger.warning(
                "Rate limit exceeded: client=%s category=%s path=%s retry_after=%ds limit=%d/%ds",
                anonymize_client_id(client_id),
                policy.category,
                path,
                retry_after,
                policy.limit,
                policy.window
            )
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": (
                        f"Too many login attempts. Limit of {policy.limit} reached. If your account is blocked, only an Admin can unblock it. Retry in {retry_after}s."
                        if policy.category == "login"
                        else f"Too many requests for {policy.category}. Please try again in {retry_after} seconds."
                    ),
                    "retry_after": retry_after
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(policy.limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_epoch),
                }
            )

        response = await call_next(request)

        # Attach rate limit metadata headers to response
        response.headers["X-RateLimit-Limit"] = str(policy.limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_epoch)

        return response

