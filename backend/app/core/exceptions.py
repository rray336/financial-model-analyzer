from typing import Any, Dict, Optional

class FinancialModelAnalyzerException(Exception):
    """Base exception for the Financial Model Analyzer application"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class ModelParsingException(FinancialModelAnalyzerException):
    """Raised when Excel model parsing fails"""
    pass

class StructureDetectionException(FinancialModelAnalyzerException):
    """Raised when model structure detection fails"""
    pass

class ModelConsistencyException(FinancialModelAnalyzerException):
    """Raised when Old and New models are inconsistent"""
    pass

class VarianceCalculationException(FinancialModelAnalyzerException):
    """Raised when variance calculation fails"""
    pass

class AICommentaryException(FinancialModelAnalyzerException):
    """Raised when AI commentary generation fails"""
    pass

class SessionNotFoundException(FinancialModelAnalyzerException):
    """Raised when session is not found"""
    pass

class InvalidHierarchyPathException(FinancialModelAnalyzerException):
    """Raised when hierarchy path is invalid"""
    pass