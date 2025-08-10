# Financial Model Analyzer

A dual Excel financial model comparison tool with AI-powered variance analysis and unlimited drill-down capabilities.

## Overview

The Financial Model Analyzer allows you to upload two Excel financial models (Old vs New) from different periods and automatically:

- **Analyzes variances** across all KPIs and hierarchy levels
- **Detects model structure** dynamically without assuming naming conventions
- **Provides AI-powered commentary** explaining business drivers of changes
- **Enables unlimited drill-down** to investigate variances at any level
- **Supports multiple comparison modes** (projection vs actual, projection vs projection)

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
├── Models/                 # Sample Excel models
│   ├── BC/                # Barclays models
│   ├── BOFA/              # Bank of America models
│   └── GS/                # Goldman Sachs models
├── BUILD_PLAN.md          # Detailed implementation plan
└── PROJECT_PLAN.md        # High-level project overview
```

## Features

### Current (Phase 1 Complete)

- ✅ **Dual file upload** with validation
- ✅ **Basic project structure** and API endpoints
- ✅ **Responsive React dashboard** with navigation
- ✅ **Session management** for model pairs
- ✅ **Executive summary** display

### Coming Soon

- 🔄 **Excel parsing engine** (Phase 2)
- 🔄 **Dynamic structure detection** (Phase 3)
- 🔄 **Variance calculation** (Phase 4)
- 🔄 **AI commentary integration** (Phase 5)
- 🔄 **Advanced visualizations** (Phase 6)
- 🔄 **Export functionality** (Phase 7)

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

See the [BUILD_PLAN.md](BUILD_PLAN.md) for complete API specifications.

## Development Status

**Current Phase**: Phase 1 Complete ✅  
**Next Phase**: Phase 2 - Excel Processing Engine

Track progress in our [detailed build plan](BUILD_PLAN.md).

## Contributing

This is currently under active development following our [BUILD_PLAN.md](BUILD_PLAN.md).

## License

Private development project.

## Support

For technical questions or issues, refer to:

- [BUILD_PLAN.md](BUILD_PLAN.md) - Implementation details
- [PROJECT_PLAN.md](PROJECT_PLAN.md) - High-level specifications
