import React, { useState, useEffect } from 'react'
import { Calendar, ChevronDown, Info } from 'lucide-react'
import { analysisAPI } from '../../services/api'

interface PeriodSelectorProps {
  sessionId: string
  selectedPeriod: string
  onPeriodChange: (period: string) => void
  loading?: boolean
}

export const DynamicPeriodSelector: React.FC<PeriodSelectorProps> = ({
  sessionId,
  selectedPeriod,
  onPeriodChange,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [periodsLoading, setPeriodsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load periods from selected sheets
  useEffect(() => {
    const loadPeriods = async () => {
      if (!sessionId) return
      
      try {
        setPeriodsLoading(true)
        setError(null)
        
        const response = await analysisAPI.getPeriodsFromSheets(sessionId)
        setAvailablePeriods(response.available_periods || [])
        
        // Auto-select default period if none selected
        if (!selectedPeriod && response.default_period) {
          onPeriodChange(response.default_period)
        }
        
      } catch (error: any) {
        console.error('Failed to load periods:', error)
        setError('Failed to load available periods')
      } finally {
        setPeriodsLoading(false)
      }
    }
    
    loadPeriods()
  }, [sessionId, selectedPeriod, onPeriodChange])

  // Get period type for badge display only
  const getPeriodType = (period: string): 'quarterly' | 'annual' | 'other' => {
    // Test quarterly patterns: Q1, Q2, 1Q25, 2Q25E, FY1Q25, FY2Q25E, etc.
    if (/^Q\d|^\d+Q\d|^FY\d+Q/i.test(period)) {
      return 'quarterly'
    } 
    // Test annual patterns: FY2024, 2024, 2024E, etc. (but not FY1Q25 which is quarterly)
    else if (/^FY\d{4}|^\d{4}[E]?$/.test(period) && !/Q/i.test(period)) {
      return 'annual'
    } 
    else {
      return 'other'
    }
  }

  const formatPeriodLabel = (period: string): string => {
    // Convert various period formats to readable labels
    if (period.match(/^\d+Q\d{2}E?$/)) {
      // Format like "3Q25E" -> "Q3 2025 (Est.)"
      const match = period.match(/^(\d+)Q(\d{2})(E?)$/)
      if (match) {
        const quarter = match[1]
        const year = `20${match[2]}`
        const estimate = match[3] ? ' (Est.)' : ''
        return `Q${quarter} ${year}${estimate}`
      }
    }
    
    if (period.match(/^Q\d\s?\d{4}$/)) {
      // Already in good format like "Q1 2024"
      return period
    }
    
    if (period.match(/^\d{4}E?$/)) {
      // Format like "2024E" -> "2024 (Est.)"
      const estimate = period.includes('E') ? ' (Est.)' : ''
      return period.replace('E', '') + estimate
    }
    
    // Return as-is for other formats
    return period
  }


  const getPeriodTypeBadge = (period: string) => {
    const type = getPeriodType(period)
    if (type === 'quarterly') return { label: 'Q', color: 'bg-blue-100 text-blue-700' }
    if (type === 'annual') return { label: 'Y', color: 'bg-green-100 text-green-700' }
    return { label: '?', color: 'bg-gray-100 text-gray-700' }
  }

  if (loading || periodsLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Calendar className="h-4 w-4 animate-pulse" />
        <span className="text-sm">Loading periods...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <Info className="h-4 w-4" />
        <span className="text-sm">{error}</span>
      </div>
    )
  }

  if (availablePeriods.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Calendar className="h-4 w-4" />
        <span className="text-sm">No periods available</span>
      </div>
    )
  }

  const selectedPeriodLabel = selectedPeriod ? formatPeriodLabel(selectedPeriod) : 'Select Period'
  const selectedBadge = selectedPeriod ? getPeriodTypeBadge(selectedPeriod) : null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors min-w-[200px]"
      >
        <Calendar className="h-4 w-4 text-gray-500" />
        <div className="flex-1 text-left">
          <span className="font-medium text-gray-900">
            {selectedPeriodLabel}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {selectedBadge && (
            <span className={`text-xs px-2 py-1 rounded-full ${selectedBadge.color}`}>
              {selectedBadge.label}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[600px] overflow-y-auto">
          
          {/* All Periods in Excel Order */}
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Available Periods ({availablePeriods.length})
            </div>
            <div className="grid grid-cols-2 gap-1 max-h-[500px] overflow-y-auto">
              {availablePeriods.map((period) => {
                // Get badge based on original period string, not formatted label
                const badge = getPeriodTypeBadge(period)
                const formattedLabel = formatPeriodLabel(period)
                
                return (
                  <button
                    key={period}
                    onClick={() => {
                      onPeriodChange(period)
                      setIsOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-50 transition-colors ${
                      selectedPeriod === period 
                        ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                        : 'text-gray-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{formattedLabel}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${badge.color} ml-1`}>
                        {badge.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-600 text-center">
              {availablePeriods.length} periods detected from financial statements
            </div>
          </div>
        </div>
      )}
    </div>
  )
}