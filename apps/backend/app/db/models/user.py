from sqlmodel import Field

from app.db.models.base import BaseMixin

class User(BaseMixin, table=True):
    __tablename__ = "users"
    first_name: str = Field(alias="firstName")
    second_name: str = Field(alias="secondName")
    email: str = Field(unique=True, index=True)
    phone_number: str = Field(alias="phoneNumber")