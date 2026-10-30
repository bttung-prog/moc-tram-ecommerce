import traceback
from fastapi import Request
from fastapi.responses import JSONResponse

from constants.messages import COMMON_MESSAGES
from utils.api_error import ApiError
from utils.api_response import ApiResponse


async def api_request_error_handler(_request: Request, exc: ApiError) -> JSONResponse:
    return ApiResponse.error(
        message=str(exc), error=exc.error, status_code=exc.status_code
    )


async def global_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    print(f"[ERROR 500] Unhandled Exception: {exc}")
    traceback.print_exc()
    return ApiResponse.error(
        message=COMMON_MESSAGES.get("SERVER_ERROR"), error=[], status_code=500
    )
