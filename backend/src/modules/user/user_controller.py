from uuid import UUID

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from configs.db_connection import get_db
from constants.messages import USER_MESSAGES
from modules.user import user_service
from modules.user.user_validator import ChangePasswordSchema, UpdateMeSchema
from utils.api_response import ApiResponse


def get_me(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    user = user_service.get_by_id(db, user_id)

    return ApiResponse.success(
        data=user,
        message=USER_MESSAGES["GET_PROFILE_SUCCESS"],
    )


def update_me(
    request: Request,
    payload: UpdateMeSchema,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    updated_user = user_service.update_me(
        db=db,
        user_id=user_id,
        phone=payload.phone,
        full_name=payload.full_name,
    )

    return ApiResponse.success(
        data=updated_user,
        message=USER_MESSAGES["UPDATE_PROFILE_SUCCESS"],
    )


def change_password(
    request: Request,
    payload: ChangePasswordSchema,
    db: Session = Depends(get_db),
):
    user_id = UUID(request.state.user.get("user_id"))
    user = user_service.change_password(
        db=db,
        user_id=user_id,
        old_password=payload.old_password,
        new_password=payload.new_password,
    )

    return ApiResponse.success(
        data=user,
        message=USER_MESSAGES["CHANGE_PASSWORD_SUCCESS"],
    )
