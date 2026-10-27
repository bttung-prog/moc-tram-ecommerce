from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator

from constants.messages import FEEDBACK_MESSAGES
from utils.api_error import ApiError


class CreateFeedbackSchema(BaseModel):
    order_id: UUID = Field(
        ...,
        description="Order ID to submit feedback for",
    )

    rating: int = Field(
        ...,
        ge=1,
        le=5,
        description="Order satisfaction rating (1 to 5 stars)",
    )

    comment: str = Field(
        ...,
        min_length=1,
        description="Customer feedback comment or review",
    )

    @field_validator("comment")
    @classmethod
    def validate_comment(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ApiError(400, FEEDBACK_MESSAGES["COMMENT_REQUIRED"])
        return clean


class UpdateFeedbackSchema(BaseModel):
    rating: int | None = Field(
        default=None,
        ge=1,
        le=5,
        description="Updated satisfaction rating (1 to 5 stars)",
    )

    comment: str | None = Field(
        default=None,
        min_length=1,
        description="Updated feedback comment",
    )

    @field_validator("comment")
    @classmethod
    def validate_comment(cls, v: str | None) -> str | None:
        if v is not None:
            clean = v.strip()
            if not clean:
                raise ApiError(400, FEEDBACK_MESSAGES["COMMENT_REQUIRED"])
            return clean
        return v

    @model_validator(mode="after")
    def validate_at_least_one(self):
        if self.rating is None and self.comment is None:
            raise ApiError(400, FEEDBACK_MESSAGES["AT_LEAST_ONE_FIELD_REQUIRED"])
        return self


class ReplyFeedbackSchema(BaseModel):
    reply: str = Field(
        ...,
        min_length=1,
        description="Shop or staff reply message to customer feedback",
    )

    @field_validator("reply")
    @classmethod
    def validate_reply(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ApiError(400, FEEDBACK_MESSAGES["REPLY_REQUIRED"])
        return clean
