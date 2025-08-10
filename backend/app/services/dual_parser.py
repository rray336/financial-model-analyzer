"""
Dual Excel Parser Service
Handles parsing of Old and New model pairs with consistency validation
"""
import pandas as pd
from typing import Tuple, List, Optional, Dict, Any
from pathlib import Path
import uuid
from datetime import datetime
import logging

from app.models.financial import (
    FinancialModel, FinancialSheet, SheetType, Period, PeriodType, 
    LineItem, CellInfo, ModelStructure, HierarchyLevel
)
from app.models.comparison import ConsistencyCheck
from app.core.exceptions import ModelParsingException, ModelConsistencyException
from app.utils.excel_utils import (
    ExcelReader, detect_financial_keywords, detect_period_patterns,
    extract_numeric_values, analyze_cell_relationships, identify_hard_coded_values,
    find_period_header_row, extract_periods_from_row, extract_line_items_from_sheet
)

logger = logging.getLogger(__name__)

class DualExcelParser:
    def __init__(self):
        self.supported_extensions = {'.xlsx', '.xls'}
    
    async def parse_model_pair(
        self, 
        old_file_path: Path, 
        new_file_path: Path
    ) -> Tuple[FinancialModel, FinancialModel, ConsistencyCheck]:
        """
        Parse both Excel models and validate consistency
        
        Args:
            old_file_path: Path to the old model Excel file
            new_file_path: Path to the new model Excel file
            
        Returns:
            Tuple of (old_model, new_model, consistency_check)
        """
        try:
            logger.info(f"Starting to parse model pair: {old_file_path.name} vs {new_file_path.name}")
            
            # Parse individual models
            old_model = await self._parse_single_model(old_file_path, "old")
            new_model = await self._parse_single_model(new_file_path, "new")
            
            # Perform consistency validation
            consistency_check = await self._validate_consistency(old_model, new_model)
            
            logger.info("Model pair parsing completed successfully")
            return old_model, new_model, consistency_check
            
        except Exception as e:
            logger.error(f"Failed to parse model pair: {str(e)}")
            raise ModelParsingException(f"Failed to parse model pair: {str(e)}")
    
    async def _parse_single_model(self, file_path: Path, model_type: str) -> FinancialModel:
        """Parse a single Excel financial model"""
        logger.info(f"Parsing {model_type} model: {file_path.name}")
        
        try:
            model_id = str(uuid.uuid4())
            excel_reader = ExcelReader(file_path)
            excel_reader.load_workbook()
            
            # Get all sheet names
            sheet_names = excel_reader.get_sheet_names()
            logger.info(f"Found {len(sheet_names)} sheets: {sheet_names}")
            
            # Analyze each sheet
            financial_sheets = {}
            periods = []
            all_periods_detected = []
            
            for sheet_name in sheet_names:
                logger.info(f"🔍 Analyzing sheet: {sheet_name}")
                
                try:
                    # Get sheet object for direct access
                    sheet = excel_reader.workbook[sheet_name]
                    
                    # Detect sheet type
                    sheet_info = excel_reader.analyze_sheet_content(sheet_name, max_rows=15, max_cols=10)
                    sheet_type = self._detect_sheet_type(sheet_name, sheet_info)
                    
                    if sheet_type != SheetType.UNKNOWN:
                        logger.info(f"✅ Sheet '{sheet_name}' identified as: {sheet_type}")
                        
                        # Find period header row
                        try:
                            period_row_idx = find_period_header_row(sheet)
                            
                            # Extract periods in exact Excel column order
                            sheet_periods = extract_periods_from_row(sheet, period_row_idx, sheet_name)
                            all_periods_detected.extend(sheet_periods)
                            
                            # Get period column indices for line item extraction
                            period_columns = [p.column_index for p in sheet_periods]
                            
                            # Extract line items using improved approach
                            line_items = extract_line_items_from_sheet(
                                sheet, period_columns, sheet_name, sheet_type.value, period_row_idx, sheet_periods
                            )
                            
                            # Create financial sheet
                            financial_sheet = FinancialSheet(
                                sheet_type=sheet_type,
                                sheet_name=sheet_name,
                                line_items=line_items,
                                periods=sheet_periods
                            )
                            
                            financial_sheets[sheet_type] = financial_sheet
                            logger.info(f"✅ Successfully parsed {sheet_name}: {len(line_items)} line items, {len(sheet_periods)} periods")
                            
                        except ValueError as e:
                            logger.warning(f"⚠️ Could not find period headers in {sheet_name}: {e}")
                            continue
                            
                    else:
                        logger.info(f"⏭️ Skipping sheet '{sheet_name}' (type: {sheet_type})")
                        
                except Exception as e:
                    logger.error(f"❌ Failed to process sheet '{sheet_name}': {e}")
                    continue
            
            # Consolidate periods across sheets
            periods = self._consolidate_periods(all_periods_detected)
            
            # Create placeholder structure (will be enhanced in Phase 3)
            structure = ModelStructure(
                hierarchy_levels=[],
                drill_down_paths={},
                hard_coded_nodes=[],
                max_depth=0
            )
            
            # Create the financial model
            model = FinancialModel(
                model_id=model_id,
                filename=file_path.name,
                upload_timestamp=datetime.now(),
                income_statement=financial_sheets.get(SheetType.INCOME_STATEMENT),
                balance_sheet=financial_sheets.get(SheetType.BALANCE_SHEET),
                cash_flow=financial_sheets.get(SheetType.CASH_FLOW),
                structure=structure,
                periods=periods,
                metadata={
                    "model_type": model_type,
                    "total_sheets": len(sheet_names),
                    "financial_sheets_found": len(financial_sheets),
                    "parsing_timestamp": datetime.now().isoformat()
                }
            )
            
            logger.info(f"Successfully parsed {model_type} model with {len(financial_sheets)} financial sheets")
            return model
            
        except Exception as e:
            logger.error(f"❌ Failed to parse {model_type} model: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise ModelParsingException(f"Failed to parse {model_type} model: {str(e)}")
    
    def _consolidate_periods(self, all_periods: List[Period]) -> List[Period]:
        """
        Consolidate periods from multiple sheets using simple column-index sorting
        Preserve Excel column order exactly as it appears
        """
        logger.info(f"📊 Consolidating {len(all_periods)} periods from all sheets")
        
        # Simple deduplication by name while preserving order
        seen_names = set()
        consolidated = []
        
        # Sort by column_index first to maintain Excel order
        sorted_periods = sorted(all_periods, key=lambda p: p.column_index)
        
        for period in sorted_periods:
            if period.name not in seen_names:
                consolidated.append(period)
                seen_names.add(period.name)
                logger.debug(f"  📋 Added period: '{period.name}' (col {period.column_index})")
        
        logger.info(f"✅ Consolidated to {len(consolidated)} unique periods in Excel order")
        return consolidated
    
    async def _validate_consistency(
        self, 
        old_model: FinancialModel, 
        new_model: FinancialModel
    ) -> ConsistencyCheck:
        """Validate consistency between old and new models"""
        logger.info("Validating model consistency")
        
        issues_found = []
        warnings = []
        
        # Check if both models have the same types of financial statements
        old_sheets = {
            'income_statement': old_model.income_statement is not None,
            'balance_sheet': old_model.balance_sheet is not None, 
            'cash_flow': old_model.cash_flow is not None
        }
        
        new_sheets = {
            'income_statement': new_model.income_statement is not None,
            'balance_sheet': new_model.balance_sheet is not None,
            'cash_flow': new_model.cash_flow is not None
        }
        
        structure_match = old_sheets == new_sheets
        if not structure_match:
            issues_found.append("Different financial statements found between models")
        
        # Check period compatibility
        old_periods = {p.name for p in old_model.periods}
        new_periods = {p.name for p in new_model.periods}
        
        common_periods = old_periods.intersection(new_periods)
        period_alignment_possible = len(common_periods) > 0
        
        if not period_alignment_possible:
            warnings.append("No common periods found - may limit comparison capabilities")
        
        # Calculate naming consistency (simplified)
        if old_model.income_statement and new_model.income_statement:
            old_line_names = {item.name for item in old_model.income_statement.line_items}
            new_line_names = {item.name for item in new_model.income_statement.line_items}
            
            common_names = old_line_names.intersection(new_line_names)
            total_unique_names = len(old_line_names.union(new_line_names))
            
            naming_consistency = len(common_names) / total_unique_names if total_unique_names > 0 else 1.0
        else:
            naming_consistency = 1.0
        
        # Calculate overall compatibility score
        compatibility_score = (
            (0.4 if structure_match else 0) +
            (0.3 * naming_consistency) + 
            (0.3 if period_alignment_possible else 0)
        )
        
        logger.info(f"Consistency check complete: compatibility_score={compatibility_score}")
        
        return ConsistencyCheck(
            structure_match=structure_match,
            naming_consistency=naming_consistency,
            period_alignment_possible=period_alignment_possible,
            issues_found=issues_found,
            warnings=warnings,
            compatibility_score=compatibility_score
        )
    
    def _detect_sheet_type(self, sheet_name: str, sheet_info: Dict[str, Any]) -> SheetType:
        """Detect the type of financial sheet based on name and content"""
        
        # First check sheet name
        sheet_name_lower = sheet_name.lower()
        
        # Income Statement keywords
        if any(keyword in sheet_name_lower for keyword in 
               ['income', 'p&l', 'profit', 'loss', 'revenue', 'sales', 'earnings']):
            return SheetType.INCOME_STATEMENT
        
        # Balance Sheet keywords
        elif any(keyword in sheet_name_lower for keyword in 
                ['balance', 'sheet', 'assets', 'liabilities', 'equity']):
            return SheetType.BALANCE_SHEET
        
        # Cash Flow keywords
        elif any(keyword in sheet_name_lower for keyword in 
                ['cash', 'flow', 'operating', 'investing', 'financing']):
            return SheetType.CASH_FLOW
        
        # If name doesn't match, analyze content
        sample_data = sheet_info.get('sample_data', [])
        all_text = []
        
        for row_data in sample_data:
            for cell_data in row_data:
                value = cell_data.get('value')
                if isinstance(value, str):
                    all_text.append(value)
        
        combined_text = ' '.join(all_text)
        keyword_scores = detect_financial_keywords(combined_text)
        
        if keyword_scores:
            # Return the sheet type with the highest keyword score
            best_match = max(keyword_scores.items(), key=lambda x: x[1])
            if best_match[1] > 0:
                type_mapping = {
                    'income_statement': SheetType.INCOME_STATEMENT,
                    'balance_sheet': SheetType.BALANCE_SHEET,
                    'cash_flow': SheetType.CASH_FLOW
                }
                return type_mapping.get(best_match[0], SheetType.UNKNOWN)
        
        return SheetType.UNKNOWN