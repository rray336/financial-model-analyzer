# Financial Model Analyzer - Technical Context

## Project Status: MIGRATED TO "MODEL ANALYSIS" PROJECT

**Migration Date**: January 9, 2025  
**Reason**: Core functionality not working, development moved to new project  
**New Project**: Model Analysis

**PROJECT STATUS**: Development discontinued - migrated to "Model Analysis" project

## Original Technology Stack Overview

The Financial Model Analyzer was built using modern web technologies with a focus on performance, reliability, and maintainability. The stack was chosen to handle complex Excel processing while providing an intuitive user experience.

## Backend Technologies

### Core Framework: FastAPI (Python)

**Why FastAPI**:

- High performance with automatic API documentation
- Native async support for concurrent processing
- Excellent type hints integration with Pydantic
- Built-in validation and serialization
- Easy testing and development

**Version**: FastAPI 0.104.1

**Key Features Used**:

- Automatic OpenAPI/Swagger documentation
- Request/response validation with Pydantic models
- File upload handling with multipart forms
- Background tasks for long-running operations
- Dependency injection for service management

### Excel Processing: openpyxl + pandas

**openpyxl (3.1.2)**:

- Read/write Excel files (.xlsx, .xlsm)
- Formula extraction and analysis
- Cell formatting and style information
- Sheet and workbook manipulation

**pandas (2.1.3)**:

- Data manipulation and analysis
- DataFrame operations for financial data
- Statistical calculations and aggregations
- Data alignment and merging operations

**Integration Pattern**:

```python
# Load Excel with openpyxl for formula access
workbook = openpyxl.load_workbook(file_path, data_only=False)
# Convert to pandas for data manipulation
df = pd.DataFrame(sheet.values)
# Process formulas separately for hierarchy detection
formulas = extract_formulas(sheet)
```

### AI Integration: Anthropic Claude API

**anthropic (0.7.7)**:

- Context-aware commentary generation
- Business insight analysis
- Model logic interpretation
- Structured response formatting

**Usage Pattern**:

```python
client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
response = await client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1000,
    messages=[{"role": "user", "content": prompt}]
)
```

### Data Models: Pydantic

**pydantic (2.5.0)**:

- Type-safe data models
- Automatic validation and serialization
- JSON schema generation
- Configuration management

**Key Models**:

```python
class FinancialModel(BaseModel):
    sheets: Dict[str, FinancialStatement]
    periods: List[str]
    metadata: ModelMetadata

class VarianceDetail(BaseModel):
    line_item: str
    old_value: float
    new_value: float
    absolute_variance: float
    percentage_variance: float
    significance_level: float
```

### Server: Uvicorn

**uvicorn (0.24.0)**:

- ASGI server for FastAPI
- High performance with async support
- Hot reload for development
- Production-ready deployment

**Configuration**:

```python
uvicorn.run(
    "app.main:app",
    host="0.0.0.0",
    port=8000,
    reload=True,  # Development only
    workers=1     # Single worker for file processing
)
```

## Frontend Technologies

### Core Framework: React + TypeScript

**React (18.2.0)**:

- Component-based architecture
- Virtual DOM for performance
- Rich ecosystem and community
- Excellent developer tools

**TypeScript (5.0.0)**:

- Static type checking
- Better IDE support and refactoring
- Reduced runtime errors
- Enhanced code documentation

**Key Patterns Used**:

```typescript
// Custom hooks for data management
const useVarianceData = (sessionId: string) => {
  return useQuery({
    queryKey: ["variance", sessionId],
    queryFn: () => api.getVarianceAnalysis(sessionId),
  });
};

// Type-safe component props
interface VarianceDashboardProps {
  sessionId: string;
  hierarchyPath?: string;
  onNavigate: (path: string[]) => void;
}
```

### Styling: Tailwind CSS

**tailwindcss (3.3.0)**:

- Utility-first CSS framework
- Consistent design system
- Responsive design utilities
- Small bundle size with purging

**Configuration**:

```javascript
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#007bff",
        secondary: "#6c757d",
        success: "#28a745",
        danger: "#dc3545",
      },
    },
  },
};
```

### Charts: Recharts

**recharts (2.8.0)**:

- React-native chart library
- Responsive and customizable
- Built-in animations
- TypeScript support

**Chart Types Used**:

- Waterfall charts for variance visualization
- Bar charts for side-by-side comparisons
- Line charts for trend analysis
- Pie charts for composition analysis

### State Management: React Query

**@tanstack/react-query (5.8.0)**:

- Server state management
- Caching and synchronization
- Background updates
- Optimistic updates

**Usage Pattern**:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

### File Upload: React Dropzone

**react-dropzone (14.2.3)**:

- Drag-and-drop file upload
- File type validation
- Multiple file handling
- Progress tracking

### HTTP Client: Axios

**axios (1.6.0)**:

- Promise-based HTTP client
- Request/response interceptors
- Automatic JSON parsing
- Error handling

**Configuration**:

```typescript
const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  timeout: 60000, // 60 seconds for large file processing
  headers: {
    "Content-Type": "application/json",
  },
});
```

## Development Environment

### Build Tools

**Vite (4.4.0)**:

- Fast development server
- Hot module replacement
- Optimized production builds
- Plugin ecosystem

**Configuration**:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
```

### Package Management

**npm**:

- Dependency management
- Script execution
- Version locking with package-lock.json

**Key Scripts**:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx"
  }
}
```

### Code Quality

**ESLint + Prettier**:

- Code linting and formatting
- Consistent code style
- Error prevention
- IDE integration

## Infrastructure & Deployment

### Development Setup

**Local Development**:

- Backend: Python virtual environment with pip
- Frontend: Node.js with npm
- File storage: Local filesystem
- Database: In-memory data structures

**Environment Variables**:

```bash
# Backend (.env)
ANTHROPIC_API_KEY=your_api_key_here
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=100MB

# Frontend (.env.local)
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Production Deployment

**Docker Containerization**:

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

**Docker Compose**:

```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## Performance Considerations

### Backend Performance

**File Processing Optimization**:

- Streaming file uploads for large files
- Chunked processing to manage memory usage
- Background tasks for long-running operations
- Caching of parsed model structures

**Memory Management**:

```python
# Process large files in chunks
def process_large_excel(file_path: str, chunk_size: int = 1000):
    for chunk in pd.read_excel(file_path, chunksize=chunk_size):
        yield process_chunk(chunk)
```

**Caching Strategy**:

- In-memory caching for session data
- AI commentary caching to reduce API calls
- Parsed formula caching for navigation

### Frontend Performance

**Bundle Optimization**:

- Code splitting with dynamic imports
- Tree shaking to remove unused code
- Asset optimization and compression

**Rendering Optimization**:

```typescript
// Memoization for expensive calculations
const expensiveCalculation = useMemo(() => {
  return calculateVariances(data);
}, [data]);

// Virtual scrolling for large datasets
const VirtualizedTable = ({ items }) => {
  return (
    <FixedSizeList height={600} itemCount={items.length} itemSize={50}>
      {Row}
    </FixedSizeList>
  );
};
```

## Security Implementation

### File Upload Security

**Validation**:

```python
ALLOWED_EXTENSIONS = {'.xlsx', '.xls'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

def validate_file(file: UploadFile):
    if not file.filename.endswith(tuple(ALLOWED_EXTENSIONS)):
        raise HTTPException(400, "Invalid file type")
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large")
```

**Sanitization**:

- File content validation
- Formula parsing with safety checks
- Temporary file cleanup

### API Security

**Input Validation**:

```python
class UploadRequest(BaseModel):
    old_file: UploadFile
    new_file: UploadFile

    @validator('old_file', 'new_file')
    def validate_files(cls, v):
        return validate_file(v)
```

**Rate Limiting**:

- AI API call rate limiting
- File upload frequency limits
- Resource usage monitoring

## Testing Strategy

### Backend Testing

**Unit Tests**:

```python
def test_variance_calculation():
    old_value = 100.0
    new_value = 120.0
    variance = calculate_variance(old_value, new_value)
    assert variance.absolute == 20.0
    assert variance.percentage == 0.2
```

**Integration Tests**:

- Excel parsing with sample files
- API endpoint testing
- Error handling validation

### Frontend Testing

**Component Tests**:

```typescript
test("VarianceCard displays correct values", () => {
  render(<VarianceCard oldValue={100} newValue={120} />);
  expect(screen.getByText("20.0")).toBeInTheDocument();
  expect(screen.getByText("20.0%")).toBeInTheDocument();
});
```

**E2E Tests**:

- File upload workflow
- Navigation and drill-down
- Export functionality

## Monitoring & Debugging

### Development Tools

**Backend Debugging**:

- FastAPI automatic documentation at `/docs`
- Python debugger integration
- Logging with structured output

**Frontend Debugging**:

- React Developer Tools
- Redux DevTools for state inspection
- Browser performance profiling

### Production Monitoring

**Health Checks**:

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }
```

**Error Tracking**:

- Structured logging
- Error aggregation
- Performance metrics

This technical context provides the foundation for understanding the implementation details and making informed technical decisions throughout the development process.
