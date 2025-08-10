from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from enum import Enum
from .financial import Period

class VarianceType(str, Enum):
    ABSOLUTE = "absolute"
    PERCENTAGE = "percentage"
    BOTH = "both"

class SignificanceLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class VarianceComponent(BaseModel):
    name: str
    old_value: float
    new_value: float
    absolute_variance: float
    percentage_variance: float
    contribution_to_total: float

class KPIVariance(BaseModel):
    kpi_name: str
    old_value: float
    new_value: float
    absolute_variance: float
    percentage_variance: float
    significance_level: SignificanceLevel
    components: List[VarianceComponent] = []
    
class HierarchyVariance(BaseModel):
    hierarchy_path: str
    level_name: str
    parent_path: List[str]
    children: List[str]
    old_value: float
    new_value: float
    absolute_variance: float
    percentage_variance: float
    is_leaf_node: bool
    significance_level: SignificanceLevel
    drill_down_options: List[str] = []

class PeriodAlignment(BaseModel):
    period_name: str
    old_period: Optional[Period] = None
    new_period: Optional[Period] = None
    alignment_type: str  # "actual_vs_forecast", "forecast_vs_forecast", "actual_vs_actual"
    
class PeriodComparison(BaseModel):
    comparison_type: str
    aligned_periods: List[PeriodAlignment]
    common_periods: List[str]
    old_only_periods: List[str]
    new_only_periods: List[str]

class VarianceAttribution(BaseModel):
    primary_drivers: List[str]
    price_volume_split: Optional[Dict[str, float]] = None
    component_contributions: List[VarianceComponent]
    confidence_score: float

class ExecutiveSummary(BaseModel):
    total_revenue_variance: KPIVariance
    operating_profit_variance: KPIVariance
    ebitda_variance: KPIVariance
    eps_variance: Optional[KPIVariance] = None
    cash_flow_variance: Optional[KPIVariance] = None
    top_variances: List[HierarchyVariance]
    key_insights: List[str]

class VarianceAnalysis(BaseModel):
    session_id: str
    executive_summary: ExecutiveSummary
    kpi_variances: Dict[str, KPIVariance]
    hierarchy_variances: Dict[str, HierarchyVariance]
    period_comparison: PeriodComparison
    variance_attribution: Dict[str, VarianceAttribution]
    analysis_timestamp: str