from uuid import UUID

from pydantic import BaseModel, Field


class AddToCartSchema(BaseModel):
    product_id: UUID = Field(
        ...,
        description="Product ID to add to cart",
    )
    quantity: int = Field(
        default=1,
        ge=1,
        description="Quantity of the product to add to cart",
    )


class UpdateCartItemSchema(BaseModel):
    quantity: int = Field(
        ...,
        ge=0,
        description="New quantity of the cart item. A quantity of 0 removes the item from the cart",
    )


class MergeCartItemSchema(BaseModel):
    product_id: UUID = Field(
        ...,
        description="Product ID to merge",
    )
    quantity: int = Field(
        default=1,
        ge=1,
        description="Quantity of the product",
    )


class MergeCartSchema(BaseModel):
    items: list[MergeCartItemSchema] = Field(
        default_factory=list,
        description="List of cart items from local storage to merge into customer cart",
    )
