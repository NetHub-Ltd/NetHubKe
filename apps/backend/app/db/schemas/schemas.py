from typing import Any
from typing import List
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr
from pydantic import ConfigDict, AliasGenerator
from pydantic import Field, model_validator, AliasChoices
from pydantic.alias_generators import to_camel
from app.db.schemas.enums import ServicePricing, ServiceFAQ, ServiceIcon


class TokenData(BaseModel):
    """
    The 'Senior Architect' User Model:
    Clean, typed, and focused only on actionable authorization data.
    """
    sub: UUID = Field(..., validation_alias=AliasChoices("sub"))
    email: EmailStr
    username: str = Field(..., validation_alias=AliasChoices("preferred_username"))
    full_name: str = Field(..., validation_alias=AliasChoices("name"))
    email_verified: bool = Field(..., validation_alias=AliasChoices("email_verified"))

    # Structural Data
    roles: List[str] = []
    # groups: List[str] = []

    # Functional Permissions (Filtered Scopes)
    # permissions: List[str] = Field(default_factory=list)
    scopes: List[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def clean_scopes_and_data(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # 1. Extract the raw scope string
            raw_scope = data.get("scope", "")

            # 2. Define what to ignore (OIDC Protocol Noise)
            oidc_noise = {"openid", "profile", "email", "groups", "roles", "offline_access", "address", "phone"}

            # 3. Filter the scopes into clean permissions (e.g., ['user:me'])
            scope = raw_scope.split()
            data["scopes"] = [s for s in scope if s not in oidc_noise]

        return data

    def has_permission(self, perm: str) -> bool:
        """Helper to check for a specific fine-grained scope."""
        return perm in self.permissions

    def has_role(self, role: str) -> bool:
        """Helper to check for a high-level application role."""
        return role in self.roles


#  USER
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str

class UserCreateBase(UserCreate):
    keycloak_id: UUID
    tenant_id: Optional[UUID] = None
    is_active: Optional[bool] = True

class UserUpdate(BaseModel):
    # email: EmailStr
    full_name: str


class UserRead(BaseModel):
    id: UUID
    email: str
    full_name: str
    is_active: bool
    tenant_id: UUID


# TENANTS
class TenantCreate(BaseModel):
    name: str


class TenantUpdate(BaseModel):
    name: str

class TenantRead(BaseModel):
    id: UUID
    name: str



#===================================================================================
# SERVICES
#===================================================================================
class ServiceBase(BaseModel):
    title: str
    slug: str
    icon: ServiceIcon = ServiceIcon.WRENCH
    is_active: bool = True
    short_desc: str
    description: str

    features: List[str] = Field(default_factory=list)
    pricing: List[ServicePricing] = Field(default_factory=list)
    faqs: List[ServiceFAQ] = Field(default_factory=list)

# --- Create Schema ---

class ServiceCreate(ServiceBase):
    """Used for POST requests. All base fields are required."""
    pass

# --- Update Schema ---

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    icon: Optional[ServiceIcon] = None
    is_active: Optional[bool] = None
    short_desc: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    pricing: Optional[List[ServicePricing]] = None
    faqs: Optional[List[ServiceFAQ]] = None


class ServiceRead(ServiceBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class ServiceCreateIn(ServiceCreate):
    """The schema the API actually accepts from the frontend."""
    model_config = ConfigDict(
        alias_generator=AliasGenerator(validation_alias=to_camel),
        populate_by_name=True
    )

class ServiceUpdateIn(ServiceUpdate):
    """The schema for partial updates from the frontend."""
    model_config = ConfigDict(
        alias_generator=AliasGenerator(validation_alias=to_camel),
        populate_by_name=True
    )