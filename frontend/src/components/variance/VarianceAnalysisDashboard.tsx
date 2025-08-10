import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  RefreshCw, 
  Download,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Info
} from 'lucide-react'
import { analysisAPI } from '../../services/api'
import { VarianceTable } from './VarianceTable'
import { StatementSelector } from './StatementSelector'
import { DynamicPeriodSelector } from './DynamicPeriodSelector'
import { DrillDownModal } from '../drilldown/DrillDownModal'

export const VarianceAnalysisDashboard: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  
  const [selectedStatement, setSelectedStatement] = useState<string>('income_statement')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Drill-down modal state
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean
    lineItemName: string | null
    result: any | null
    metadata: any | null
    loading: boolean
    error: string | null
  }>({
    isOpen: false,
    lineItemName: null,
    result: null,
    metadata: null,
    loading: false,
    error: null
  })

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Session Not Found</h2>
          <p className="text-gray-600 mt-2">Please upload files to start a new analysis.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary mt-4"
          >
            Upload New Files
          </button>
        </div>
      </div>
    )
  }

  // Query for session status
  const { data: sessionStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => analysisAPI.getSessionStatus(sessionId),
    refetchInterval: 5000, // Check status every 5 seconds
  })

  // Query for available sheets/periods
  const { data: periodsData, isLoading: periodsLoading } = useQuery({
    queryKey: ['periods', sessionId, refreshTrigger],
    queryFn: () => analysisAPI.getPeriodsFromSheets(sessionId),
    enabled: !!sessionId
  })

  // Query for variance analysis
  const { data: varianceData, isLoading: varianceLoading, error: varianceError, refetch: refetchVariances } = useQuery({
    queryKey: ['variance', sessionId, selectedStatement, selectedPeriod],
    queryFn: () => analysisAPI.getExecutiveSummary(sessionId, selectedPeriod),
    enabled: !!sessionId && !!selectedPeriod,
    retry: 1
  })

  // Auto-select first available statement and period
  useEffect(() => {
    if (periodsData) {
      const availableStatements = Object.keys(periodsData.selected_sheets || {})
      if (availableStatements.length > 0 && !availableStatements.includes(selectedStatement)) {
        setSelectedStatement(availableStatements[0])
      }
      
      if (periodsData.available_periods?.length > 0 && !selectedPeriod) {
        setSelectedPeriod(periodsData.available_periods[0])
      }
    }
  }, [periodsData, selectedStatement, selectedPeriod])

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
    refetchVariances()
  }

  const handleDrillDown = async (lineItemName: string) => {
    console.log('Drill down into:', lineItemName)
    
    // Open modal and start loading
    setDrillDownModal(prev => ({
      ...prev,
      isOpen: true,
      lineItemName,
      loading: true,
      error: null,
      result: null,
      metadata: null
    }))
    
    try {
      // Call drill-down API
      const response = await analysisAPI.drillDownLineItem(sessionId, {
        statement_type: selectedStatement,
        line_item_name: lineItemName,
        period: selectedPeriod
      })
      
      // Update modal with results
      setDrillDownModal(prev => ({
        ...prev,
        loading: false,
        result: response.drill_down_result,
        metadata: response.analysis_metadata
      }))
      
    } catch (error: any) {
      console.error('Drill-down failed:', error)
      
      setDrillDownModal(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.detail || 'Failed to perform drill-down analysis'
      }))
    }
  }
  
  const closeDrillDownModal = () => {
    setDrillDownModal({
      isOpen: false,
      lineItemName: null,
      result: null,
      metadata: null,
      loading: false,
      error: null
    })
  }

  const handleExport = () => {
    console.log('Export variance analysis')
    // TODO: Implement export functionality
  }

  // Extract variance data for current statement
  const currentVariances = varianceData?.executive_summary?.variance_data?.variances?.[selectedStatement] || {}
  const hasVarianceData = Object.keys(currentVariances).length > 0
  
  // Get statement counts for selector
  const statementCounts = varianceData?.executive_summary?.variance_data?.variances 
    ? Object.fromEntries(
        Object.entries(varianceData.executive_summary.variance_data.variances).map(
          ([key, variances]) => [key, Object.keys(variances as any).length]
        )
      )
    : {}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                New Analysis
              </button>
              
              <div className="h-6 border-l border-gray-300"></div>
              
              <div className="flex items-center">
                <FileSpreadsheet className="h-5 w-5 text-primary-600 mr-2" />
                <h1 className="text-lg font-semibold text-gray-900">
                  Variance Analysis
                </h1>
              </div>
              
              {sessionStatus && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {sessionStatus.status}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="btn btn-outline btn-sm"
                disabled={varianceLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${varianceLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={handleExport}
                className="btn btn-primary btn-sm"
                disabled={!hasVarianceData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          
          {/* Analysis Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Statement Selector */}
            <StatementSelector
              selectedStatement={selectedStatement}
              onStatementChange={setSelectedStatement}
              availableStatements={Object.keys(periodsData?.selected_sheets || {})}
              statementCounts={statementCounts}
              loading={statusLoading || periodsLoading}
            />

            {/* Period Selector */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Analysis Period</h3>
              <DynamicPeriodSelector
                sessionId={sessionId}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                loading={periodsLoading}
              />
              
              {selectedPeriod && (
                <div className="mt-3 text-sm text-gray-600">
                  <p>Analyzing <span className="font-medium">{selectedPeriod}</span> across both models</p>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Status */}
          {varianceData?.executive_summary?.variance_data && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Analysis Summary</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {varianceData.executive_summary.variance_data.total_line_items || 0} line items analyzed
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Status: {varianceData.executive_summary.variance_data.status}</span>
                </div>
                <div className="flex items-center">
                  <FileSpreadsheet className="h-4 w-4 text-blue-500 mr-2" />
                  <span>Statements: {varianceData.executive_summary.variance_data.statements_analyzed?.length || 0}</span>
                </div>
                <div className="flex items-center">
                  <Info className="h-4 w-4 text-purple-500 mr-2" />
                  <span>Period: {varianceData.executive_summary.variance_data.period}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {varianceError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-900">Analysis Error</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {(varianceError as any)?.response?.data?.detail || 'Failed to load variance analysis'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="btn btn-outline btn-sm mt-4"
              >
                Retry Analysis
              </button>
            </div>
          )}

          {/* Loading State */}
          {varianceLoading && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Calculating Variances</h3>
              <p className="text-gray-600">
                Analyzing {selectedStatement.replace('_', ' ')} for period {selectedPeriod}...
              </p>
            </div>
          )}

          {/* Variance Table */}
          {!varianceLoading && hasVarianceData && (
            <VarianceTable
              variances={currentVariances}
              statementType={selectedStatement}
              period={selectedPeriod}
              onDrillDown={handleDrillDown}
            />
          )}

          {/* No Data State */}
          {!varianceLoading && !varianceError && !hasVarianceData && selectedPeriod && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Variance Data</h3>
              <p className="text-gray-600">
                No variance data found for {selectedStatement.replace('_', ' ')} in period {selectedPeriod}.
              </p>
              <div className="mt-4 space-x-3">
                <button
                  onClick={() => setSelectedStatement(Object.keys(periodsData?.selected_sheets || {})[0] || 'income_statement')}
                  className="btn btn-outline btn-sm"
                >
                  Try Different Statement
                </button>
                <button
                  onClick={handleRefresh}
                  className="btn btn-primary btn-sm"
                >
                  Refresh Analysis
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Drill-Down Modal */}
      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={closeDrillDownModal}
        result={drillDownModal.result}
        metadata={drillDownModal.metadata}
        loading={drillDownModal.loading}
        error={drillDownModal.error}
      />
    </div>
  )
}