from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class RoleEnum(str, Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    ACCOUNTANT = "ACCOUNTANT"
    EMPLOYEE = "EMPLOYEE"
    VIEWER = "VIEWER"

class DocumentTypeEnum(str, Enum):
    PR = "PR"
    PO = "PO"
    PI = "PI"
    INVOICE = "INVOICE"

class ReconciliationStatusEnum(str, Enum):
    MATCHED = "MATCHED"
    PARTIALLY_MATCHED = "PARTIALLY_MATCHED"
    UNMATCHED = "UNMATCHED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"

class TenantContext(BaseModel):
    tenant_id: str
    business_id: str
    user_id: str
    role: RoleEnum = RoleEnum.OWNER

class BusinessProfile(BaseModel):
    tenant_id: str
    business_id: str
    name: str
    gstin: str
    udyam_reg_no: str
    pan: str
    industry_sector: str
    turnover_band: str
    state: str
    city: str
    employee_count: int

class SalesRecord(BaseModel):
    tenant_id: str
    business_id: str
    invoice_number: str
    customer_id: str
    customer_name: str
    sale_date: str
    subtotal: float
    tax_amount: float
    total_amount: float
    payment_status: str

class PurchaseRecord(BaseModel):
    tenant_id: str
    business_id: str
    po_number: str
    supplier_id: str
    supplier_name: str
    purchase_date: str
    total_amount: float
    status: str

class InventoryItem(BaseModel):
    tenant_id: str
    business_id: str
    sku: str
    name: str
    category: str
    hsn_code: str
    unit: str
    cost_price: float
    selling_price: float
    stock_quantity: float
    min_reorder_level: float
    supplier_lead_time_days: int
    margin_pct: float

class GSTRecord(BaseModel):
    tenant_id: str
    business_id: str
    return_type: str  # GSTR1, GSTR3B
    period: str
    due_date: str
    taxable_value: float
    cgst: float
    sgst: float
    igst: float
    itc_claimed: float
    status: str

class ComplianceTask(BaseModel):
    tenant_id: str
    business_id: str
    task_name: str
    authority: str
    due_date: str
    reminder_schedule_days: List[int] = [30, 15, 7, 3, 1]
    status: str

class ReconciliationMatch(BaseModel):
    tenant_id: str
    business_id: str
    match_id: str
    source_type: str
    target_type: str
    reference_number: str
    amount: float
    confidence_score: float
    status: ReconciliationStatusEnum
    discrepancy_note: Optional[str] = None

class AgreementClause(BaseModel):
    tenant_id: str
    clause_id: str
    title: str
    category: str  # Payment, Termination, Liability, Penalty
    content: str
    risk_level: str  # Low, Medium, High
    recommendation: str

class MarketSignal(BaseModel):
    category: str
    signal_name: str
    trend_growth_pct: float
    relevance_score: float
    suggested_action: str

class FestivalEvent(BaseModel):
    festival_name: str
    date: str
    days_remaining: int
    target_categories: List[str]
    lead_time_required_days: int
    recommendation: str

class GeMOpportunity(BaseModel):
    tender_id: str
    title: str
    department: str
    category: str
    value_inr: float
    deadline: str
    match_score: float
    eligibility_status: str
