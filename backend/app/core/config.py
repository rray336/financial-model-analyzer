from pydantic import BaseModel
from typing import Optional
import os

class Settings(BaseModel):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Financial Model Analyzer"
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS: set = {".xlsx", ".xls"}
    UPLOAD_DIR: str = "uploads"
    
    # AI Configuration
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
    
    # Session Configuration
    SESSION_TIMEOUT: int = 3600  # 1 hour in seconds
    
    # Processing Configuration
    MAX_HIERARCHY_DEPTH: int = 10
    VARIANCE_THRESHOLD: float = 0.01  # 1% threshold for significance
    
    class Config:
        env_file = ".env"

settings = Settings()