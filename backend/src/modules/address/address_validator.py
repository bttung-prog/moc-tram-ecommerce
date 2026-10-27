from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from utils.api_error import ApiError


class CreateAddressSchema(BaseModel):
    recipient_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Recipient full name",
    )

    phone: str = Field(
        ...,
        min_length=8,
        max_length=20,
        description="Recipient phone number",
    )

    province: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Province / City",
    )

    district: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="District",
    )

    ward: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Ward",
    )

    street_address: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Detailed street address",
    )

    is_default: bool = Field(
        default=False,
        description="Whether this is the default address",
    )

    @model_validator(mode="after")
    def validate_strings(self):
        self.recipient_name = self.recipient_name.strip()
        self.phone = self.phone.strip()
        self.province = self.province.strip()
        self.district = self.district.strip()
        self.ward = self.ward.strip()
        self.street_address = self.street_address.strip()

        if not all(
            [
                self.recipient_name,
                self.phone,
                self.province,
                self.district,
                self.ward,
                self.street_address,
            ]
        ):
            raise ApiError(400, "Vui lòng điền đầy đủ các thông tin địa chỉ bắt buộc")

        return self


class AdminCreateAddressSchema(CreateAddressSchema):
    customer_id: UUID = Field(
        ...,
        description="Customer ID that this address belongs to",
    )


class UpdateAddressSchema(BaseModel):
    recipient_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Recipient full name",
    )

    phone: str | None = Field(
        default=None,
        min_length=8,
        max_length=20,
        description="Recipient phone number",
    )

    province: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Province / City",
    )

    district: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="District",
    )

    ward: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Ward",
    )

    street_address: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="Detailed street address",
    )

    is_default: bool | None = Field(
        default=None,
        description="Whether this is the default address",
    )

    @model_validator(mode="after")
    def validate_update_constraints(self):
        fields = [
            self.recipient_name,
            self.phone,
            self.province,
            self.district,
            self.ward,
            self.street_address,
            self.is_default,
        ]
        if all(f is None for f in fields):
            raise ApiError(400, "Vui lòng cung cấp ít nhất một trường để cập nhật")

        if self.recipient_name is not None:
            self.recipient_name = self.recipient_name.strip()
            if not self.recipient_name:
                raise ApiError(400, "Tên người nhận không được để trống")

        if self.phone is not None:
            self.phone = self.phone.strip()
            if not self.phone:
                raise ApiError(400, "Số điện thoại không được để trống")

        if self.province is not None:
            self.province = self.province.strip()
            if not self.province:
                raise ApiError(400, "Tỉnh/Thành phố không được để trống")

        if self.district is not None:
            self.district = self.district.strip()
            if not self.district:
                raise ApiError(400, "Quận/Huyện không được để trống")

        if self.ward is not None:
            self.ward = self.ward.strip()
            if not self.ward:
                raise ApiError(400, "Phường/Xã không được để trống")

        if self.street_address is not None:
            self.street_address = self.street_address.strip()
            if not self.street_address:
                raise ApiError(400, "Địa chỉ chi tiết không được để trống")

        return self
