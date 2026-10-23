from pydantic import BaseModel, Field, model_validator

from utils.api_error import ApiError


class UpdateMeSchema(BaseModel):
    phone: str | None = Field(
        default=None,
        pattern=r"^\d{10}$",
        description="Phone number must be exactly 10 digits",
    )
    full_name: str | None = Field(
        default=None,
        min_length=3,
        max_length=100,
        description="Full name must be between 3 and 100 characters",
    )

    @model_validator(mode="after")
    def check_at_least_one_field(self):
        if not self.phone and not self.full_name:
            raise ApiError(400, "Vui lòng cung cấp ít nhất một trường để cập nhật")
        return self


class ChangePasswordSchema(BaseModel):
    old_password: str = Field(..., min_length=1, description="Old password is required")
    new_password: str = Field(
        ...,
        min_length=6,
        max_length=24,
        description="Password must be between 6 and 24 characters",
    )
