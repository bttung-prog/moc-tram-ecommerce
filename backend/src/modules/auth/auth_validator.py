from pydantic import BaseModel, Field, model_validator

from utils.api_error import ApiError

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
PHONE_REGEX = r"^\d{10}$"


class RegisterSchema(BaseModel):
    email: str = Field(
        ...,
        pattern=EMAIL_REGEX,
        max_length=255,
        description="Email address of the user",
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=24,
        description="Password must be between 6 and 24 characters",
    )
    full_name: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Full name must be between 3 and 100 characters",
    )
    phone: str = Field(
        ..., pattern=PHONE_REGEX, description="Phone number must be exactly 10 digits"
    )


class LoginSchema(BaseModel):
    email: str | None = Field(
        default=None, pattern=EMAIL_REGEX, description="Email address of the user"
    )
    phone: str | None = Field(
        default=None,
        pattern=PHONE_REGEX,
        description="Phone number must be exactly 10 digits",
    )
    password: str = Field(..., min_length=1, description="User password")

    @model_validator(mode="after")
    def check_email_or_phone(self):
        if not self.email and not self.phone:
            raise ApiError(
                400, "Vui lòng cung cấp email hoặc số điện thoại để đăng nhập"
            )
        return self


class RefreshTokenSchema(BaseModel):
    refresh_token: str = Field(
        ..., min_length=1, description="Refresh token is required"
    )
