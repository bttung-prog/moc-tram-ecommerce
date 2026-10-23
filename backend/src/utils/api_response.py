from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response

from constants.messages import COMMON_MESSAGES


class ApiResponse:
    @staticmethod
    def success(
        data=None,
        message: str = COMMON_MESSAGES.get("SUCCESS"),
        status_code: int = 200,
        meta: (dict | None) = None,
    ):
        content = {"success": True, "message": message, "data": data, "meta": meta}

        return JSONResponse(status_code=status_code, content=jsonable_encoder(content))


    @staticmethod
    def created(
        data=None,
        message: str = COMMON_MESSAGES.get("CREATED"),
    ):
        content = {"success": True, "message": message, "data": data}

        return JSONResponse(status_code=201, content=jsonable_encoder(content))


    @staticmethod
    def no_content():
        return Response(status_code=204)


    @staticmethod
    def error(
        message: str = COMMON_MESSAGES.get("ERROR"),
        error: (list | None) = None,
        status_code: int = 500,
    ):
        content = {"success": False, "message": message, "error": error or []}

        return JSONResponse(status_code=status_code, content=jsonable_encoder(content))
