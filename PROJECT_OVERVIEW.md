# 🚨 PROJECT MIGRATED - NOT FUNCTIONAL

**IMPORTANT NOTICE**: This project has been migrated to **Model Analysis** project. The core functionality in this repository does not work yet and development has moved to the new project.

This repository is maintained for reference and learning purposes only.

---

# Financial Model Analyzer - Project Documentation

A universal Excel financial model comparison tool with AI-powered variance analysis and unlimited drill-down capabilities.

## Table of Contents

1. [Project Status](#project-status)
2. [Overview](#overview)
3. [System Architecture](#system-architecture)
4. [Implementation Plan](#implementation-plan)
5. [Development Status](#development-status)
6. [Quick Start](#quick-start)
7. [Current Issues](#current-issues)
8. [Session Cleanup](#session-cleanup)
9. [Contributing](#contributing)

---

## Project Status

**Current Phase**: Phase 1 Complete ✅  
**Next Phase**: Phase 2 - Excel Processing Engine  
**Migration Status**: Core functionality moved to **Model Analysis** project

### Working Functionality ✅

- **Dual File Upload**: Successfully uploads and processes Old vs New model pairs
- **Sheet Selection**: User can manually select Income Statement, Balance Sheet, and Cash Flow sheets
- **Period Detection/Selection**: Universal period detection working or user can manually specify periods
- **Variance Analysis UI**: Complete dashboard showing side-by-side comparisons with drill-down capabilities

### Critical Issues 🚨

1. **Some Excel Formats - Cash Flow Statement Not Working** (33% of financial statements unusable)
2. **Other Excel Formats - Complete Failure** (100% failure rate for alternative formats)
3. **UI Bug - Non-Functional New Analysis Button** (duplicate buttons causing user confusion)

---

## Overview

The Financial Model Analyzer allows you to upload two Excel financial models (Old vs New) from different periods and automatically:

- **Analyzes variances** across all KPIs and hierarchy levels
- **Detects model structure** dynamically without assuming naming conventions
- **Provides AI-powered commentary** explaining business drivers of changes
- **Enables unlimited drill-down** to investigate variances at any level
- **Supports multiple comparison modes** (projection vs actual, projection vs projection)

---

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

---

## Implementation Plan

### Phase 1: Foundation & Core Infrastructure ✅

#### Step 1: Project Setup & Structure ✅
- [x] Complete project structure created
- [x] Virtual environment set up with dependencies
- [x] Git repository initialized
- [x] Basic FastAPI app running
- [x] React app scaffolded and running
- [x] Development environment documented

### Phase 2: Excel Processing Engine

#### Step 2: Basic Excel Parser Implementation
**Objective**: Build the foundation for processing paired Excel financial models

**Key Features:**
- Dual file processing with consistency validation
- Smart sheet detection for financial statements
- Period detection and alignment
- Data extraction with flexible row/column handling

#### Step 3: Structure Detection Engine
**Objective**: Dynamically detect hierarchical structure within Excel sheets

**Key Features:**
- Within-sheet hierarchy analysis
- Parent-child relationship mapping
- Formula vs hard-coded value classification
- Drill-down path generation

### Phase 3: Variance Analysis Core

#### Step 4: Variance Calculation System
**Objective**: Build comprehensive variance analysis across all hierarchy levels

**Key Features:**
- Multi-level variance computation
- Period alignment between different model horizons
- Price/volume decomposition where possible
- Statistical significance assessment

#### Step 5: Data Models & API Foundation
**Objective**: Complete the data model structure and API endpoints

### Phase 4: Frontend Foundation

#### Step 6: React App Setup ✅
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] API service layer
- [x] Common UI components

#### Step 7: Dual Upload Interface ✅
- [x] Side-by-side Old/New model upload areas
- [x] Drag-and-drop functionality
- [x] File validation and error handling
- [x] Upload progress indicators

### Phase 5: Dashboard & Navigation ✅

#### Step 8: Variance Dashboard ✅
- [x] Executive summary with key variances
- [x] KPI comparison cards
- [x] Period analysis toggle
- [x] Navigation to drill-down levels

#### Step 9: Breadcrumb Navigation System ✅
- [x] Breadcrumb navigation working
- [x] Tree view toggle implemented
- [x] Smooth navigation between levels
- [x] Visual indicators for current position

### Phase 6-8: Advanced Features (Planned)

- **AI Integration**: Claude API integration with context-aware commentary
- **Visualization & Export**: Advanced charts and comprehensive export functionality
- **Testing & Polish**: Comprehensive testing and deployment preparation

---

## Development Status

### Completed Features ✅

- **Project Structure**: Complete backend/frontend architecture
- **File Upload**: Dual file upload with validation
- **Session Management**: Model pair tracking
- **Basic UI**: Responsive dashboard with navigation
- **API Foundation**: Core endpoints established

### In Progress 🔄

- **Excel Parsing Engine**: Universal compatibility improvements
- **Structure Detection**: Dynamic hierarchy analysis
- **Variance Calculation**: Multi-level computation

### Planned 📋

- **AI Commentary**: Claude integration
- **Advanced Visualizations**: Charts and graphs
- **Export Functionality**: PDF and data export

---

## Quick Start

### Prerequisites

- **Backend**: Python 3.8+, pip
- **Frontend**: Node.js 16+, npm
- **API Key**: Anthropic Claude API key for AI commentary

### Installation

1. **Clone the repository**
   ```bash
   cd financial_model_analyzer
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # Create .env file in backend/
   echo "ANTHROPIC_API_KEY=your_api_key_here" > .env
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

---

## Current Issues

### Universal Compatibility Problems

The system was designed to work with **any** Excel financial model format but currently has significant compatibility issues:

#### Issue #1: Some Excel Formats - Cash Flow Statement Not Working
- **Status**: Income Statement ✅ and Balance Sheet ✅ show line items and variances correctly
- **Problem**: Cash Flow Statement ❌ fails to display line items/variances
- **Impact**: 33% of financial statements unusable for certain Excel formats

#### Issue #2: Other Excel Formats - Complete Failure
- **Status**: All financial statements ❌ fail to show line items for alternative Excel formats
- **Problem**: No line items display for Income Statement, Balance Sheet, OR Cash Flow
- **Impact**: 100% failure rate for alternative Excel formats

#### Issue #3: UI Bug - Non-Functional New Analysis Button
- **Status**: Top-right "New Analysis" button ❌ doesn't do anything
- **Working**: Left-side "New Analysis" button ✅ works correctly
- **Impact**: User confusion with duplicate non-functional buttons

### Root Cause Analysis

**Hypothesis**: Format-Specific Code Assumptions

The variance analysis code contains format-specific assumptions that:
1. Works partially with some Excel formats (Income Statement + Balance Sheet)
2. Fails completely with other Excel formats due to different naming conventions
3. Has specific issues with Cash Flow processing regardless of Excel format

### Key Files to Investigate

**Backend Files:**
- `backend/app/services/universal_parser.py` - Universal Excel parsing and line item extraction
- `backend/app/services/variance_calculator.py` - Variance computation logic
- `backend/app/api/endpoints/analysis.py` - API data serving

**Frontend Files:**
- `frontend/src/components/variance/VarianceTable.tsx` - Line item display
- `frontend/src/components/dashboard/VarianceDashboard.tsx` - New Analysis button

---

## Session Cleanup

### Overview

Comprehensive guide for safely removing temporary files, test files, and development artifacts at the end of any development session.

### Quick Start

#### Python Script (Recommended)
```bash
# Dry run (safe preview)
python scripts/cleanup_session.py

# Execute cleanup
python scripts/cleanup_session.py --execute

# Custom categories
python scripts/cleanup_session.py --execute --categories test_files cache logs
```

### File Categories

1. **Test Files** (`test_files`) - Project-specific temporary files created for testing
2. **Cache Files** (`cache`) - Generated files that can be safely regenerated
3. **Log Files** (`logs`) - Development and runtime log files
4. **Runtime Temp Files** (`runtime`) - Temporary directories created during runtime
5. **System Temp Files** (`system`) - OS-generated temporary files

### Safety Mechanisms

#### Protected Files (Never Removed)
- Source code files (`*.py`, `*.tsx`, `*.ts`, `*.js`)
- Configuration files (`package.json`, `requirements.txt`, `.gitignore`)
- Documentation (`*.md`, `*.txt`, `README*`, `LICENSE*`)
- Core directories (`src/`, `app/`, `.git/`)

### Cleanup Checklist

#### Pre-Cleanup Checklist
- [ ] All important code changes are committed to git
- [ ] Development servers are stopped
- [ ] No active file uploads or sessions in progress
- [ ] Current work is saved and backed up

#### Post-Cleanup Verification
- [ ] Project still builds and runs correctly
- [ ] Git repository is in clean state
- [ ] No essential files were accidentally removed
- [ ] Development environment functions normally

---

## Contributing

This project is currently under active development. The implementation follows a structured approach:

1. **Phase-based Development**: Each phase builds on the previous one
2. **Universal Compatibility**: Must work with any Excel financial model format
3. **User-Driven Configuration**: Sheet selection eliminates auto-detection complexity
4. **Formula-Based Intelligence**: Drill-down based on actual Excel formulas

### Development Timeline

- **Week 1-2**: Remove format-specific code, add "New Analysis" button, build sheet selection UI
- **Week 3-4**: Universal period detection, line item matching, basic variance calculation
- **Week 5-6**: Side-by-side variance display, statement selection, period dropdown
- **Week 7-8**: Formula parsing, dependency mapping, drill-down functionality
- **Week 9-10**: Polish, error handling, testing with diverse Excel models

### Success Criteria

- **Universal Compatibility**: Successfully analyze any two Excel files with similar financial structure
- **User Experience**: Intuitive 4-step workflow (Upload → Select Sheets → Choose Period → Analyze)
- **Formula Intelligence**: Accurate drill-down through Excel formula dependencies
- **Performance**: Complete analysis in <60 seconds regardless of Excel model source
- **Maintainability**: Extensible patterns for new period formats and formula types

---

## API Documentation

### Upload Models

```http
POST /api/v1/upload-models
Content-Type: multipart/form-data

old_file: File
new_file: File
```

### Get Variance Analysis

```http
GET /api/v1/variance/{session_id}
GET /api/v1/variance/{session_id}/{hierarchy_path}
```

### Get Model Structure

```http
GET /api/v1/structure/{session_id}
```

---

## Project Structure

```
financial_model_analyzer/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Data models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── tests/              # Backend tests
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API client
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── Examples/              # Sample Excel models
│   └── sample_models/     # Example financial models for testing
└── PROJECT_OVERVIEW.md   # This consolidated documentation
```

---

## Support

For technical questions or issues:

1. **Check the cleanup log** for detailed information about what was processed
2. **Review this guide** for common solutions and best practices
3. **Test in dry-run mode first** before executing any destructive operations
4. **Keep backups** of important work before running cleanup

---

**Status**: Universal compatibility broken - significant hardcoded logic needs removal  
**Priority**: HIGH - Core functionality failing for most use cases  
**Migration Status**: Core functionality moved to **Model Analysis** project

---

*Last Updated: January 2025*  
*Version: 1.0*  
*Compatibility: Python 3.8+, Node.js 16+*