from pydantic import BaseModel, Field, model_validator

from constants.roles import ROLES
from constants.user_statuses import USER_STATUSES
from utils.api_error import ApiError

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
PHONE_REGEX = r"^\d{10}$"


class AdminCreateUserSchema(BaseModel):
    email: str = Field(
        ...,
        pattern=EMAIL_REGEX,
        max_length=255,
        description="User email address",
    )

    password: str = Field(
        ...,
        min_length=6,
        max_length=50,
        description="User password (min 6 characters)",
    )

    phone: str = Field(
        ...,
        pattern=PHONE_REGEX,
        description="User phone number (10 digits)",
    )

    full_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="User full name",
    )

    role: ROLES = Field(
        default=ROLES.STAFF,
        description="Role assigned to user (e.g. staff, warehouse_staff, customer, admin)",
    )

    status: USER_STATUSES = Field(
        default=USER_STATUSES.ACTIVE,
        description="Account status (active, inactive)",
    )


class AdminUpdateUserSchema(BaseModel):
    full_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Updated full name",
    )

    phone: str | None = Field(
        default=None,
        pattern=PHONE_REGEX,
        description="Updated phone number (10 digits)",
    )

    email: str | None = Field(
        default=None,
        pattern=EMAIL_REGEX,
        max_length=255,
        description="Updated email address",
    )

    @model_validator(mode="after")
    def validate_update_constraints(self):
        fields = [self.full_name, self.phone, self.email]
        if all(f is None for f in fields):
            raise ApiError(400, "Vui lòng cung cấp ít nhất một trường để cập nhật")
        return self


class AdminChangeRoleSchema(BaseModel):
    role: ROLES = Field(
        ...,
        description="New role for the user",
    )


class AdminChangeStatusSchema(BaseModel):
    status: USER_STATUSES = Field(
        ...,
        description="New status for the user",
    )
