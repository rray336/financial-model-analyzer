from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class SheetType(str, Enum):
    INCOME_STATEMENT = "income_statement"
    BALANCE_SHEET = "balance_sheet" 
    CASH_FLOW = "cash_flow"
    UNKNOWN = "unknown"

class PeriodType(str, Enum):
    ACTUAL = "actual"
    FORECAST = "forecast"
    BUDGET = "budget"

class Period(BaseModel):
    name: str  # Original Excel header text (exact)
    column_index: int  # Excel column position (B=1, C=2, etc.)
    sheet_name: str  # Which sheet this came from
    row_index: int  # Which row contained the header
    period_type: PeriodType = PeriodType.FORECAST  # Default, but not used for sorting

class CellInfo(BaseModel):
    value: float
    formula: Optional[str] = None
    is_hard_coded: bool
    row: int
    column: str

class LineItem(BaseModel):
    name: str  # Original Excel text from first column (exact)
    row_index: int  # Excel row position for ordering
    periods: Dict[str, CellInfo]  # period_name -> CellInfo
    sheet_name: str  # Which sheet this came from
    statement_type: str  # income_statement, balance_sheet, cash_flow
    # Legacy fields for backward compatibility
    row: Optional[int] = None  # Deprecated - use row_index
    indentation_level: int = 0
    parent_item: Optional[str] = None

class FinancialSheet(BaseModel):
    sheet_type: SheetType
    sheet_name: str
    line_items: List[LineItem]
    periods: List[Period]
    
class HierarchyLevel(BaseModel):
    level_name: str
    depth: int
    parent_path: List[str]
    children: List[str]
    line_items: List[str]

class ModelStructure(BaseModel):
    hierarchy_levels: List[HierarchyLevel]
    drill_down_paths: Dict[str, List[str]]  # path -> children
    hard_coded_nodes: List[str]
    max_depth: int

class FinancialModel(BaseModel):
    model_id: str
    filename: str
    upload_timestamp: datetime
    income_statement: Optional[FinancialSheet] = None
    balance_sheet: Optional[FinancialSheet] = None
    cash_flow: Optional[FinancialSheet] = None
    structure: ModelStructure
    periods: List[Period]
    metadata: Dict[str, Any] = {}

class SessionInfo(BaseModel):
    session_id: str
    created_at: datetime
    old_model_filename: str
    new_model_filename: str
    status: str
    expires_at: datetime