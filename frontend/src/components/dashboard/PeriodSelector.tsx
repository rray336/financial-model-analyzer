import React, { useState, useEffect } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

interface PeriodOption {
  value: string
  label: string
  type: 'quarterly' | 'annual'
}

interface PeriodSelectorProps {
  sessionId: string
  onPeriodChange: (period: string) => void
  selectedPeriod?: string
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  sessionId,
  onPeriodChange,
  selectedPeriod
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [periods, setPeriods] = useState<PeriodOption[]>([])
  const [loading, setLoading] = useState(true)
  const [periodType, setPeriodType] = useState<'quarterly' | 'annual' | 'all'>('quarterly')

  // Mock data based on our extraction - in real implementation, this would come from API
  const mockPeriods = {
    quarterly: [
      '3Q25E', '4Q25E', '1Q26E', '2Q26E', '3Q26E', '4Q26E', 
      '1Q27E', '2Q27E', '3Q27E', '4Q27E'
    ],
    annual: ['2020', '2021', '2022', '2023', '2024'],
    suggested_default: '3Q25E'  // Changed from 4Q27E to 3Q25E for realistic current period
  }

  useEffect(() => {
    // Simulate loading periods from API
    const loadPeriods = async () => {
      try {
        setLoading(true)
        
        // In real implementation, this would be:
        // const response = await analysisAPI.getAvailablePeriods(sessionId)
        
        // Mock loading delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const quarterlyPeriods: PeriodOption[] = mockPeriods.quarterly.map(period => ({
          value: period,
          label: formatPeriodLabel(period),
          type: 'quarterly' as const
        }))
        
        const annualPeriods: PeriodOption[] = mockPeriods.annual.map(period => ({
          value: period,
          label: period,
          type: 'annual' as const
        }))
        
        setPeriods([...quarterlyPeriods, ...annualPeriods])
        
        // Auto-select suggested default if no period selected
        if (!selectedPeriod) {
          const defaultPeriod = mockPeriods.suggested_default
          onPeriodChange(defaultPeriod)
        }
        
      } catch (error) {
        console.error('Failed to load periods:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPeriods()
  }, [sessionId, selectedPeriod, onPeriodChange])

  const formatPeriodLabel = (period: string): string => {
    // Convert 3Q25E to "Q3 2025 (Est.)"
    if (period.includes('Q') && period.includes('E')) {
      const match = period.match(/(\d)Q(\d{2})E?/)
      if (match) {
        const quarter = match[1]
        const year = `20${match[2]}`
        return `Q${quarter} ${year} (Est.)`
      }
    }
    
    // Convert 3Q25 to "Q3 2025"
    if (period.includes('Q')) {
      const match = period.match(/(\d)Q(\d{2,4})/)
      if (match) {
        const quarter = match[1]
        let year = match[2]
        if (year.length === 2) {
          year = `20${year}`
        }
        return `Q${quarter} ${year}`
      }
    }
    
    return period
  }

  const filteredPeriods = periods.filter(period => {
    if (periodType === 'all') return true
    return period.type === periodType
  })

  const selectedPeriodObj = periods.find(p => p.value === selectedPeriod)

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Calendar className="h-4 w-4" />
        <span className="text-sm">Loading periods...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Period Type Toggle */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">View:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPeriodType('quarterly')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              periodType === 'quarterly' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => setPeriodType('annual')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              periodType === 'annual' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annual
          </button>
          <button
            onClick={() => setPeriodType('all')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              periodType === 'all' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="font-medium">
            {selectedPeriodObj ? selectedPeriodObj.label : 'Select Period'}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredPeriods.length > 0 ? (
                filteredPeriods.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => {
                      onPeriodChange(period.value)
                      setIsOpen(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                      selectedPeriod === period.value ? 'bg-primary-50 text-primary-700' : ''
                    }`}
                  >
                    <span>{period.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      period.type === 'quarterly' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {period.type === 'quarterly' ? 'Q' : 'Y'}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No periods available for {periodType}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Period Info */}
      {selectedPeriodObj && (
        <div className="text-sm text-gray-500">
          Comparing {selectedPeriodObj.label} across both models
        </div>
      )}
    </div>
  )
}