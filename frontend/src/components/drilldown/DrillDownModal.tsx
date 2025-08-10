import React, { useState } from 'react'
import { 
  X, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  Code,
  Target,
  BarChart3,
  AlertCircle
} from 'lucide-react'

interface DrillDownComponent {
  name: string
  cell_reference: string
  value: number
  variance_contribution: number
  is_leaf_node: boolean
  has_formula: boolean
}

interface DrillDownResult {
  source_item: string
  source_value: number
  total_explained: number
  unexplained_variance: number
  drill_down_path: string[]
  components: DrillDownComponent[]
}

interface DrillDownModalProps {
  isOpen: boolean
  onClose: () => void
  result: DrillDownResult | null
  metadata: {
    statement_type: string
    line_item_name: string
    period: string
    sheet_name: string
    components_found: number
  } | null
  loading: boolean
  error: string | null
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  result,
  metadata,
  loading,
  error
}) => {
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set())

  if (!isOpen) return null

  const toggleComponent = (componentName: string) => {
    const newExpanded = new Set(expandedComponents)
    if (newExpanded.has(componentName)) {
      newExpanded.delete(componentName)
    } else {
      newExpanded.add(componentName)
    }
    setExpandedComponents(newExpanded)
  }

  const formatCurrency = (value: number) => {
    if (Math.abs(value) < 0.01) return '$0'
    
    const absValue = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    
    if (absValue >= 1e9) return `${sign}$${(absValue / 1e9).toFixed(1)}B`
    if (absValue >= 1e6) return `${sign}$${(absValue / 1e6).toFixed(1)}M`
    if (absValue >= 1e3) return `${sign}$${(absValue / 1e3).toFixed(0)}K`
    return `${sign}$${absValue.toFixed(0)}`
  }

  const getVarianceIcon = (variance: number) => {
    if (Math.abs(variance) < 0.01) return <Minus className="h-4 w-4 text-gray-400" />
    return variance > 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) < 0.01) return 'text-gray-600'
    const threshold = 1000
    const absVariance = Math.abs(variance)
    
    if (absVariance < threshold) return variance > 0 ? 'text-green-700' : 'text-red-700'
    if (absVariance < threshold * 5) return variance > 0 ? 'text-green-800' : 'text-red-800'
    return variance > 0 ? 'text-green-900 font-bold' : 'text-red-900 font-bold'
  }

  const sortedComponents = result?.components?.slice().sort((a, b) => 
    Math.abs(b.variance_contribution) - Math.abs(a.variance_contribution)
  ) || []

  const explainedPercentage = result && result.source_value !== 0 
    ? (Math.abs(result.total_explained) / Math.abs(result.source_value) * 100)
    : 0

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 p-2 bg-primary-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Drill Down Analysis
                  </h3>
                  {metadata && (
                    <p className="text-sm text-gray-600">
                      {metadata.line_item_name} • {metadata.period} • {metadata.statement_type.replace('_', ' ')}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 max-h-[70vh] overflow-y-auto">
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing formula dependencies...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-red-900 mb-2">Analysis Failed</h4>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Results */}
            {result && !loading && !error && (
              <div className="space-y-6">
                
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Variance Breakdown</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(result.source_value)}
                      </div>
                      <div className="text-sm text-gray-600">Source Value</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getVarianceColor(result.total_explained)}`}>
                        {result.total_explained >= 0 ? '+' : ''}{formatCurrency(result.total_explained)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Explained ({explainedPercentage.toFixed(1)}%)
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getVarianceColor(result.unexplained_variance)}`}>
                        {result.unexplained_variance >= 0 ? '+' : ''}{formatCurrency(result.unexplained_variance)}
                      </div>
                      <div className="text-sm text-gray-600">Unexplained</div>
                    </div>
                  </div>

                  {/* Explanation Bar */}
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, explainedPercentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>0% explained</span>
                      <span>100% explained</span>
                    </div>
                  </div>
                </div>

                {/* Components */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Components ({sortedComponents.length})
                  </h4>
                  
                  {sortedComponents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No formula components found to analyze</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sortedComponents.map((component, index) => (
                        <div 
                          key={index}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleComponent(component.name)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {component.has_formula ? (
                                  expandedComponents.has(component.name) ? (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                  )
                                ) : (
                                  <Target className="h-4 w-4 text-gray-400" />
                                )}
                                
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {component.name.split('!').pop() || component.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {component.cell_reference}
                                    {component.is_leaf_node && (
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                        Leaf Node
                                      </span>
                                    )}
                                    {component.has_formula && (
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                        <Code className="h-3 w-3 mr-1" />
                                        Formula
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-mono text-sm text-gray-900">
                                  {formatCurrency(component.value)}
                                </div>
                                <div className={`font-mono text-sm flex items-center ${getVarianceColor(component.variance_contribution)}`}>
                                  {getVarianceIcon(component.variance_contribution)}
                                  <span className="ml-1">
                                    {component.variance_contribution >= 0 ? '+' : ''}{formatCurrency(component.variance_contribution)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>

                          {/* Expanded Details */}
                          {expandedComponents.has(component.name) && (
                            <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                              <div className="text-sm text-gray-600">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="font-medium">Reference:</span> {component.cell_reference}
                                  </div>
                                  <div>
                                    <span className="font-medium">Type:</span> {component.is_leaf_node ? 'Constant/Input' : 'Calculated'}
                                  </div>
                                </div>
                                
                                {component.variance_contribution !== 0 && (
                                  <div className="mt-2">
                                    <span className="font-medium">Contribution:</span>{' '}
                                    <span className={getVarianceColor(component.variance_contribution)}>
                                      {((component.variance_contribution / (result.total_explained || 1)) * 100).toFixed(1)}% of explained variance
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Footer */}
          {result && !loading && !error && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>
                    <ArrowUpRight className="h-4 w-4 inline mr-1" />
                    Analysis Depth: {result.drill_down_path.length} level{result.drill_down_path.length !== 1 ? 's' : ''}
                  </span>
                  {metadata && (
                    <span>Sheet: {metadata.sheet_name}</span>
                  )}
                </div>
                
                <button
                  onClick={onClose}
                  className="btn btn-primary"
                >
                  Close Analysis
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}