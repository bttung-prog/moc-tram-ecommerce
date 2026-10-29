from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from utils.api_error import ApiError


class CreateWarehouseStaffSchema(BaseModel):
    user_id: UUID = Field(
        ...,
        description="User ID associated with this warehouse staff profile",
    )

    warehouse_id: UUID | None = Field(
        default=None,
        description="Assigned warehouse ID",
    )

    position: str | None = Field(
        default=None,
        description="Warehouse job position (e.g., Thủ kho, Kiểm kê)",
    )


class UpdateWarehouseStaffSchema(BaseModel):
    warehouse_id: UUID | None = Field(
        default=None,
        description="Assigned warehouse ID",
    )

    position: str | None = Field(
        default=None,
        description="Warehouse job position",
    )

    @model_validator(mode="after")
    def validate_update_constraints(self):
        fields = [self.warehouse_id, self.position]
        if all(f is None for f in fields):
            raise ApiError(400, "Vui lòng cung cấp ít nhất một trường để cập nhật")
        return self
