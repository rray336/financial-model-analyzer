from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

from app.models.comparison import HierarchyTree, NavigationState
from app.models.variance import VarianceAnalysis, HierarchyVariance

router = APIRouter()

# Import the active_sessions from upload module (temporary solution)
from app.api.endpoints.upload import active_sessions

# Set up logger
logger = logging.getLogger(__name__)

@router.get("/structure/{session_id}", response_model=Dict[str, Any])
async def get_model_structure(session_id: str):
    """
    Get the detected hierarchical structure of the model pair
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    if session["status"] != "completed":
        raise HTTPException(
            status_code=400, 
            detail=f"Session not ready. Current status: {session['status']}"
        )
    
    # Placeholder response - will be replaced with actual structure detection
    return {
        "session_id": session_id,
        "hierarchy_tree": {
            "root_nodes": ["Total Revenue", "Operating Expenses", "Operating Profit"],
            "max_depth": 4,
            "total_nodes": 25
        },
        "navigation_state": {
            "current_path": [],
            "breadcrumb_trail": [{"name": "Company", "path": "root"}],
            "available_drill_downs": ["North America", "Europe", "Asia Pacific"],
            "is_leaf_node": False,
            "tree_view_active": False
        }
    }

@router.get("/variance/{session_id}")
async def get_executive_summary(session_id: str, period: str = "3Q25E"):
    """
    Get executive summary of variances for the company level
    """
    logger.info(f"=== API CALL: get_executive_summary(session_id={session_id}, period={period}) ===")
    
    if session_id not in active_sessions:
        logger.error(f"Session {session_id} not found in active_sessions")
        logger.info(f"Available sessions: {list(active_sessions.keys())}")
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    logger.info(f"Found session with status: {session.get('status')}")
    logger.info(f"Session keys: {list(session.keys())}")
    
    if session["status"] not in ["completed", "processing"]:
        logger.warning(f"Session not ready. Current status: {session['status']}")
        error_detail = f"Session status: {session['status']}"
        
        if session["status"] == "failed":
            error_msg = session.get("error", "Processing failed")
            error_detail = f"Processing failed: {error_msg}"
        elif session["status"] == "uploaded":
            error_detail = "Files uploaded but processing not started. Please wait or refresh."
        
        raise HTTPException(
            status_code=400,
            detail=error_detail
        )
    
    # If still processing, allow variance calculation to proceed but add warning
    if session["status"] == "processing":
        logger.info(f"⚠️ Session {session_id} still processing but allowing variance calculation")
    
    # Get parsed models
    old_model = session.get("old_model", {})
    new_model = session.get("new_model", {})
    consistency_check = session.get("consistency_check", {})
    
    # SIMPLIFIED variance calculation using already-parsed models  
    # Always display variances for ANY period selected by user
    variance_data = {}
    try:
        logger.info(f"Calculating variances for period: {period}")
        
        # Use already-parsed models from session
        old_model = session.get("old_model")
        new_model = session.get("new_model")
        
        if old_model and new_model:
            logger.info("Using already-parsed models for variance calculation")
            
            all_variances = {}
            
            # Calculate variances for each available statement type
            statement_types = ["income_statement", "balance_sheet", "cash_flow"]
            
            for statement_type in statement_types:
                old_stmt = old_model.get(statement_type)
                new_stmt = new_model.get(statement_type)
                
                if old_stmt and new_stmt:
                    logger.info(f"Processing {statement_type}...")
                    
                    # Find period in both statements (flexible matching)
                    old_period_found = None
                    new_period_found = None
                    
                    # Check for exact period match first
                    for p in old_stmt.get("periods", []):
                        if p.get("name") == period:
                            old_period_found = period
                            break
                    
                    for p in new_stmt.get("periods", []):
                        if p.get("name") == period:
                            new_period_found = period
                            break
                    
                    # If exact match not found, try flexible matching
                    if not old_period_found or not new_period_found:
                        logger.info(f"Exact period '{period}' not found, trying flexible matching...")
                        # Find any period containing the requested period
                        for p in old_stmt.get("periods", []):
                            if period in p.get("name", "") or p.get("name", "") in period:
                                old_period_found = p.get("name")
                                logger.info(f"Found similar old period: {old_period_found}")
                                break
                        
                        for p in new_stmt.get("periods", []):
                            if period in p.get("name", "") or p.get("name", "") in period:
                                new_period_found = p.get("name")
                                logger.info(f"Found similar new period: {new_period_found}")
                                break
                    
                    if old_period_found and new_period_found:
                        # Calculate variances for this statement
                        statement_variances = {}
                        
                        old_line_items = old_stmt.get("line_items", [])
                        new_line_items = new_stmt.get("line_items", [])
                        
                        logger.info(f"Matching line items: {len(old_line_items)} old vs {len(new_line_items)} new")
                        
                        # Simple line item matching by name
                        for old_item in old_line_items:
                            old_name = old_item.get("name", "")
                            old_periods = old_item.get("periods", {})
                            
                            # Find matching new item
                            for new_item in new_line_items:
                                new_name = new_item.get("name", "")
                                new_periods = new_item.get("periods", {})
                                
                                # Exact name match
                                if old_name == new_name:
                                    # Get values for the period
                                    old_cell_info = old_periods.get(old_period_found, {})
                                    new_cell_info = new_periods.get(new_period_found, {})
                                    
                                    old_value = old_cell_info.get("value", 0) if isinstance(old_cell_info, dict) else 0
                                    new_value = new_cell_info.get("value", 0) if isinstance(new_cell_info, dict) else 0
                                    
                                    # Convert to float if needed
                                    try:
                                        old_value = float(old_value) if old_value is not None else 0.0
                                        new_value = float(new_value) if new_value is not None else 0.0
                                    except (ValueError, TypeError):
                                        old_value = 0.0
                                        new_value = 0.0
                                    
                                    # Calculate variance
                                    absolute_variance = new_value - old_value
                                    percentage_variance = 0.0
                                    if old_value != 0:
                                        percentage_variance = (absolute_variance / old_value) * 100
                                    
                                    # Determine format and key item status
                                    from app.utils.format_detector import determine_format_and_key_status
                                    format_type, is_key_item = determine_format_and_key_status(old_name, statement_type)
                                    
                                    statement_variances[old_name] = {
                                        "line_item_name": old_name,
                                        "old_value": old_value,
                                        "new_value": new_value,
                                        "absolute_variance": absolute_variance,
                                        "percentage_variance": percentage_variance,
                                        "drill_down_available": False,  # For now
                                        "has_formula": bool(old_cell_info.get("formula")) if isinstance(old_cell_info, dict) else False,
                                        "row_index": old_item.get("row_index", 0),  # Excel row number for tracing
                                        "sheet_name": old_item.get("sheet_name", ""),  # Sheet name for context
                                        "format_type": format_type,  # How to display the values
                                        "is_key_item": is_key_item  # Whether to highlight this item
                                    }
                                    break
                        
                        if statement_variances:
                            all_variances[statement_type] = statement_variances
                            logger.info(f"Calculated {len(statement_variances)} variances for {statement_type}")
                        else:
                            logger.warning(f"No line item matches found for {statement_type}")
                    else:
                        logger.warning(f"Period '{period}' not found in {statement_type} (old: {old_period_found}, new: {new_period_found})")
                else:
                    logger.info(f"Statement type {statement_type} not available in both models")
            
            variance_data = {
                "status": "calculated",
                "period": period,
                "statements_analyzed": list(all_variances.keys()),
                "variances": all_variances,
                "total_line_items": sum(len(v) for v in all_variances.values())
            }
            
            logger.info(f"✅ Variance calculation completed using parsed models")
            logger.info(f"   Analyzed {len(all_variances)} statements")
            logger.info(f"   Total line items: {variance_data['total_line_items']}")
            
        else:
            logger.warning("No parsed models available in session")
            variance_data = {"status": "error", "message": "No parsed models available"}
            
    except Exception as e:
        logger.error(f"Variance calculation failed: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        variance_data = {"status": "error", "message": str(e)}
    
    # Build executive summary
    executive_summary = {
        "session_id": session_id,
        "executive_summary": {
            "parsing_results": {
                "old_model_sheets": old_model.get("metadata", {}).get("financial_sheets_found", 0),
                "new_model_sheets": new_model.get("metadata", {}).get("financial_sheets_found", 0),
                "structure_match": consistency_check.get("structure_match", False),
                "compatibility_score": consistency_check.get("compatibility_score", 0.0)
            },
            "financial_statements_found": {
                "income_statement": bool(old_model.get("income_statement")) and bool(new_model.get("income_statement")),
                "balance_sheet": bool(old_model.get("balance_sheet")) and bool(new_model.get("balance_sheet")),
                "cash_flow": bool(old_model.get("cash_flow")) and bool(new_model.get("cash_flow"))
            },
            "key_insights": [],
            "variance_data": variance_data  # Generic variance data
        }
    }
    
    # Add insights based on parsed data
    insights = []
    
    if consistency_check.get("structure_match", False):
        insights.append("Both models have consistent financial statement structure")
    else:
        insights.append("Models have different financial statement structures - may affect comparison accuracy")
    
    naming_consistency = consistency_check.get("naming_consistency", 0.0)
    if naming_consistency > 0.8:
        insights.append(f"High naming consistency ({naming_consistency:.1%}) indicates reliable comparisons")
    elif naming_consistency > 0.5:
        insights.append(f"Moderate naming consistency ({naming_consistency:.1%}) - some manual review recommended")
    else:
        insights.append(f"Low naming consistency ({naming_consistency:.1%}) - significant differences detected")
    
    # Add line item counts
    old_income = old_model.get("income_statement", {})
    new_income = new_model.get("income_statement", {})
    
    if old_income and new_income:
        old_line_count = len(old_income.get("line_items", []))
        new_line_count = len(new_income.get("line_items", []))
        insights.append(f"Income statement analysis: {old_line_count} vs {new_line_count} line items detected")
    
    executive_summary["executive_summary"]["key_insights"] = insights
    
    # Add warnings/issues if any
    if consistency_check.get("warnings"):
        executive_summary["executive_summary"]["warnings"] = consistency_check["warnings"]
    
    if consistency_check.get("issues_found"):
        executive_summary["executive_summary"]["issues"] = consistency_check["issues_found"]
    
    # Log the final response
    logger.info(f"=== FINAL API RESPONSE ===")
    logger.info(f"Variance data included: {bool(variance_data)}")
    if variance_data:
        logger.info(f"Variance data keys: {list(variance_data.keys())}")
    logger.info(f"Executive summary keys: {list(executive_summary['executive_summary'].keys())}")
    logger.info(f"=== END API CALL ===")
    
    return executive_summary

@router.get("/variance/{session_id}/{hierarchy_path:path}")
async def get_variance_detail(session_id: str, hierarchy_path: str):
    """
    Get detailed variance analysis for a specific hierarchy path
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Parse hierarchy path
    path_components = hierarchy_path.split('/') if hierarchy_path else []
    
    # Placeholder detailed variance
    return {
        "session_id": session_id,
        "hierarchy_path": hierarchy_path,
        "variance_detail": {
            "level_name": path_components[-1] if path_components else "Company",
            "old_value": 500000,
            "new_value": 575000,
            "absolute_variance": 75000,
            "percentage_variance": 15.0,
            "is_leaf_node": len(path_components) >= 3,
            "children": ["Product A", "Product B", "Product C"] if len(path_components) < 3 else [],
            "drill_down_options": ["Product A", "Product B"] if len(path_components) < 3 else []
        },
        "navigation_state": {
            "current_path": path_components,
            "breadcrumb_trail": [
                {"name": "Company", "path": ""},
                {"name": "North America", "path": "north_america"},
                {"name": "Premium Segment", "path": "north_america/premium"}
            ][:len(path_components)+1],
            "available_drill_downs": ["Product A", "Product B"] if len(path_components) < 3 else [],
            "is_leaf_node": len(path_components) >= 3
        }
    }

@router.get("/periods/{session_id}")
async def get_period_analysis(session_id: str):
    """
    Get period alignment and comparison options
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "period_mapping": {
            "aligned_periods": ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
            "projection_vs_actual_periods": ["Q1 2025", "Q2 2025"],
            "projection_vs_projection_periods": ["Q3 2025", "Q4 2025", "FY 2026"],
            "alignment_quality_score": 0.95
        },
        "comparison_modes": [
            {
                "mode": "projection_vs_actual",
                "description": "Compare new actuals to old projections",
                "periods": ["Q1 2025", "Q2 2025"]
            },
            {
                "mode": "projection_vs_projection", 
                "description": "Compare new projections to old projections",
                "periods": ["Q3 2025", "Q4 2025", "FY 2026"]
            }
        ]
    }

@router.post("/drill-down/{session_id}")
async def drill_down_line_item(session_id: str, request_body: dict):
    """
    Drill down into a specific line item to show component variances
    
    Expected request body:
    {
        "statement_type": "income_statement",
        "line_item_name": "Total Revenue", 
        "period": "3Q25E"
    }
    """
    logger.info(f"=== DRILL-DOWN REQUEST: session_id={session_id} ===")
    
    if session_id not in active_sessions:
        logger.error(f"Session {session_id} not found")
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    # Extract request parameters
    statement_type = request_body.get("statement_type")
    line_item_name = request_body.get("line_item_name")
    period = request_body.get("period")
    
    logger.info(f"Drill-down request: {statement_type}.{line_item_name} for {period}")
    
    if not all([statement_type, line_item_name, period]):
        raise HTTPException(
            status_code=400, 
            detail="Missing required fields: statement_type, line_item_name, period"
        )
    
    try:
        from pathlib import Path
        from app.services.universal_parser import UniversalExcelParser
        
        # Get file paths and sheet selection
        old_file_path = session.get("old_file_path")
        new_file_path = session.get("new_file_path")
        selected_sheets = session.get("selected_sheets", {})
        
        if not old_file_path or not new_file_path or not selected_sheets:
            raise HTTPException(
                status_code=400,
                detail="Session missing required data for drill-down"
            )
        
        # Get the sheet name for the statement type
        sheet_name = selected_sheets.get(statement_type)
        if not sheet_name:
            raise HTTPException(
                status_code=400,
                detail=f"No sheet selected for {statement_type}"
            )
        
        # Perform drill-down analysis
        parser = UniversalExcelParser()
        drill_down_result = parser.drill_down_variance(
            Path(old_file_path),
            Path(new_file_path), 
            sheet_name,
            line_item_name,
            period
        )
        
        if not drill_down_result:
            raise HTTPException(
                status_code=404,
                detail="Could not perform drill-down analysis"
            )
        
        # Convert result to API response format
        response = {
            "session_id": session_id,
            "drill_down_result": {
                "source_item": drill_down_result.source_item,
                "source_value": drill_down_result.source_value,
                "total_explained": drill_down_result.total_explained,
                "unexplained_variance": drill_down_result.unexplained_variance,
                "drill_down_path": drill_down_result.drill_down_path,
                "components": [
                    {
                        "name": comp.name,
                        "cell_reference": comp.cell_reference,
                        "value": comp.value,
                        "variance_contribution": comp.variance_contribution,
                        "is_leaf_node": comp.is_leaf_node,
                        "has_formula": bool(comp.formula)
                    }
                    for comp in drill_down_result.components
                ]
            },
            "analysis_metadata": {
                "statement_type": statement_type,
                "line_item_name": line_item_name,
                "period": period,
                "sheet_name": sheet_name,
                "components_found": len(drill_down_result.components)
            }
        }
        
        logger.info(f"Drill-down completed: {len(drill_down_result.components)} components")
        return response
        
    except Exception as e:
        logger.error(f"Drill-down failed: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Drill-down analysis failed: {str(e)}"
        )

@router.get("/drill-down-preview/{session_id}")
async def get_drill_down_preview(session_id: str, statement_type: str, line_item_name: str):
    """
    Get a preview of what drilling down would show (for UI hints)
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    try:
        from pathlib import Path
        from app.services.universal_parser import UniversalExcelParser
        
        # Get file paths and sheet selection
        old_file_path = session.get("old_file_path")
        selected_sheets = session.get("selected_sheets", {})
        
        if not old_file_path or not selected_sheets:
            return {"can_drill_down": False, "reason": "Session data incomplete"}
        
        sheet_name = selected_sheets.get(statement_type)
        if not sheet_name:
            return {"can_drill_down": False, "reason": f"No sheet selected for {statement_type}"}
        
        parser = UniversalExcelParser()
        preview = parser.get_drill_down_preview(
            Path(old_file_path),
            sheet_name,
            line_item_name
        )
        
        return {
            "session_id": session_id,
            "preview": preview,
            "statement_type": statement_type,
            "line_item_name": line_item_name
        }
        
    except Exception as e:
        logger.warning(f"Preview failed: {str(e)}")
        return {"can_drill_down": False, "reason": "Preview analysis failed"}