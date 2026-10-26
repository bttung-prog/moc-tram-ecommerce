from uuid import UUID

from fastapi import BackgroundTasks, Depends, Request
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import AUTH_MESSAGES
from modules.auth import auth_service
from modules.auth.auth_validator import (
    ChangePasswordSchema,
    ForgotPasswordSchema,
    LoginSchema,
    RefreshTokenSchema,
    RegisterSchema,
    ResendRegisterOtpSchema,
    ResetPasswordSchema,
    VerifyOtpSchema,
    VerifyRegisterOtpSchema,
)
from utils.api_response import ApiResponse


def register(
    payload: RegisterSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    new_user = auth_service.register(
        db=db,
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
        phone=payload.phone,
        background_tasks=background_tasks,
    )

    return ApiResponse.created(
        data=new_user,
        message=AUTH_MESSAGES["REGISTER_SUCCESS_WITH_OTP"],
    )


def verify_register_otp(
    payload: VerifyRegisterOtpSchema,
    db: Session = Depends(get_db),
):
    result = auth_service.verify_register_otp(
        db=db,
        email=payload.email,
        otp=payload.otp,
    )

    return ApiResponse.success(
        data=result,
        message=AUTH_MESSAGES["ACCOUNT_ACTIVATED_SUCCESS"],
    )


def resend_register_otp(
    payload: ResendRegisterOtpSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    result = auth_service.resend_register_otp(
        db=db,
        email=payload.email,
        background_tasks=background_tasks,
    )

    return ApiResponse.success(
        data=result,
        message=AUTH_MESSAGES["OTP_SENT_SUCCESS"],
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


def forgot_password(
    payload: ForgotPasswordSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    result = auth_service.forgot_password(
        db=db,
        email=payload.email,
        background_tasks=background_tasks,
    )

    return ApiResponse.success(
        data=result,
        message=AUTH_MESSAGES["OTP_SENT_SUCCESS"],
    )


def verify_otp(
    payload: VerifyOtpSchema,
    db: Session = Depends(get_db),
):
    auth_service.verify_otp(
        db=db,
        email=payload.email,
        otp=payload.otp,
    )

    return ApiResponse.success(
        message=AUTH_MESSAGES["OTP_VERIFIED_SUCCESS"],
    )


def reset_password(
    payload: ResetPasswordSchema,
    db: Session = Depends(get_db),
):
    auth_service.reset_password(
        db=db,
        email=payload.email,
        otp=payload.otp,
        new_password=payload.new_password,
    )

    return ApiResponse.success(
        message=AUTH_MESSAGES["RESET_PASSWORD_SUCCESS"],
    )


def change_password(
    request: Request,
    payload: ChangePasswordSchema,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    result = auth_service.change_password(
        db=db,
        user_id=user_id,
        old_password=payload.old_password,
        new_password=payload.new_password,
    )

    return ApiResponse.success(
        data=result,
        message=AUTH_MESSAGES["CHANGE_PASSWORD_SUCCESS"],
    )
