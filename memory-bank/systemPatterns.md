# Financial Model Analyzer - System Patterns & Architecture

## Project Status: MIGRATED TO "MODEL ANALYSIS" PROJECT

**Migration Date**: January 9, 2025  
**Reason**: Core functionality not working, development moved to new project  
**New Project**: Model Analysis

**PROJECT STATUS**: Development discontinued - migrated to "Model Analysis" project

## Original System Architecture Overview

The Financial Model Analyzer was designed to follow a clean separation between frontend and backend with a RESTful API interface. The architecture was designed for single-user operation with local file processing and in-memory data structures.

```
┌─────────────────┐    HTTP/REST    ┌──────────────────┐
│   React Frontend │ ◄──────────────► │  FastAPI Backend │
│   (TypeScript)   │                 │    (Python)      │
└─────────────────┘                 └──────────────────┘
         │                                    │
         │                                    │
    ┌────▼────┐                          ┌───▼────┐
    │ Browser │                          │  Local │
    │ Storage │                          │  Files │
    └─────────┘                          └────────┘
```

## Core Design Patterns

### 1. Universal Parser Pattern

**Problem**: Excel financial models come in countless formats and structures
**Solution**: Single parser that adapts to any Excel model structure

```python
class UniversalExcelParser:
    def parse_model_pair(self, old_file: str, new_file: str) -> ModelComparison:
        # 1. Load both files with openpyxl
        # 2. Detect sheet types using keyword analysis
        # 3. Extract data with flexible row/column handling
        # 4. Build unified data structure
        # 5. Return comparison-ready object
```

**Key Principles**:

- No hardcoded cell references or sheet names
- Flexible period detection using regex patterns
- Fuzzy matching for line item names
- Graceful handling of structural differences

### 2. Formula-Based Hierarchy Detection

**Problem**: Need to understand model relationships without hardcoded assumptions
**Solution**: Parse Excel formulas to build dynamic drill-down trees

```python
class FormulaAnalyzer:
    def build_hierarchy_tree(self, sheet_data: DataFrame) -> HierarchyTree:
        # 1. Extract formulas from all cells
        # 2. Parse cell references (A1, $B$2, Sheet1!C3)
        # 3. Build dependency graph
        # 4. Identify parent-child relationships
        # 5. Create navigable tree structure
```

**Key Components**:

- Formula extraction using openpyxl
- Cell reference parsing with regex
- Dependency graph construction
- Circular reference detection
- Leaf node identification (hard-coded values)

### 3. Variance Attribution Pattern

**Problem**: Users need to understand not just what changed, but why
**Solution**: Multi-level variance calculation with component attribution

```python
class VarianceCalculator:
    def calculate_comprehensive_variance(self,
                                       old_model: FinancialModel,
                                       new_model: FinancialModel) -> VarianceAnalysis:
        # 1. Align periods between models
        # 2. Match line items using fuzzy logic
        # 3. Calculate variances at all levels
        # 4. Attribute changes to components
        # 5. Assess statistical significance
```

**Attribution Logic**:

- Component-level variance decomposition
- Statistical significance testing
- Confidence scoring for attributions
- Handling of missing or new line items

### 4. Context-Aware AI Integration

**Problem**: Raw variance numbers lack business context
**Solution**: AI commentary that understands model structure and business logic

```python
class AICommentaryService:
    def generate_commentary(self,
                          variance_detail: VarianceDetail,
                          hierarchy_context: HierarchyContext) -> Commentary:
        # 1. Build context-aware prompt
        # 2. Include model formulas and relationships
        # 3. Add business reasoning context
        # 4. Generate structured commentary
        # 5. Cache results for performance
```

**Context Building**:

- Model structure analysis
- Formula relationship mapping
- Business driver inference
- Historical pattern recognition

## Data Flow Architecture

### Upload and Processing Flow

```
Excel Files → Validation → Parsing → Structure Detection → Variance Calculation → AI Commentary → Dashboard Display
```

**Detailed Steps**:

1. **File Upload & Validation**

   - File format validation (.xlsx, .xls)
   - Size and structure checks
   - Consistency validation between Old/New models

2. **Universal Parsing**

   - Sheet detection and classification
   - Period identification and alignment
   - Data extraction with flexible positioning
   - Formula extraction and analysis

3. **Structure Detection**

   - Hierarchy relationship mapping
   - Parent-child dependency identification
   - Drill-down path generation
   - Cross-sheet reference handling

4. **Variance Calculation**

   - Line item matching and alignment
   - Multi-level variance computation
   - Statistical significance assessment
   - Component attribution analysis

5. **AI Commentary Generation**

   - Context-aware prompt construction
   - Business insight generation
   - Recommendation formulation
   - Result caching for performance

6. **Dashboard Rendering**
   - Executive summary generation
   - Interactive visualization creation
   - Navigation structure building
   - Export preparation

### Navigation and Drill-Down Flow

```
Executive Summary → Statement View → Line Item Detail → Component Analysis → Individual Cell Values
```

**Navigation Patterns**:

- Breadcrumb trail maintenance
- Tree view alternative navigation
- Context preservation across levels
- Back/forward navigation support

## Component Relationships

### Backend Service Layer

```python
# Core Services
UniversalExcelParser     # File processing and data extraction
StructureDetector       # Hierarchy and relationship detection
VarianceCalculator      # Multi-level variance computation
FormulaAnalyzer        # Excel formula parsing and analysis
AICommentaryService    # Context-aware AI integration

# Supporting Services
ExcelUtils             # Low-level Excel manipulation
ValidationService      # Input validation and error handling
CacheService          # Performance optimization
ExportService         # Report generation
```

**Service Dependencies**:

- Parser → StructureDetector → VarianceCalculator
- VarianceCalculator → AICommentaryService
- All services → ValidationService, CacheService

### Frontend Component Architecture

```typescript
// Core Components
DualFileUpload; // File upload interface
VarianceDashboard; // Main analysis display
BreadcrumbNavigation; // Drill-down navigation
AICommentaryPanel; // AI insights display

// Supporting Components
ExecutiveSummary; // High-level variance overview
KPICards; // Individual variance displays
VarianceTable; // Detailed comparison table
ExportControls; // Report generation interface
```

**Component Hierarchy**:

- App → VarianceDashboard → [ExecutiveSummary, KPICards, VarianceTable]
- VarianceDashboard → BreadcrumbNavigation → TreeViewToggle
- VarianceDashboard → AICommentaryPanel → InsightCards

## Key Technical Decisions

### 1. In-Memory Processing

**Decision**: Process all data in memory without persistent database
**Rationale**: Single-user application with session-based analysis
**Trade-offs**: Fast processing vs memory usage for large files

### 2. Formula-Based Intelligence

**Decision**: Parse Excel formulas to understand model structure
**Rationale**: Provides true understanding vs hardcoded assumptions
**Trade-offs**: Complex parsing logic vs universal compatibility

### 3. RESTful API Design

**Decision**: Clean separation between frontend and backend
**Rationale**: Enables future extensibility and testing
**Trade-offs**: Network overhead vs architectural clarity

### 4. React with TypeScript

**Decision**: Type-safe frontend development
**Rationale**: Better development experience and error prevention
**Trade-offs**: Learning curve vs code quality

### 5. AI Integration via API

**Decision**: External AI service rather than local models
**Rationale**: Better quality insights with latest AI capabilities
**Trade-offs**: External dependency vs insight quality

## Performance Patterns

### 1. Lazy Loading

- Load analysis data on-demand as user navigates
- Cache results to avoid recomputation
- Progressive disclosure of detail levels

### 2. Streaming Processing

- Process large Excel files in chunks
- Stream results to frontend as available
- Provide progress indicators for long operations

### 3. Intelligent Caching

- Cache AI commentary to avoid API rate limits
- Cache parsed model structures for navigation
- Invalidate cache appropriately on new uploads

### 4. Optimized Rendering

- Virtual scrolling for large data tables
- Debounced search and filtering
- Efficient React re-rendering patterns

## Error Handling Patterns

### 1. Graceful Degradation

- Continue processing when non-critical components fail
- Provide partial results when full analysis isn't possible
- Clear communication about limitations

### 2. User-Friendly Error Messages

- Business language rather than technical errors
- Actionable guidance for resolution
- Context about what was attempted

### 3. Fallback Mechanisms

- Manual sheet selection when auto-detection fails
- Alternative period matching strategies
- Simplified analysis when formula parsing fails

### 4. Recovery Strategies

- Retry mechanisms for transient failures
- Alternative processing paths for edge cases
- Data validation with correction suggestions

## Security Considerations

### 1. File Processing Security

- Validate file formats and content
- Sanitize Excel formula parsing
- Prevent malicious file execution

### 2. API Security

- Input validation on all endpoints
- Rate limiting for AI API calls
- Secure handling of uploaded files

### 3. Data Privacy

- Local processing without cloud storage
- Temporary file cleanup after processing
- No persistent storage of sensitive data

This system architecture provides a solid foundation for building a reliable, performant, and maintainable financial model analysis tool.
