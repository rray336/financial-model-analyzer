from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import upload, analysis, export
from app.core.config import settings

app = FastAPI(
    title="Financial Model Analyzer API",
    description="API for comparing and analyzing Excel financial models",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(upload.router, prefix="/api/v1", tags=["upload"])
app.include_router(analysis.router, prefix="/api/v1", tags=["analysis"])
app.include_router(export.router, prefix="/api/v1", tags=["export"])

@app.get("/")
async def root():
    return {"message": "Financial Model Analyzer API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/")
async def api_root():
    return {"message": "Financial Model Analyzer API v1", "version": "1.0.0", "endpoints": ["upload-models", "variance", "structure", "export"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)