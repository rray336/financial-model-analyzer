import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { analysisAPI } from '../../services/api'
// import { ExecutiveSummaryCard } from './ExecutiveSummaryCard'
import { TempExecutiveSummary } from './TempExecutiveSummary'
import { PeriodSelector } from './PeriodSelector'
import { BreadcrumbNavigation } from '../navigation/BreadcrumbNavigation'
import { TreeViewToggle } from '../navigation/TreeViewToggle'

export const VarianceDashboard: React.FC = () => {
  const { sessionId, '*': hierarchyPath } = useParams()
  const [treeViewActive, setTreeViewActive] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  
  if (!sessionId) {
    return <div>Session not found</div>
  }

  const currentPath = hierarchyPath ? hierarchyPath.split('/') : []

  const { data: structureData, isLoading: structureLoading } = useQuery({
    queryKey: ['structure', sessionId],
    queryFn: () => analysisAPI.getModelStructure(sessionId)
  })

  const { data: varianceData, isLoading: varianceLoading } = useQuery({
    queryKey: ['variance', sessionId, hierarchyPath, selectedPeriod],
    queryFn: () => 
      hierarchyPath 
        ? analysisAPI.getVarianceDetail(sessionId, hierarchyPath)
        : analysisAPI.getExecutiveSummary(sessionId, selectedPeriod || undefined)
  })

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    // The query will automatically re-run due to the updated queryKey
  }

  const handleNavigate = (path: string[]) => {
    const newPath = path.length > 0 ? path.join('/') : ''
    window.history.pushState({}, '', `/analysis/${sessionId}/${newPath}`)
    window.location.reload() // Temporary - will use proper routing
  }

  const toggleTreeView = () => {
    setTreeViewActive(!treeViewActive)
  }

  if (structureLoading || varianceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const isExecutiveView = currentPath.length === 0

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <BreadcrumbNavigation
              currentPath={currentPath}
              hierarchyTree={structureData?.hierarchy_tree}
              onNavigate={handleNavigate}
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/'}
              className="btn btn-secondary"
            >
              New Analysis
            </button>
            <button
              onClick={toggleTreeView}
              className={`btn ${treeViewActive ? 'btn-primary' : 'btn-outline'}`}
            >
              {treeViewActive ? 'Focus View' : 'Tree View'}
            </button>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="border-t pt-4">
          <PeriodSelector 
            sessionId={sessionId}
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        {treeViewActive && (
          <div className="lg:col-span-1">
            <TreeViewToggle
              hierarchyTree={structureData?.hierarchy_tree}
              currentPath={currentPath}
              onNavigate={handleNavigate}
              isTreeViewActive={treeViewActive}
              onToggle={toggleTreeView}
            />
          </div>
        )}

        {/* Main Analysis Panel */}
        <div className={`${treeViewActive ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {isExecutiveView ? (
            <TempExecutiveSummary 
              data={varianceData}
              sessionId={sessionId}
            />
          ) : (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {currentPath[currentPath.length - 1]} Analysis
              </h2>
              
              {varianceData?.variance_detail && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Old Value</p>
                      <p className="text-2xl font-bold">
                        ${varianceData.variance_detail.old_value.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">New Value</p>
                      <p className="text-2xl font-bold">
                        ${varianceData.variance_detail.new_value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">Variance</p>
                    <p className={`text-xl font-bold ${
                      varianceData.variance_detail.absolute_variance >= 0 ? 
                      'text-success-600' : 'text-danger-600'
                    }`}>
                      ${varianceData.variance_detail.absolute_variance.toLocaleString()} 
                      ({varianceData.variance_detail.percentage_variance.toFixed(1)}%)
                    </p>
                  </div>

                  {/* Drill Down Options */}
                  {!varianceData.variance_detail.is_leaf_node && 
                   varianceData.variance_detail.drill_down_options.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-900 mb-3">Drill Down:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {varianceData.variance_detail.drill_down_options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleNavigate([...currentPath, option.toLowerCase().replace(' ', '_')])}
                            className="btn-outline text-left p-3 hover:bg-primary-50"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Commentary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Commentary</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Analysis insights will appear here in Phase 6 when AI integration is complete.</p>
              <p>This will include:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Key variance drivers</li>
                <li>Business context</li>
                <li>Recommended investigations</li>
                <li>Cross-references to related items</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}