import React from 'react'
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import type { ExecutiveSummary } from '../../services/types'

interface ExecutiveSummaryCardProps {
  executiveSummary?: ExecutiveSummary
  sessionId: string
  onDrillDown: (path: string[]) => void
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({
  executiveSummary,
  onDrillDown
}) => {
  if (!executiveSummary) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const VarianceCard = ({ 
    title, 
    variance, 
    onClick 
  }: { 
    title: string, 
    variance: any, 
    onClick?: () => void 
  }) => {
    const isPositive = variance.absolute_variance >= 0
    
    return (
      <div 
        className={`p-4 rounded-lg border ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{title}</h4>
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-success-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-danger-500" />
          )}
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Old:</span>
            <span className="font-medium">${variance.old_value.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">New:</span>
            <span className="font-medium">${variance.new_value.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm pt-1 border-t">
            <span className="text-gray-600">Variance:</span>
            <span className={`font-bold ${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
              ${variance.absolute_variance.toLocaleString()} ({variance.percentage_variance.toFixed(1)}%)
            </span>
          </div>
        </div>
        
        {onClick && (
          <div className="mt-2 text-xs text-primary-600">
            Click to drill down →
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="h-6 w-6 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
        </div>
        
        <div className="text-gray-600">
          <p>Comprehensive variance analysis comparing your financial models.</p>
          <p className="text-sm mt-1">Click on any KPI below to explore detailed drivers.</p>
        </div>
      </div>

      {/* KPI Variance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <VarianceCard
          title="Total Revenue"
          variance={executiveSummary.total_revenue_variance}
          onClick={() => onDrillDown(['revenue'])}
        />
        
        <VarianceCard
          title="Operating Profit"
          variance={executiveSummary.operating_profit_variance}
          onClick={() => onDrillDown(['operating_profit'])}
        />
        
        {executiveSummary.ebitda_variance && (
          <VarianceCard
            title="EBITDA"
            variance={executiveSummary.ebitda_variance}
            onClick={() => onDrillDown(['ebitda'])}
          />
        )}
        
        {executiveSummary.eps_variance && (
          <VarianceCard
            title="EPS"
            variance={executiveSummary.eps_variance}
            onClick={() => onDrillDown(['eps'])}
          />
        )}
        
        {executiveSummary.cash_flow_variance && (
          <VarianceCard
            title="Cash Flow"
            variance={executiveSummary.cash_flow_variance}
            onClick={() => onDrillDown(['cash_flow'])}
          />
        )}
      </div>

      {/* Key Insights */}
      {executiveSummary.key_insights && executiveSummary.key_insights.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <ul className="space-y-2">
            {executiveSummary.key_insights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">{insight}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}