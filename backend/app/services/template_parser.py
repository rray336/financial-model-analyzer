"""
Template-based period detection for robust parsing of financial Excel files
"""
import re
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class PeriodTemplate:
    name: str
    pattern: str
    example: str
    type: str  # 'annual' or 'quarterly'

@dataclass
class TemplateMatch:
    template: PeriodTemplate
    matched_periods: List[str]
    confidence: float

class TemplateBasedPeriodParser:
    """
    Intelligent period detection using user-provided or auto-detected templates
    """
    
    def __init__(self):
        # Template parser for universal period detection
        pass
    
    def suggest_templates_from_samples(self, sample_periods: List[str]) -> List[PeriodTemplate]:
        """
        Analyze sample periods and suggest appropriate templates
        
        Args:
            sample_periods: List of periods found by basic detection
            
        Returns:
            List of suggested templates
        """
        suggested = []
        
        for period in sample_periods:
            template = self._reverse_engineer_template(period)
            if template and template not in suggested:
                suggested.append(template)
        
        logger.info(f"Suggested {len(suggested)} templates from {len(sample_periods)} sample periods")
        return suggested
    
    def _reverse_engineer_template(self, period: str) -> Optional[PeriodTemplate]:
        """
        Convert a specific period into a template pattern
        
        Examples:
        - FY2024 -> PeriodTemplate('FY{YYYY}', 'FY2024', 'annual')
        - FY1Q25 -> PeriodTemplate('FY{Q}Q{YY}', 'FY1Q25', 'quarterly')
        - 2025E -> PeriodTemplate('{YYYY}E', '2025E', 'annual')
        """
        period = period.strip()
        
        # Pattern: FY + 4-digit year + optional E
        if re.match(r'^FY\d{4}E?$', period):
            has_e = period.endswith('E')
            template_pattern = 'FY{YYYY}[E]' if has_e else 'FY{YYYY}'
            return PeriodTemplate(
                name=f'Annual FY Format',
                pattern=template_pattern,
                example=period,
                type='annual'
            )
        
        # Pattern: FY + Quarter + Q + 2-digit year + optional E  
        elif re.match(r'^FY[1-4]Q\d{2}E?$', period):
            has_e = period.endswith('E')
            template_pattern = 'FY{Q}Q{YY}[E]' if has_e else 'FY{Q}Q{YY}'
            return PeriodTemplate(
                name=f'Quarterly FY Format',
                pattern=template_pattern,
                example=period,
                type='quarterly'
            )
        
        # Pattern: 4-digit year + optional E
        elif re.match(r'^\d{4}E?$', period):
            has_e = period.endswith('E')
            template_pattern = '{YYYY}[E]' if has_e else '{YYYY}'
            return PeriodTemplate(
                name=f'Simple Annual Format',
                pattern=template_pattern,
                example=period,
                type='annual'
            )
        
        # Pattern: Quarter + Q + 2-digit year + optional E
        elif re.match(r'^[1-4]Q\d{2}E?$', period):
            has_e = period.endswith('E')
            template_pattern = '{Q}Q{YY}[E]' if has_e else '{Q}Q{YY}'
            return PeriodTemplate(
                name=f'Simple Quarterly Format',
                pattern=template_pattern,
                example=period,
                type='quarterly'
            )
        
        # Pattern: Q + Quarter + space + 4-digit year
        elif re.match(r'^Q[1-4]\s+\d{4}$', period):
            return PeriodTemplate(
                name=f'Quarterly Q Format',
                pattern='Q{Q} {YYYY}',
                example=period,
                type='quarterly'
            )
        
        # Pattern: 4-digit year + hyphen + 2-digit number (like 1998-53)
        elif re.match(r'^\d{4}-\d{2}$', period):
            return PeriodTemplate(
                name=f'Year-Week Format',
                pattern='{YYYY}-{WW}',
                example=period,
                type='annual'
            )
        
        logger.debug(f"Could not reverse engineer template for period: {period}")
        return None
    
    def generate_periods_from_templates(self, templates: List[PeriodTemplate], 
                                      year_range: Tuple[int, int] = (1990, 2030)) -> Dict[str, List[str]]:
        """
        Generate all possible periods from templates within year range
        
        Args:
            templates: List of PeriodTemplate objects
            year_range: (start_year, end_year) tuple
            
        Returns:
            Dictionary mapping template names to lists of generated periods
        """
        generated = {}
        start_year, end_year = year_range
        
        for template in templates:
            periods = []
            
            # Generate based on template pattern
            if '{YYYY}' in template.pattern:
                # Annual periods with 4-digit years
                for year in range(start_year, end_year + 1):
                    periods.extend(self._expand_template_for_year(template.pattern, year, 4))
                    
            elif '{YY}' in template.pattern:
                # Periods with 2-digit years
                for year in range(start_year, end_year + 1):
                    periods.extend(self._expand_template_for_year(template.pattern, year, 2))
            
            generated[template.name] = periods
            logger.debug(f"Generated {len(periods)} periods from template: {template.name}")
        
        return generated
    
    def _expand_template_for_year(self, pattern: str, year: int, year_digits: int) -> List[str]:
        """Expand a template pattern for a specific year"""
        
        year_str = str(year) if year_digits == 4 else str(year)[-2:]
        periods = []
        
        # Replace year placeholder
        base_pattern = pattern.replace('{YYYY}', str(year)).replace('{YY}', year_str)
        
        # Handle quarterly patterns
        if '{Q}' in base_pattern:
            for quarter in [1, 2, 3, 4]:
                quarterly_pattern = base_pattern.replace('{Q}', str(quarter))
                periods.extend(self._expand_optional_suffixes(quarterly_pattern))
        else:
            periods.extend(self._expand_optional_suffixes(base_pattern))
        
        # Handle week patterns (like 1998-53)
        if '{WW}' in base_pattern:
            # Only generate the specific format we saw
            periods = [base_pattern.replace('{WW}', '53')]
        
        return periods
    
    def _expand_optional_suffixes(self, pattern: str) -> List[str]:
        """Expand optional suffixes like [E]"""
        
        if '[E]' in pattern:
            base = pattern.replace('[E]', '')
            return [base, base + 'E']
        elif '[Actual]' in pattern:
            base = pattern.replace('[Actual]', '')
            return [base, base + ' Actual']
        else:
            return [pattern]
    
    def find_periods_using_templates(self, sheet, templates: List[PeriodTemplate],
                                   header_rows: List[int] = None) -> Dict[str, List[Tuple[str, int]]]:
        """
        Search Excel sheet for periods matching the provided templates
        
        Args:
            sheet: openpyxl worksheet
            templates: List of PeriodTemplate objects to search for
            header_rows: List of row numbers to search (default: [6])
            
        Returns:
            Dictionary mapping template names to lists of (period, column) tuples
        """
        if header_rows is None:
            header_rows = [6]  # Default to row 6 where we typically find periods
        
        # Generate all possible periods from templates
        template_periods = self.generate_periods_from_templates(templates)
        
        found_periods = {}
        
        for template_name, candidate_periods in template_periods.items():
            matches = []
            
            # Search for each candidate period in the specified rows
            for row_num in header_rows:
                for col_num in range(1, sheet.max_column + 1):
                    try:
                        cell_value = sheet.cell(row=row_num, column=col_num).value
                        
                        if cell_value and isinstance(cell_value, str):
                            cell_value = cell_value.strip()
                            
                            # Check if this cell matches any of our candidate periods
                            if cell_value in candidate_periods:
                                matches.append((cell_value, col_num))
                                logger.debug(f"Found {cell_value} at column {col_num} (template: {template_name})")
                    
                    except Exception as e:
                        logger.warning(f"Error reading cell {row_num},{col_num}: {e}")
                        continue
            
            if matches:
                # Remove duplicates and sort by column
                unique_matches = list(set(matches))
                unique_matches.sort(key=lambda x: x[1])  # Sort by column number
                found_periods[template_name] = unique_matches
                logger.info(f"Template '{template_name}' found {len(unique_matches)} periods")
        
        return found_periods
    
    def validate_template_coverage(self, found_periods: Dict[str, List[Tuple[str, int]]],
                                 min_expected_periods: int = 10) -> Dict[str, float]:
        """
        Validate that templates are finding a reasonable number of periods
        
        Returns:
            Dictionary mapping template names to confidence scores (0-1)
        """
        confidence_scores = {}
        
        for template_name, periods in found_periods.items():
            period_count = len(periods)
            
            # Simple heuristic: more periods = higher confidence
            if period_count >= min_expected_periods:
                confidence = min(1.0, period_count / (min_expected_periods * 2))
            else:
                confidence = period_count / min_expected_periods
            
            confidence_scores[template_name] = confidence
            logger.debug(f"Template '{template_name}': {period_count} periods, confidence: {confidence:.2f}")
        
        return confidence_scores