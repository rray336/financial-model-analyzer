from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
from .financial import FinancialModel, ModelStructure
from .variance import VarianceAnalysis

class HierarchyTree(BaseModel):
    root_nodes: List[str]
    node_relationships: Dict[str, List[str]]  # parent -> children
    node_metadata: Dict[str, Dict]  # node_id -> metadata
    navigation_paths: List[List[str]]
    max_depth: int
    total_nodes: int

class PeriodMapping(BaseModel):
    old_model_periods: List[str]
    new_model_periods: List[str]
    aligned_periods: List[str]
    projection_vs_actual_periods: List[str]
    projection_vs_projection_periods: List[str]
    alignment_quality_score: float

class ConsistencyCheck(BaseModel):
    structure_match: bool
    naming_consistency: float  # 0-1 score
    period_alignment_possible: bool
    issues_found: List[str]
    warnings: List[str]
    compatibility_score: float

class ModelComparison(BaseModel):
    session_id: str
    old_model: FinancialModel
    new_model: FinancialModel
    consistency_check: ConsistencyCheck
    variance_analysis: VarianceAnalysis
    hierarchy_tree: HierarchyTree
    period_mapping: PeriodMapping
    created_at: datetime
    last_accessed: datetime
    status: str  # "processing", "completed", "error"
    
class NavigationState(BaseModel):
    current_path: List[str]
    breadcrumb_trail: List[Dict[str, str]]  # [{"name": "Company", "path": "root"}, ...]
    available_drill_downs: List[str]
    is_leaf_node: bool
    tree_view_active: bool

class SessionResponse(BaseModel):
    session_id: str
    status: str
    message: str
    processing_time_estimate: Optional[int] = None  # seconds