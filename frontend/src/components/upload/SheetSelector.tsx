import React, { useState, useEffect } from 'react'
import { FileSpreadsheet, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react'
import { PeriodReview } from './PeriodReview'
import { TemplateInput } from './TemplateInput'
import { analysisAPI } from '../../services/api'

interface SheetSelectorProps {
  sessionId: string
  onSheetsSelected: (sheets: SelectedSheets) => void
  onCompleteSheetSelection: () => void
  availableSheets: {
    oldModelSheets: string[]
    newModelSheets: string[]
  }
}

interface SelectedSheets {
  incomeStatement: string
  balanceSheet: string
  cashFlow: string
}

export const SheetSelector: React.FC<SheetSelectorProps> = ({
  sessionId,
  onSheetsSelected,
  onCompleteSheetSelection,
  availableSheets
}) => {
  const [selectedSheets, setSelectedSheets] = useState<SelectedSheets>({
    incomeStatement: '',
    balanceSheet: '',
    cashFlow: ''
  })
  
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  // New state for period review workflow
  const [currentStep, setCurrentStep] = useState<'sheets' | 'periods' | 'templates'>('sheets')
  const [periodAnalysis, setPeriodAnalysis] = useState<any>(null)
  const [periodsNeedReview, setPeriodsNeedReview] = useState(false)
  const [loading, setLoading] = useState(false)

  const statementTypes = [
    {
      key: 'incomeStatement',
      label: 'Income Statement',
      description: 'P&L, Profit & Loss, or Income Statement sheet'
    },
    {
      key: 'balanceSheet', 
      label: 'Balance Sheet',
      description: 'Balance Sheet or Statement of Financial Position'
    },
    {
      key: 'cashFlow',
      label: 'Cash Flow Statement', 
      description: 'Cash Flow or Statement of Cash Flows'
    }
  ] as const

  // Validate that selected sheets exist in both models
  useEffect(() => {
    const errors: string[] = []
    
    Object.entries(selectedSheets).forEach(([, sheetName]) => {
      if (sheetName) {
        const existsInOld = availableSheets.oldModelSheets.includes(sheetName)
        const existsInNew = availableSheets.newModelSheets.includes(sheetName)
        
        if (!existsInOld) {
          errors.push(`${sheetName} not found in Old Model`)
        }
        if (!existsInNew) {
          errors.push(`${sheetName} not found in New Model`)
        }
      }
    })
    
    setValidationErrors(errors)
  }, [selectedSheets, availableSheets])

  const handleSheetSelection = async (statementType: keyof SelectedSheets, sheetName: string) => {
    const newSelection = {
      ...selectedSheets,
      [statementType]: sheetName
    }
    setSelectedSheets(newSelection)
    setDropdownOpen(null)
    
    // Check if all three sheets are selected and valid
    const allSelected = Object.values(newSelection).every(sheet => sheet !== '')
    if (allSelected && validationErrors.length === 0) {
      await handleSheetsComplete(newSelection)
    }
  }

  const handleSheetsComplete = async (sheets: SelectedSheets) => {
    setLoading(true)
    try {
      // Call the new API that returns period analysis
      const response = await analysisAPI.selectSheets(sessionId, {
        income_statement: sheets.incomeStatement,
        balance_sheet: sheets.balanceSheet,
        cash_flow: sheets.cashFlow
      })
      
      setPeriodAnalysis(response.period_analysis)
      setPeriodsNeedReview(response.periods_need_review)
      
      // Always show period review step for user approval
      setCurrentStep('periods')
      
      // Also call the original callback for backwards compatibility
      onSheetsSelected(sheets)
      
    } catch (error) {
      console.error('Failed to analyze periods:', error)
      // Fallback to original behavior
      onSheetsSelected(sheets)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodApproval = async () => {
    setLoading(true)
    try {
      await analysisAPI.approvePeriods(sessionId, { approved: true })
      onCompleteSheetSelection()
    } catch (error) {
      console.error('Failed to approve periods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateRequest = () => {
    setCurrentStep('templates')
  }

  const handleTemplateSubmit = async (templates: any[]) => {
    setLoading(true)
    try {
      const response = await analysisAPI.approvePeriods(sessionId, {
        approved: false,
        custom_templates: templates
      })
      
      console.log('Template application result:', response)
      onCompleteSheetSelection()
    } catch (error) {
      console.error('Failed to apply templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToPeriods = () => {
    setCurrentStep('periods')
  }

  const getCommonSheets = () => {
    // Return sheets that exist in both old and new models
    return availableSheets.oldModelSheets.filter(sheet => 
      availableSheets.newModelSheets.includes(sheet)
    )
  }

  const getSheetStatus = (sheetName: string) => {
    if (!sheetName) return 'unselected'
    
    const existsInOld = availableSheets.oldModelSheets.includes(sheetName)
    const existsInNew = availableSheets.newModelSheets.includes(sheetName)
    
    if (existsInOld && existsInNew) return 'valid'
    return 'invalid'
  }

  const commonSheets = getCommonSheets()
  const allSheetsSelected = Object.values(selectedSheets).every(sheet => sheet !== '')
  const allSheetsValid = validationErrors.length === 0

  // Render period review step
  if (currentStep === 'periods' && periodAnalysis) {
    return (
      <PeriodReview
        sessionId={sessionId}
        periodAnalysis={periodAnalysis}
        periodsNeedReview={periodsNeedReview}
        onApprove={handlePeriodApproval}
        onRequestTemplates={handleTemplateRequest}
      />
    )
  }

  // Render template input step
  if (currentStep === 'templates' && periodAnalysis) {
    return (
      <TemplateInput
        sessionId={sessionId}
        suggestedTemplates={periodAnalysis.suggested_templates || []}
        onBack={handleBackToPeriods}
        onSubmit={handleTemplateSubmit}
      />
    )
  }

  // Render sheet selection step
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <FileSpreadsheet className="h-6 w-6 text-primary-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Select Financial Statement Sheets</h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose which sheets contain your Income Statement, Balance Sheet, and Cash Flow Statement
          </p>
        </div>
      </div>

      {/* Sheet Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statementTypes.map((statement) => (
          <div key={statement.key} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {statement.label}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {statement.description}
              </p>
            </div>
            
            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(dropdownOpen === statement.key ? null : statement.key)}
                className={`w-full px-4 py-3 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  getSheetStatus(selectedSheets[statement.key]) === 'valid' 
                    ? 'border-green-300 bg-green-50'
                    : getSheetStatus(selectedSheets[statement.key]) === 'invalid'
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    selectedSheets[statement.key] 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-500'
                  }`}>
                    {selectedSheets[statement.key] || 'Select sheet...'}
                  </span>
                  <div className="flex items-center space-x-2">
                    {getSheetStatus(selectedSheets[statement.key]) === 'valid' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {getSheetStatus(selectedSheets[statement.key]) === 'invalid' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                      dropdownOpen === statement.key ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>
              </button>

              {/* Dropdown Options */}
              {dropdownOpen === statement.key && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      Sheets available in both models:
                    </div>
                    {commonSheets.length > 0 ? (
                      commonSheets.map((sheetName) => (
                        <button
                          key={sheetName}
                          onClick={() => handleSheetSelection(statement.key, sheetName)}
                          className={`w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-50 transition-colors ${
                            selectedSheets[statement.key] === sheetName 
                              ? 'bg-primary-50 text-primary-700' 
                              : 'text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{sheetName}</span>
                            {selectedSheets[statement.key] === sheetName && (
                              <CheckCircle className="h-4 w-4 text-primary-600" />
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No common sheets found between both models
                      </div>
                    )}
                  </div>
                  
                  {availableSheets.oldModelSheets.length > commonSheets.length && (
                    <div className="border-t p-2">
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        All sheets (may not exist in both models):
                      </div>
                      {[...new Set([...availableSheets.oldModelSheets, ...availableSheets.newModelSheets])].map((sheetName) => (
                        <button
                          key={sheetName}
                          onClick={() => handleSheetSelection(statement.key, sheetName)}
                          className={`w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-50 transition-colors ${
                            selectedSheets[statement.key] === sheetName 
                              ? 'bg-primary-50 text-primary-700' 
                              : 'text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{sheetName}</span>
                            <div className="flex items-center space-x-1">
                              {selectedSheets[statement.key] === sheetName && (
                                <CheckCircle className="h-4 w-4 text-primary-600" />
                              )}
                              {!commonSheets.includes(sheetName) && (
                                <AlertCircle className="h-3 w-3 text-orange-500" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Validation Messages */}
      {validationErrors.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-sm font-medium text-red-900">Sheet Validation Errors</h3>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Analyzing periods in selected sheets...
              </p>
              <span className="text-sm text-blue-700">
                Please wait while we detect all available periods.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {allSheetsSelected && allSheetsValid && !loading && !periodAnalysis && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  All financial statements selected and validated!
                </p>
                <span className="text-sm text-green-700">
                  Ready to analyze periods and variances.
                </span>
              </div>
            </div>
            <button
              onClick={onCompleteSheetSelection}
              className="btn btn-primary"
            >
              Continue to Analysis →
            </button>
          </div>
        </div>
      )}

      {/* Model Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Old Model Sheets:</span> {availableSheets.oldModelSheets.length}
            <div className="text-xs mt-1 max-h-16 overflow-y-auto">
              {availableSheets.oldModelSheets.join(', ')}
            </div>
          </div>
          <div>
            <span className="font-medium">New Model Sheets:</span> {availableSheets.newModelSheets.length}
            <div className="text-xs mt-1 max-h-16 overflow-y-auto">
              {availableSheets.newModelSheets.join(', ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}