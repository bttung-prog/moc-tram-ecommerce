from fastapi import Depends

from sqlalchemy.orm import Session

from configs.db_connection import get_db

from constants.messages import AUTH_MESSAGES

from utils.api_response import ApiResponse

from modules.auth import auth_service
from modules.auth.auth_validator import (
    LoginSchema,
    RefreshTokenSchema,
    RegisterSchema,
)


def register(
    payload: RegisterSchema,
    db: Session = Depends(get_db),
):
    new_user = auth_service.register(
        db=db,
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
        phone=payload.phone,
    )

    return ApiResponse.created(
        data=new_user,
        message=AUTH_MESSAGES["REGISTER_SUCCESS"],
    )


def login(
    payload: LoginSchema,
    db: Session = Depends(get_db),
):
    result = auth_service.login(
        db=db,
        email=payload.email,
        phone=payload.phone,
        password=payload.password,
    )

    return ApiResponse.success(
        data=result,
        message=AUTH_MESSAGES["LOGIN_SUCCESS"],
    )


def refresh_access_token(
    payload: RefreshTokenSchema,
    db: Session = Depends(get_db),
):
    tokens = auth_service.refresh_access_token(
        db=db,
        refresh_token=payload.refresh_token,
    )

    return ApiResponse.success(
        data=tokens,
        message=AUTH_MESSAGES["REFRESH_TOKEN_SUCCESS"],
    )


def logout(
    payload: RefreshTokenSchema,
    db: Session = Depends(get_db),
):
    auth_service.logout(
        db=db,
        refresh_token=payload.refresh_token,
    )

    return ApiResponse.success(
        message=AUTH_MESSAGES["LOGOUT_SUCCESS"],
    )
