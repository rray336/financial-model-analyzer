1# Financial Model Analyzer - Project Plan (Revised Implementation)

## Overview

A universal Excel financial model comparison tool that analyzes any two Excel files with similar structure. Users upload Old and New models, select financial statement sheets, choose periods, and drill down through variance analysis using formula-based hierarchy detection. The system provides side-by-side variance display with unlimited drill-down capabilities.

## System Architecture

### Frontend (React)

- **Dual File Upload Interface**: Clearly labeled "Old Model" and "New Model" upload areas
- **Variance Dashboard**: Side-by-side KPI comparisons with absolute and percentage changes
- **Breadcrumb Navigation**: Drill-down path with toggle to tree view
- **AI Commentary Panel**: Context-aware narratives for each drill-down level
- **Period Analysis Switcher**: Toggle between projection vs actual and projection vs projection views
- **Export Options**: PDF reports, CSV variance data downloads

### Backend (Python FastAPI)

- **Dual File Parser**: Processes Old and New model pairs with format consistency validation
- **Structure Detection Engine**: Dynamically identifies hierarchical organization within sheets
- **Variance Calculator**: Computes differences across all detected hierarchy levels
- **Drill-Down Engine**: Traverses model structure to hard-coded values (leaf nodes)
- **Period Alignment System**: Handles different projection horizons and actual vs forecast comparisons
- **AI Interface**: Enhanced Claude integration with model logic analysis and business inference
- **API Layer**: RESTful endpoints optimized for comparative analysis

### Data Flow

```
Dual Excel Upload → Format Validation → Structure Detection → Period Alignment → Variance Calculation → Drill-Down Tree Building → AI Commentary Generation → Interactive Dashboard
```

## Revised Implementation Plan

### Phase 1: Simplify Upload & Session Management

#### 1.1 Remove Session Complexity
- **Current**: Complex session-based file management with GUIDs
- **New**: Simple single-state file replacement (upload new files = complete reset)
- **Benefits**: Eliminates session tracking, reduces complexity, cleaner user experience

#### 1.2 Add "New Analysis" Option
- Add "Upload New Files" button to existing analysis dashboard
- Clear all current data when new files uploaded
- Maintain same upload validation logic but reset state completely

#### 1.3 Remove Model2-Specific Logic
- **Remove**: `Model2RevenueAnalyzer` class and hardcoded revenue segments
- **Remove**: Hardcoded period-to-column mappings
- **Replace**: Generic Excel parser that works with any financial model structure

### Phase 2: Universal Excel Processing Engine

#### 2.1 Sheet Selection Interface (`components/SheetSelector.tsx`)
- **User-Driven Sheet Selection**: Ask user to select which sheets contain IS/BS/CF
- **Sheet List Display**: Show all available sheet names from uploaded files
- **Validation**: Ensure selected sheets exist in both Old and New models
- **Flexibility**: No assumptions about sheet naming conventions

#### 2.2 Consolidated Excel Parser (`services/dual_parser.py`)
- **Unified Architecture**: Single parser handles both universal compatibility and dual model processing
- **Universal Structure Detection**: Work with any Excel model structure without hardcoded dependencies
- **Row-Flexible Matching**: Match line items by name regardless of row position
- **Formula Analysis**: Parse Excel formulas to build drill-down relationships
- **Advanced Features**: Template-based period detection, drill-down analysis, fuzzy matching

Key Features:
- Flexible period detection from column headers using extensible regex patterns
- Line item matching using fuzzy string matching (handle "Total Revenue" vs "Total Revenues")
- Cross-sheet reference parsing for drill-down capabilities
- Generic hierarchy building based on formula dependencies

### Phase 3: User Experience Flow

#### 3.1 Simplified User Journey
```
Upload 2 Files → Select IS/BS/CF Sheets → Choose Period → View Side-by-Side Variance → Drill Down via Formulas
```

#### 3.2 Sheet Selection Flow
- After successful upload, show sheet selection interface
- User selects which sheet is Income Statement, Balance Sheet, Cash Flow
- System validates selections exist in both files
- Store sheet selections for analysis

#### 3.3 Period Selection from Old Model
- Parse all column headers from selected sheets in Old model
- Use extensible regex patterns to detect periods (Q1 2024, 1Q24, FY2024, etc.)
- Present dropdown with detected periods
- User selects period for analysis

#### 3.4 Side-by-Side Variance Display
- Show full financial statement for selected period
- Old value | New value | $ Variance | % Variance for each line item
- Clickable line items for drill-down (if formula-based)
- Visual indicators for significant variances

### Phase 4: Formula-Based Drill-Down Engine

#### 4.1 Excel Formula Parser (`services/formula_analyzer.py`)
- **Formula Extraction**: Parse Excel formulas from both Old and New models
- **Dependency Mapping**: Build parent-child relationships based on cell references
- **Cross-Sheet References**: Handle references to other sheets within the model
- **Leaf Node Detection**: Identify cells with constants or external references

**Key Features:**
- Parse SUM, complex formulas, and cell reference patterns
- Build hierarchical tree based on formula dependencies
- Handle relative and absolute cell references
- Detect external references (other files) as leaf nodes

#### 4.2 Universal Variance Calculator (`services/universal_variance.py`)
- **Generic Line Item Matching**: Match "Total Revenue" across models regardless of row position
- **Simple Variance Math**: Old vs New for absolute and percentage changes
- **Drill-Down Calculation**: Calculate variances for all formula dependencies
- **Missing Item Handling**: Handle line items that exist in one model but not the other

**Drill-Down Logic:**
- User clicks any line item in the side-by-side display
- System shows all formula components that make up that line item
- Each component shows its own variance
- Continue drilling until reaching hard-coded values or external references

### Phase 5: Implementation Priority & Data Models

#### 5.1 Core Data Models (Updated)

```python
class FinancialStatement:
    sheet_name: str
    periods: List[str]  # Detected from column headers
    line_items: Dict[str, LineItem]  # Row-flexible storage
    
class LineItem:
    name: str
    row_number: int  # For reference, but matching by name
    values: Dict[str, float]  # period -> value mapping
    formula: Optional[str]  # Excel formula if exists
    dependencies: List[str]  # Cell references for drill-down
    
class ModelComparison:
    old_model: Dict[str, FinancialStatement]  # sheet_name -> statement
    new_model: Dict[str, FinancialStatement] 
    selected_sheets: Dict[str, str]  # statement_type -> sheet_name
    selected_period: str
    variances: Dict[str, VarianceDetail]
    
class VarianceDetail:
    line_item_name: str
    old_value: float
    new_value: float
    absolute_variance: float
    percentage_variance: float
    drill_down_available: bool
    dependencies: List[VarianceDetail]  # For drill-down
```

#### 5.2 Implementation Steps Priority
1. **Remove Model2-specific code** (quick cleanup)
2. **Add "New Analysis" button** (simple UI addition)
3. **Build sheet selection interface** (critical user experience)
4. **Implement universal period detection** (extensible regex patterns)
5. **Create side-by-side variance display** (core functionality)
6. **Build formula-based drill-down** (complex but essential)

### Phase 6: Technical Implementation Details

#### 6.1 Period Detection Patterns (Extensible)

```python
PERIOD_PATTERNS = [
    r'Q(\d)\s?(\d{4})',           # Q1 2024
    r'(\d)Q(\d{2,4})',           # 1Q24, 1Q2024  
    r'FY\s?(\d{4})',             # FY 2024, FY2024
    r'(\d{4})E?',                # 2024, 2024E
    r'(\w{3})\s?(\d{4})',        # Mar 2024
    r'(\d{1,2})/(\d{4})',        # 3/2024
    # Add more patterns as needed
]
```

#### 6.2 Line Item Matching Logic

```python
def match_line_items(old_items, new_items):
    # Exact match first
    # Fuzzy match with similarity threshold
    # Handle common variations ("Total Revenue" vs "Total Revenues")
    # Flag unmatched items for user review
```

#### 6.3 Formula Parsing Strategy

- Use `openpyxl` to extract formulas as strings
- Parse cell references (A1, $B$2, Sheet1!C3)
- Build dependency graph
- Handle circular references gracefully
- Support common functions (SUM, IF, VLOOKUP)

### Phase 7: Revised Development Timeline

#### 7.1 Week 1-2: Cleanup & Foundation
- **Remove Model2-specific code**: Clean out hardcoded logic
- **Add "New Analysis" button**: Simple upload reset functionality
- **Build sheet selection UI**: Dropdown interface for IS/BS/CF selection
- **Test with current Model2 models**: Ensure backwards compatibility

#### 7.2 Week 3-4: Universal Parser
- **Implement period detection**: Extensible regex patterns
- **Build line item matching**: Row-flexible matching by name
- **Create basic variance calculation**: Simple old vs new math
- **Test with different Excel structures**: Validate universality

#### 7.3 Week 5-6: Side-by-Side Display
- **Build variance table UI**: Old | New | $ Var | % Var columns
- **Add statement selection**: Toggle between IS/BS/CF views
- **Implement period dropdown**: Dynamic from detected periods
- **Visual variance indicators**: Color coding for significant changes

#### 7.4 Week 7-8: Formula-Based Drill-Down
- **Excel formula parser**: Extract and analyze formulas
- **Dependency mapping**: Build parent-child relationships
- **Drill-down UI**: Clickable line items with sub-components
- **Handle cross-sheet references**: Multi-sheet dependency tracking

#### 7.5 Week 9-10: Polish & Testing
- **Error handling**: Graceful handling of parsing failures
- **Performance optimization**: Fast processing for large models
- **User experience refinement**: Smooth workflows and clear messaging
- **Comprehensive testing**: Multiple Excel model types and structures

### Phase 8: Success Metrics & Key Differences

#### 8.1 Revised Success Metrics
- **Universal Compatibility**: Work with any two Excel files with similar structure (not just Model2 models)
- **User-Driven Configuration**: Sheet selection eliminates auto-detection complexity
- **Formula-Based Intelligence**: Drill-down based on actual Excel formulas, not hardcoded hierarchies  
- **Simplified State Management**: File replacement instead of session management
- **Period Flexibility**: Dynamic detection from any Excel model structure

#### 8.2 Key Architectural Changes
- **From**: Hardcoded Model2 revenue segments → **To**: Generic line item matching
- **From**: Complex session management → **To**: Simple state replacement  
- **From**: Assumed sheet names → **To**: User-selected sheets
- **From**: Fixed period mappings → **To**: Dynamic period detection
- **From**: Predefined hierarchies → **To**: Formula-based drill-down trees

#### 8.3 Implementation Simplifications
- **Removed Complexity**: No more GUID session tracking, Model2-specific parsing, hardcoded mappings
- **Added Flexibility**: Works with any Excel model, user-driven configuration, extensible patterns
- **Maintained Power**: Full drill-down capabilities, variance analysis, side-by-side comparison

## Updated Technical Specifications

### Performance Requirements (Revised)
- **File Upload & Parsing**: <30 seconds for typical Excel file pairs
- **Sheet Selection & Period Detection**: <5 seconds for dropdown population
- **Variance Calculation**: <10 seconds for side-by-side comparison
- **Drill-Down Analysis**: <3 seconds for formula parsing and dependency mapping
- **UI Responsiveness**: <1 second for all user interactions

### Simplified Architecture Benefits
- **Reduced Complexity**: Eliminates session management overhead
- **Universal Compatibility**: No model-specific hardcoding
- **User Control**: Sheet selection reduces auto-detection failures
- **Extensible Patterns**: Easy to add new period detection patterns
- **Formula Intelligence**: True Excel-native drill-down capabilities

### Error Handling (Simplified)
- **Upload Validation**: File format and readability checks
- **Sheet Selection**: Clear validation that selected sheets exist in both files
- **Period Matching**: Handle cases where periods don't exist in New model
- **Formula Parsing**: Graceful handling of complex or unsupported formulas
- **Line Item Matching**: Clear indication when line items can't be matched between models

## Revised Development Timeline

**Week 1-2**: Remove Model2 code, add "New Analysis" button, build sheet selection UI
**Week 3-4**: Universal period detection, line item matching, basic variance calculation  
**Week 5-6**: Side-by-side variance display, statement selection, period dropdown
**Week 7-8**: Formula parsing, dependency mapping, drill-down functionality
**Week 9-10**: Polish, error handling, testing with diverse Excel models

## Updated Success Metrics

- **Universal Compatibility**: Successfully analyze any two Excel files with similar financial structure
- **User Experience**: Intuitive 4-step workflow (Upload → Select Sheets → Choose Period → Analyze)
- **Formula Intelligence**: Accurate drill-down through Excel formula dependencies
- **Performance**: Complete analysis in <60 seconds regardless of Excel model source
- **Maintainability**: Extensible patterns for new period formats and formula types
