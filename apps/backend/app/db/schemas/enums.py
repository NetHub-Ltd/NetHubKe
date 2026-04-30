from enum import Enum

from pydantic import BaseModel


class TenantTier(str, Enum):
    """
    Defines the service limits and features available to a Tenant.
    - STR mixin ensures it plays nice with Pydantic/JSON.
    """
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

    # You can add helper properties for quick logic checks
    @property
    def vps_limit(self) -> int:
        mapping = {
            TenantTier.FREE: 1,
            TenantTier.PRO: 5,
            TenantTier.ENTERPRISE: 100
        }
        return mapping.get(self, 1)


# --- Enums for Categorization ---

class ServiceIcon(str, Enum):
    CREDIT_CARD = "CreditCard"
    SMARTPHONE = "Smartphone"
    SEARCH = "Search"
    WRENCH = "Wrench"


# --- Structured Schemas for JSON Columns ---

class ServicePricing(BaseModel):
    label: str  # e.g., "Basic Setup"
    price: str  # e.g., "KSh 7,500"
    description: str  # e.g., "Standard STK Push"


class ServiceFAQ(BaseModel):
    question: str
    answer: str