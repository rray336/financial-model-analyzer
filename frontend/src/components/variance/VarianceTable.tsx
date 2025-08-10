import React, { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronDown, 
  ChevronRight,
  AlertTriangle,
  DollarSign,
  Percent,
  X,
  Eye
} from 'lucide-react'
import { VarianceItem } from '../../services/types'

interface VarianceTableProps {
  variances: Record<string, VarianceItem>
  statementType: string
  period: string
  onDrillDown?: (lineItemName: string) => void
  loading?: boolean
}

export const VarianceTable: React.FC<VarianceTableProps> = ({
  variances,
  statementType,
  period,
  onDrillDown,
  loading = false
}) => {
  const [sortBy, setSortBy] = useState<'line_item_name' | 'old_value' | 'new_value' | 'absolute_variance' | 'percentage_variance' | 'row_index'>('row_index')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set())

  // Convert variances object to array and sort
  const varianceItems = Object.entries(variances).map(([key, item]) => ({
    key,
    ...item
  }))

  const sortedItems = [...varianceItems].sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]
    const direction = sortDirection === 'asc' ? 1 : -1
    
    // Special handling for row_index - treat undefined as high number for sorting
    if (sortBy === 'row_index') {
      aVal = (a.row_index || 999999) as number
      bVal = (b.row_index || 999999) as number
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * direction
    }
    
    return ((aVal as number) - (bVal as number)) * direction
  })

  // Filter out hidden items (no significance filtering)
  const filteredItems = sortedItems.filter(item => !hiddenItems.has(item.key))

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('desc')
    }
  }

  const handleRowClick = (item: VarianceItem & { key: string }) => {
    if (item.drill_down_available && onDrillDown) {
      onDrillDown(item.line_item_name)
    }
  }

  const toggleRowExpansion = (key: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedRows(newExpanded)
  }

  const hideItem = (key: string) => {
    const newHidden = new Set(hiddenItems)
    newHidden.add(key)
    setHiddenItems(newHidden)
  }

  const unhideItem = (key: string) => {
    const newHidden = new Set(hiddenItems)
    newHidden.delete(key)
    setHiddenItems(newHidden)
  }

  const showAllItems = () => {
    setHiddenItems(new Set())
  }

  const getVarianceIcon = (variance: number) => {
    if (Math.abs(variance) < 0.01) return <Minus className="h-4 w-4 text-gray-400" />
    return variance > 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getVarianceColor = (variance: number, isPercentage: boolean = false) => {
    const threshold = isPercentage ? 5 : 1000
    const absVariance = Math.abs(variance)
    
    if (absVariance < 0.01) return 'text-gray-600'
    if (absVariance < threshold) return variance > 0 ? 'text-green-700' : 'text-red-700'
    if (absVariance < threshold * 5) return variance > 0 ? 'text-green-800' : 'text-red-800'
    return variance > 0 ? 'text-green-900 font-bold' : 'text-red-900 font-bold'
  }

  const formatValue = (value: number, formatType: string = 'currency') => {
    if (value === null || value === undefined || isNaN(value)) return '—'
    
    const absValue = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    
    switch (formatType) {
      case 'currency_precise':
        // For EPS and per-share values - show 2-3 decimal places
        if (absValue < 0.01) return '$0.00'
        if (absValue >= 1e6) return `${sign}$${(absValue / 1e6).toFixed(2)}M`
        if (absValue >= 1e3) return `${sign}$${(absValue / 1e3).toFixed(2)}K`
        return `${sign}$${absValue.toFixed(2)}`
        
      case 'percentage':
        if (absValue < 0.01) return '0.0%'
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
        
      case 'ratio':
        if (absValue < 0.01) return '0.00x'
        return `${value.toFixed(2)}x`
        
      case 'count':
        if (absValue < 0.01) return '0'
        if (absValue >= 1e9) return `${sign}${(absValue / 1e9).toFixed(1)}B`
        if (absValue >= 1e6) return `${sign}${(absValue / 1e6).toFixed(1)}M`
        if (absValue >= 1e3) return `${sign}${(absValue / 1e3).toFixed(0)}K`
        return `${sign}${absValue.toFixed(0)}`
        
      case 'currency':
      default:
        // Standard currency formatting
        if (absValue < 0.01) return '$0'
        if (absValue >= 1e9) return `${sign}$${(absValue / 1e9).toFixed(1)}B`
        if (absValue >= 1e6) return `${sign}$${(absValue / 1e6).toFixed(1)}M`
        if (absValue >= 1e3) return `${sign}$${(absValue / 1e3).toFixed(0)}K`
        return `${sign}$${absValue.toFixed(0)}`
    }
  }
  
  const formatCurrency = (value: number) => {
    return formatValue(value, 'currency')
  }

  const formatPercentage = (value: number) => {
    if (Math.abs(value) < 0.01) return '0%'
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const SortHeader: React.FC<{ column: typeof sortBy; children: React.ReactNode }> = ({ column, children }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortBy === column && (
          <ChevronDown className={`h-4 w-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
        )}
      </div>
    </th>
  )

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Variance Data</h3>
        <p className="text-gray-600">
          {hiddenItems.size > 0 ? 
            "All items are hidden. Use 'Show All' to restore them." :
            "No variance data available for this statement and period combination."
          }
        </p>
        {hiddenItems.size > 0 && (
          <button
            onClick={showAllItems}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Show All Items
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {statementType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Variance Analysis
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Period: <span className="font-medium">{period}</span> • 
              Items: <span className="font-medium">{filteredItems.length}</span>
              {hiddenItems.size > 0 && <span className="text-gray-500"> ({hiddenItems.size} hidden)</span>}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Simple Show All Button */}
            {hiddenItems.size > 0 && (
              <button
                onClick={showAllItems}
                className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium text-green-600 hover:bg-green-50 border border-green-200"
              >
                <Eye className="h-4 w-4" />
                <span>Show All ({hiddenItems.size} hidden)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-2 py-3"></th> {/* Expansion column */}
              <SortHeader column="row_index">Row</SortHeader>
              <SortHeader column="line_item_name">Line Item</SortHeader>
              <SortHeader column="old_value">Old Value</SortHeader>
              <SortHeader column="new_value">New Value</SortHeader>
              <SortHeader column="absolute_variance">$ Variance</SortHeader>
              <SortHeader column="percentage_variance">% Variance</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <React.Fragment key={item.key}>
                <tr 
                  className={`hover:bg-gray-50 transition-colors ${
                    item.drill_down_available ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handleRowClick(item)}
                >
                  {/* Expansion toggle */}
                  <td className="px-2 py-4">
                    {(item.matched_with && item.matched_with !== item.line_item_name) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRowExpansion(item.key)
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedRows.has(item.key) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </button>
                    )}
                  </td>

                  {/* Excel Row Number */}
                  <td className="px-2 py-4 text-xs text-gray-500 font-mono">
                    {item.row_index ? (
                      <span 
                        className="bg-gray-100 px-2 py-1 rounded"
                        title={`Excel row ${item.row_index}${item.sheet_name ? ` in ${item.sheet_name}` : ''}`}
                      >
                        {item.row_index}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  {/* Line Item Name */}
                  <td className={`px-4 py-4 text-sm ${item.is_key_item ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-center">
                      <span className={`${item.is_key_item ? 'font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
                        {item.line_item_name}
                      </span>
                      {item.has_formula && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Formula
                        </span>
                      )}
                      {item.drill_down_available && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Drill Down
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Old Value */}
                  <td className={`px-4 py-4 text-sm font-mono ${item.is_key_item ? 'bg-blue-50 font-semibold text-gray-900' : 'text-gray-900'}`}>
                    {formatValue(item.old_value, item.format_type)}
                  </td>

                  {/* New Value */}
                  <td className={`px-4 py-4 text-sm font-mono ${item.is_key_item ? 'bg-blue-50 font-semibold text-gray-900' : 'text-gray-900'}`}>
                    {formatValue(item.new_value, item.format_type)}
                  </td>

                  {/* Absolute Variance */}
                  <td className={`px-4 py-4 text-sm font-mono ${item.is_key_item ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-center space-x-2">
                      {getVarianceIcon(item.absolute_variance)}
                      <span className={getVarianceColor(item.absolute_variance)}>
                        {item.absolute_variance >= 0 ? '+' : ''}{formatValue(item.absolute_variance, item.format_type)}
                      </span>
                    </div>
                  </td>

                  {/* Percentage Variance */}
                  <td className={`px-4 py-4 text-sm font-mono ${item.is_key_item ? 'bg-blue-50' : ''}`}>
                    <span className={getVarianceColor(item.percentage_variance, true)}>
                      {formatPercentage(item.percentage_variance)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className={`px-4 py-4 text-sm ${item.is_key_item ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-center space-x-2">
                      {item.drill_down_available && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDrillDown?.(item.line_item_name)
                          }}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          Drill Down
                        </button>
                      )}
                      
                      {/* Hide Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          hideItem(item.key)
                        }}
                        className="flex items-center space-x-1 text-gray-400 hover:text-red-600 font-medium"
                        title="Hide this item"
                      >
                        <X className="h-4 w-4" />
                        <span>Hide</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded row details */}
                {expandedRows.has(item.key) && item.matched_with && item.matched_with !== item.line_item_name && (
                  <tr className="bg-gray-50">
                    <td></td>
                    <td></td>
                    <td colSpan={6} className="px-4 py-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium">Matched with:</span>
                        <span className="ml-2 italic">"{item.matched_with}"</span>
                        <span className="ml-4 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Fuzzy Match
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-600">Total Items:</span>
            <span className="ml-2 font-semibold">{filteredItems.length}</span>
          </div>
          
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-gray-600">Increases:</span>
            <span className="ml-2 font-semibold text-green-700">
              {filteredItems.filter(item => item.absolute_variance > 0).length}
            </span>
          </div>
          
          <div className="flex items-center">
            <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-gray-600">Decreases:</span>
            <span className="ml-2 font-semibold text-red-700">
              {filteredItems.filter(item => item.absolute_variance < 0).length}
            </span>
          </div>

          <div className="flex items-center">
            <Percent className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-600">Avg Change:</span>
            <span className="ml-2 font-semibold">
              {filteredItems.length > 0 ? 
                `${(filteredItems.reduce((sum, item) => sum + Math.abs(item.percentage_variance), 0) / filteredItems.length).toFixed(1)}%`
                : '0%'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}