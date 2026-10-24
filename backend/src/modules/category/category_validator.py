from pydantic import BaseModel, Field, model_validator

from constants.messages import CATEGORY_MESSAGES
from utils.api_error import ApiError


class CreateCategorySchema(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Category name",
    )

    description: str | None = Field(
        default=None,
        description="Detailed description of the category",
    )

    is_active: bool = Field(
        default=True,
        description="Category active status (True/False)",
    )

    @model_validator(mode="after")
    def validate_create_constraints(self):
        if not self.name or not self.name.strip():
            raise ApiError(400, CATEGORY_MESSAGES["NAME_REQUIRED"])
        self.name = self.name.strip()
        if self.description:
            self.description = self.description.strip() or None
        return self


class UpdateCategorySchema(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="New category name",
    )

    description: str | None = Field(
        default=None,
        description="New detailed description of the category",
    )

    is_active: bool | None = Field(
        default=None,
        description="New active status (True/False)",
    )

    @model_validator(mode="after")
    def validate_update_constraints(self):
        provided_fields = [
            self.name,
            self.description,
            self.is_active,
        ]

        if all(field is None for field in provided_fields):
            raise ApiError(400, CATEGORY_MESSAGES["AT_LEAST_ONE_FIELD_REQUIRED"])

        if self.name is not None:
            if not self.name.strip():
                raise ApiError(400, CATEGORY_MESSAGES["NAME_REQUIRED"])
            self.name = self.name.strip()

        if self.description is not None:
            self.description = self.description.strip() or None

        return self


class UpdateCategoryStatusSchema(BaseModel):
    is_active: bool = Field(
        ...,
        description="New active status (True/False)",
    )
