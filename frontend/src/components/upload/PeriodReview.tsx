import React, { useState } from 'react'
import { Calendar, CheckCircle, AlertCircle, ArrowRight, Settings } from 'lucide-react'

interface PeriodReviewProps {
  sessionId: string
  periodAnalysis: {
    total_periods: number
    annual_periods: string[]
    quarterly_periods: string[]
    other_periods: string[]
    suggested_templates: Array<{
      name: string
      pattern: string
      example: string
      description: string
    }>
  }
  periodsNeedReview: boolean
  onApprove: () => void
  onRequestTemplates: () => void
}

export const PeriodReview: React.FC<PeriodReviewProps> = ({
  sessionId,
  periodAnalysis,
  periodsNeedReview,
  onApprove,
  onRequestTemplates
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const totalFound = periodAnalysis.total_periods
  const quarterlyFound = periodAnalysis.quarterly_periods.length
  const annualFound = periodAnalysis.annual_periods.length

  // Determine if this looks insufficient
  const seemsIncomplete = totalFound < 50 || quarterlyFound < 20

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Calendar className="h-6 w-6 text-primary-600 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Review Detected Periods</h2>
          <p className="text-sm text-gray-600 mt-1">
            Please review the periods we found in your financial statements
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{totalFound}</div>
          <div className="text-sm text-blue-700">Total Periods</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{quarterlyFound}</div>
          <div className="text-sm text-green-700">Quarterly</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{annualFound}</div>
          <div className="text-sm text-purple-700">Annual</div>
        </div>
      </div>

      {/* Quality Assessment */}
      {seemsIncomplete && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-orange-900">
                Periods May Be Incomplete
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                We found only {totalFound} periods ({quarterlyFound} quarterly). 
                Many financial models have 50+ periods. Consider using custom templates if periods are missing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Period Breakdown */}
      <div className="space-y-4 mb-6">
        
        {/* Quarterly Periods */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('quarterly')}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="font-medium">Quarterly Periods ({quarterlyFound})</span>
            </div>
            <ArrowRight className={`h-4 w-4 text-gray-400 transition-transform ${
              expandedSection === 'quarterly' ? 'rotate-90' : ''
            }`} />
          </button>
          
          {expandedSection === 'quarterly' && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="grid grid-cols-4 gap-2 mt-3">
                {periodAnalysis.quarterly_periods.slice(0, 20).map((period, index) => (
                  <div key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {period}
                  </div>
                ))}
                {quarterlyFound > 20 && (
                  <div className="text-xs text-gray-500 px-2 py-1">
                    +{quarterlyFound - 20} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Annual Periods */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('annual')}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <span className="font-medium">Annual Periods ({annualFound})</span>
            </div>
            <ArrowRight className={`h-4 w-4 text-gray-400 transition-transform ${
              expandedSection === 'annual' ? 'rotate-90' : ''
            }`} />
          </button>
          
          {expandedSection === 'annual' && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="grid grid-cols-6 gap-2 mt-3">
                {periodAnalysis.annual_periods.map((period, index) => (
                  <div key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {period}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Other Periods */}
        {periodAnalysis.other_periods.length > 0 && (
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('other')}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                <span className="font-medium">Other Periods ({periodAnalysis.other_periods.length})</span>
              </div>
              <ArrowRight className={`h-4 w-4 text-gray-400 transition-transform ${
                expandedSection === 'other' ? 'rotate-90' : ''
              }`} />
            </button>
            
            {expandedSection === 'other' && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {periodAnalysis.other_periods.map((period, index) => (
                    <div key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {period}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggested Templates */}
      {periodAnalysis.suggested_templates.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-3">
            💡 Detected Patterns - Available Templates
          </h3>
          <div className="space-y-2">
            {periodAnalysis.suggested_templates.map((template, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="font-medium text-sm text-blue-900">{template.name}</div>
                <div className="text-xs text-blue-700 mt-1">{template.description}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Pattern: <code className="bg-gray-100 px-1 rounded">{template.pattern}</code>
                </div>
                <div className="text-xs text-gray-600">
                  Example: {template.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {seemsIncomplete ? (
            "We recommend using templates if periods seem incomplete"
          ) : (
            "Periods look comprehensive. Proceed or customize with templates."
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onRequestTemplates}
            className="btn btn-outline flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Use Templates
          </button>
          
          <button
            onClick={onApprove}
            className="btn btn-primary flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve & Continue
          </button>
        </div>
      </div>
    </div>
  )
}