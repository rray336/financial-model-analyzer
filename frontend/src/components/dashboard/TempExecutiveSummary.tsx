import React from 'react'
import { CheckCircle, AlertTriangle, FileSpreadsheet, TrendingUp } from 'lucide-react'

interface TempExecutiveSummaryProps {
  data: any
  sessionId: string
}

export const TempExecutiveSummary: React.FC<TempExecutiveSummaryProps> = ({
  data
}) => {
  if (!data?.executive_summary) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="text-center">
          <p>No analysis data available</p>
        </div>
      </div>
    )
  }

  const summary = data.executive_summary

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="h-6 w-6 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
        </div>
        
        <div className="text-gray-600">
          <p>Analysis of your uploaded financial models has been completed.</p>
        </div>
      </div>

      {/* Parsing Results */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Parsing Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <FileSpreadsheet className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{summary.parsing_results?.old_model_sheets || 0}</div>
            <div className="text-sm text-gray-600">Old Model Sheets</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded">
            <FileSpreadsheet className="h-8 w-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{summary.parsing_results?.new_model_sheets || 0}</div>
            <div className="text-sm text-gray-600">New Model Sheets</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded">
            {summary.parsing_results?.structure_match ? (
              <CheckCircle className="h-8 w-8 text-success-500 mx-auto mb-2" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-warning-500 mx-auto mb-2" />
            )}
            <div className="text-sm font-medium text-gray-900">Structure Match</div>
            <div className="text-xs text-gray-600">
              {summary.parsing_results?.structure_match ? 'Yes' : 'No'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">
              {((summary.parsing_results?.compatibility_score || 0) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Compatibility</div>
          </div>
        </div>
      </div>

      {/* Financial Statements Found */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Statements Detected</h3>
        
        <div className="space-y-3">
          {Object.entries(summary.financial_statements_found || {}).map(([statement, found]) => (
            <div key={statement} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium text-gray-900 capitalize">
                {statement.replace('_', ' ')}
              </span>
              {found ? (
                <div className="flex items-center text-success-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm">Found</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-400">
                  <AlertTriangle className="h-5 w-5 mr-1" />
                  <span className="text-sm">Not Found</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Variances */}
      {summary.revenue_variances && Object.keys(summary.revenue_variances).length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analysis (Q3 2025)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(summary.revenue_variances).map(([key, variance]: [string, any]) => {
              const isPositive = variance.absolute_variance >= 0
              const displayName = key.replace('_variance', '').replace('_', ' ').toUpperCase()
              
              return (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{displayName}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Old:</span>
                      <span className="font-medium">${variance.old_value?.toFixed(0)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">New:</span>
                      <span className="font-medium">${variance.new_value?.toFixed(0)}M</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-200">
                      <span className="text-gray-600">Variance:</span>
                      <span className={`font-bold ${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
                        ${variance.absolute_variance?.toFixed(0)}M ({variance.percentage_variance?.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Key Insights */}
      {summary.key_insights && summary.key_insights.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <ul className="space-y-2">
            {summary.key_insights.map((insight: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">{insight}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {summary.warnings && summary.warnings.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-warning-800 mb-4">Warnings</h3>
          <ul className="space-y-2">
            {summary.warnings.map((warning: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-warning-600 mt-0.5 flex-shrink-0" />
                <p className="text-warning-700">{warning}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}