"""HTTP request logging — one line per request, quieter on health/docs."""
from __future__ import annotations

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import get_logger, is_quiet_path

log = get_logger("http")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:  # noqa: ANN001
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())[:8]
        start = time.perf_counter()
        path = request.url.path
        method = request.method
        quiet = is_quiet_path(path)

        try:
            response = await call_next(request)
        except Exception:
            ms = (time.perf_counter() - start) * 1000
            log.exception("{} {}  ERROR  {:.0f}ms  id={}", method, path, ms, request_id)
            raise

        ms = (time.perf_counter() - start) * 1000
        status = response.status_code
        response.headers["X-Request-Id"] = request_id

        # 5xx → error, 4xx → warning, else info (skip noisy paths at info)
        line = f"{method} {path}  → {status}  {ms:.0f}ms  id={request_id}"
        if status >= 500:
            log.error(line)
        elif status >= 400:
            log.warning(line)
        elif quiet:
            log.debug(line)
        else:
            log.info(line)

        return response
