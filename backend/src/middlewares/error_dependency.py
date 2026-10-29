
import logging
import traceback
from pathlib import Path

from fastapi import Request
from fastapi.responses import JSONResponse

from constants.messages import COMMON_MESSAGES
from utils.api_error import ApiError
from utils.api_response import ApiResponse

log_file = Path(__file__).resolve().parents[2] / "forgot_password_error.log"

logging.basicConfig(
    filename=str(log_file),
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    encoding="utf-8",
)

logger = logging.getLogger(__name__)


async def api_request_error_handler(
    _request: Request, exc: ApiError
) -> JSONResponse:
    logger.warning(
        "API error: status=%s, message=%s",
        exc.status_code,
        str(exc),
    )
    return ApiResponse.error(
        message=str(exc),
        error=exc.error,
        status_code=exc.status_code,
    )


async def global_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    logger.error(
        "Unhandled exception at %s %s\n%s",
        request.method,
        request.url.path,
        "".join(
            traceback.format_exception(type(exc), exc, exc.__traceback__)
        ),
    )
    return ApiResponse.error(
        message=COMMON_MESSAGES.get("SERVER_ERROR"),
        error=[],
        status_code=500,
    )
