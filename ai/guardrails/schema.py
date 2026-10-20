from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SourceCitation(BaseModel):
    title: str = Field(description="Name or title of official document, API, or database table")
    authority: Optional[str] = Field(default=None, description="Issuing authority (e.g. CBIC, Ministry of MSME, Internal DB)")
    effective_date: Optional[str] = Field(default=None, description="Date document or data was effective")
    url: Optional[str] = Field(default=None, description="Link or reference code")

class ActionableRecommendation(BaseModel):
    title: str = Field(description="Short summary of recommended action")
    action_type: str = Field(description="Action key, e.g. CREATE_PO, NAVIGATE, APPLY_SCHEME, FILE_GST")
    target: str = Field(description="Target entity ID or route")
    urgency: str = Field(default="Medium", description="High, Medium, or Low")

class StructuredAIResponse(BaseModel):
    """
    Mandatory structured response schema for all UDYAM AI Copilot outputs.
    Ensures complete explainability, empirical evidence tracing, and zero hallucination.
    """
    answer: str = Field(description="Direct, clear answer to user query in natural language (English/Hindi/Hinglish)")
    evidence: List[str] = Field(default_factory=list, description="Empirical evidence points retrieved from tools and database")
    calculations: List[str] = Field(default_factory=list, description="Explicit mathematical formulas and numbers computed by deterministic engine")
    sources: List[SourceCitation] = Field(default_factory=list, description="Citations to verified database tables, GST circulars, or scheme docs")
    recommendations: List[ActionableRecommendation] = Field(default_factory=list, description="Proactive, auditable business recommendations")
    confidence: float = Field(default=0.90, description="Confidence score between 0.0 and 1.0 based on data completeness")
    data_freshness: str = Field(default="Live Real-time", description="Freshness timestamp or status of data sources used")
    requires_human_review: bool = Field(default=False, description="True if regulated tax/legal filing requires user validation")
