import React from 'react'
import { 
  TrendingUp, 
  Building2, 
  DollarSign, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface StatementSelectorProps {
  selectedStatement: string
  onStatementChange: (statement: string) => void
  availableStatements: string[]
  statementCounts?: Record<string, number>
  loading?: boolean
}

export const StatementSelector: React.FC<StatementSelectorProps> = ({
  selectedStatement,
  onStatementChange,
  availableStatements,
  statementCounts = {},
  loading = false
}) => {
  const statementConfig = {
    income_statement: {
      label: 'Income Statement',
      shortLabel: 'P&L',
      icon: TrendingUp,
      description: 'Revenue, expenses, and profitability analysis',
      color: 'bg-green-100 text-green-800 border-green-200',
      hoverColor: 'hover:bg-green-50 hover:border-green-300'
    },
    balance_sheet: {
      label: 'Balance Sheet',
      shortLabel: 'B/S',
      icon: Building2,
      description: 'Assets, liabilities, and equity positions',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      hoverColor: 'hover:bg-blue-50 hover:border-blue-300'
    },
    cash_flow: {
      label: 'Cash Flow Statement',
      shortLabel: 'C/F',
      icon: DollarSign,
      description: 'Operating, investing, and financing cash flows',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      hoverColor: 'hover:bg-purple-50 hover:border-purple-300'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Financial Statement</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(statementConfig).map(([key, config]) => {
          const isAvailable = availableStatements.includes(key)
          const isSelected = selectedStatement === key
          const itemCount = statementCounts[key] || 0
          const IconComponent = config.icon

          return (
            <button
              key={key}
              onClick={() => isAvailable && onStatementChange(key)}
              disabled={!isAvailable}
              className={`
                relative p-4 rounded-lg border-2 text-left transition-all duration-200
                ${isSelected 
                  ? `${config.color} border-current shadow-md` 
                  : isAvailable
                    ? `border-gray-200 ${config.hoverColor} bg-white`
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-5 w-5 text-current" />
                </div>
              )}

              {/* Unavailable Indicator */}
              {!isAvailable && (
                <div className="absolute top-2 right-2">
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className={`
                  flex-shrink-0 p-2 rounded-lg
                  ${isSelected 
                    ? 'bg-white bg-opacity-70' 
                    : isAvailable 
                      ? 'bg-gray-100'
                      : 'bg-gray-200'
                  }
                `}>
                  <IconComponent className={`
                    h-6 w-6 
                    ${isSelected 
                      ? 'text-current' 
                      : isAvailable 
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }
                  `} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className={`
                      font-semibold text-sm
                      ${isSelected 
                        ? 'text-current' 
                        : isAvailable 
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }
                    `}>
                      {config.label}
                    </h4>
                    <span className={`
                      text-xs font-medium px-2 py-1 rounded-full
                      ${isSelected 
                        ? 'bg-white bg-opacity-50 text-current' 
                        : isAvailable
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}>
                      {config.shortLabel}
                    </span>
                  </div>
                  
                  <p className={`
                    text-xs mt-1 leading-tight
                    ${isSelected 
                      ? 'text-current opacity-80' 
                      : isAvailable 
                        ? 'text-gray-600'
                        : 'text-gray-500'
                    }
                  `}>
                    {config.description}
                  </p>
                  
                  {/* Item Count */}
                  {isAvailable && itemCount > 0 && (
                    <div className="mt-2 flex items-center text-xs">
                      <span className={`
                        ${isSelected 
                          ? 'text-current opacity-80' 
                          : 'text-gray-500'
                        }
                      `}>
                        {itemCount} line items
                      </span>
                    </div>
                  )}

                  {/* Unavailable Message */}
                  {!isAvailable && (
                    <div className="mt-2 text-xs text-gray-500">
                      Sheet not selected
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Help Text */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          Select a financial statement to analyze variances. Only statements with selected sheets are available.
        </p>
      </div>
    </div>
  )
}