"""
Pattern-based format and key item detection for financial line items
"""
import re
from typing import Dict, Tuple

def determine_format_and_key_status(line_item_name: str, statement_type: str) -> Tuple[str, bool]:
    """
    Determine the display format and key item status for a line item
    
    Args:
        line_item_name: Name of the line item
        statement_type: Type of statement (income_statement, balance_sheet, cash_flow)
    
    Returns:
        Tuple of (format_type, is_key_item)
    """
    name_lower = line_item_name.lower().strip()
    format_type = _detect_format_type(name_lower, statement_type)
    is_key_item = _detect_key_item(name_lower, statement_type)
    
    return format_type, is_key_item

def _detect_format_type(name_lower: str, statement_type: str) -> str:
    """Detect the appropriate format type for displaying values"""
    
    # EPS - Special case for precise currency display
    eps_patterns = [
        r'.*\b(eps|earnings per share|diluted eps|basic eps)\b.*',
        r'.*\b(per share|share data)\b.*'
    ]
    if any(re.match(pattern, name_lower) for pattern in eps_patterns):
        return 'currency_precise'
    
    # Percentages - All statement types
    percentage_patterns = [
        # Margins & Rates (IS, CF)
        r'.*\b(margin|rate|percentage|%|pct)\b.*',
        r'.*\b(gross margin|operating margin|ebitda margin|net margin|profit margin)\b.*',
        r'.*\b(tax rate|effective rate|interest rate)\b.*',
        
        # Growth & Changes (IS, BS, CF)
        r'.*\b(growth|yoy|change|increase|decrease)\b.*',
        r'.*\b(vs\.|versus|compared to)\b.*',
        
        # Balance Sheet percentages
        r'.*\b(debt.+ratio|leverage ratio)\b.*',
        r'.*\b(roe|roa|roic|return on)\b.*',
        r'.*\b(yield|dividend yield)\b.*',
        
        # Cash Flow percentages
        r'.*\b(cash conversion|conversion rate)\b.*',
        r'.*\b(capex.+revenue|capex.+sales)\b.*',
        r'.*\b(fcf margin|free cash flow margin)\b.*'
    ]
    if any(re.match(pattern, name_lower) for pattern in percentage_patterns):
        return 'percentage'
    
    # Ratios - All statement types
    ratio_patterns = [
        r'.*\b(ratio|times|multiple|coverage)\b.*',
        r'.*\b(current ratio|quick ratio|debt.+equity)\b.*',
        r'.*\b(interest coverage|debt coverage)\b.*',
        r'.*\b(asset turnover|inventory turnover)\b.*',
        r'.*\b(days|dso|dpo|dio)\b.*',  # Days metrics
        r'.*\b(debt.+ebitda|net debt.+ebitda)\b.*'
    ]
    if any(re.match(pattern, name_lower) for pattern in ratio_patterns):
        return 'ratio'
    
    # Count/Shares
    count_patterns = [
        r'.*\b(shares|units|count|number of|outstanding)\b.*',
        r'.*\b(weighted.*shares|diluted.*shares)\b.*'
    ]
    if any(re.match(pattern, name_lower) for pattern in count_patterns):
        return 'count'
    
    # Default to currency
    return 'currency'

def _detect_key_item(name_lower: str, statement_type: str) -> bool:
    """Detect if this is a key financial item that should be highlighted"""
    
    if statement_type == "income_statement":
        key_patterns = [
            r'.*\b(revenue|sales|net sales|total revenue|total sales)\b.*',
            r'.*\b(gross profit|gross income)\b.*',
            r'.*\b(operating income|operating profit|ebit)\b.*',
            r'.*\b(ebitda)\b.*',
            r'.*\b(net income|net profit|net earnings|bottom line)\b.*',
            r'.*\b(eps|earnings per share)\b.*'
        ]
    elif statement_type == "balance_sheet":
        key_patterns = [
            r'.*\b(total assets)\b.*',
            r'.*\b(total debt|total liabilities|long.+debt)\b.*',
            r'.*\b(shareholders.+equity|stockholders.+equity|total equity)\b.*',
            r'.*\b(cash|cash equivalents|cash and equivalents)\b.*',
            r'.*\b(working capital)\b.*'
        ]
    elif statement_type == "cash_flow":
        key_patterns = [
            r'.*\b(operating cash flow|cash from operations|operating activities)\b.*',
            r'.*\b(free cash flow|fcf)\b.*',
            r'.*\b(capex|capital expenditure|capital expenditures)\b.*',
            r'.*\b(net cash flow|net change in cash)\b.*'
        ]
    else:
        key_patterns = []
    
    return any(re.match(pattern, name_lower) for pattern in key_patterns)