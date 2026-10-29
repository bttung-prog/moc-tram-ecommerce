from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from utils.api_error import ApiError


class CreateStaffSchema(BaseModel):
    user_id: UUID = Field(
        ...,
        description="User ID associated with this staff profile",
    )

    department: str | None = Field(
        default=None,
        description="Staff department (e.g., CSKH, Sales)",
    )

    position: str | None = Field(
        default=None,
        description="Staff job position",
    )


class UpdateStaffSchema(BaseModel):
    department: str | None = Field(
        default=None,
        description="Staff department",
    )

    position: str | None = Field(
        default=None,
        description="Staff job position",
    )

    @model_validator(mode="after")
    def validate_update_constraints(self):
        fields = [self.department, self.position]
        if all(f is None for f in fields):
            raise ApiError(400, "Vui lòng cung cấp ít nhất một trường để cập nhật")
        return self
