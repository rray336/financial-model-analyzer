# Example Financial Models

This directory contains sample Excel financial models for testing the Financial Model Analyzer.

## Usage

Upload any two Excel files containing financial statements with similar structures:
- One as "Old Model" (baseline comparison)
- One as "New Model" (target for analysis)

## Requirements

Your Excel files should contain:
- **Financial statements** (Income Statement, Balance Sheet, Cash Flow)
- **Period columns** with dates/quarters (e.g., Q1 2024, Q2 2024, etc.)
- **Line items** in rows with descriptive names
- **Consistent structure** between Old and New models

## Supported Formats

The analyzer works with any Excel format (.xlsx, .xls) regardless of:
- Sheet naming conventions
- Period formatting styles
- Line item organization
- Company or industry type

## Testing

To test the system:
1. Upload your Old and New Excel files
2. Select which sheets contain your financial statements
3. Choose a period for comparison
4. Analyze variances and drill down into details