// API Response Types
export interface SessionResponse {
  session_id: string
  status: string
  message: string
  processing_time_estimate?: number
}

export interface UploadStatus {
  session_id: string
  status: string
  old_filename: string
  new_filename: string
  created_at?: string
}

// Variance Analysis Types
export interface KPIVariance {
  kpi_name: string
  old_value: number
  new_value: number
  absolute_variance: number
  percentage_variance: number
  significance_level: 'low' | 'medium' | 'high' | 'critical'
  components?: VarianceComponent[]
}

export interface VarianceComponent {
  name: string
  old_value: number
  new_value: number
  absolute_variance: number
  percentage_variance: number
  contribution_to_total: number
}

export interface HierarchyVariance {
  hierarchy_path: string
  level_name: string
  parent_path: string[]
  children: string[]
  old_value: number
  new_value: number
  absolute_variance: number
  percentage_variance: number
  is_leaf_node: boolean
  significance_level: 'low' | 'medium' | 'high' | 'critical'
  drill_down_options: string[]
}

export interface ExecutiveSummary {
  total_revenue_variance?: KPIVariance
  operating_profit_variance?: KPIVariance
  ebitda_variance?: KPIVariance
  eps_variance?: KPIVariance
  cash_flow_variance?: KPIVariance
  key_insights: string[]
  variance_data?: {
    status: string
    period: string
    statements_analyzed: string[]
    variances: Record<string, Record<string, VarianceItem>>
    total_line_items: number
  }
}

export interface VarianceItem {
  line_item_name: string
  matched_with?: string
  old_value: number
  new_value: number
  absolute_variance: number
  percentage_variance: number
  has_formula: boolean
  drill_down_available: boolean
  row_index?: number  // Excel row number for tracing source data
  sheet_name?: string  // Sheet name for context
  format_type?: 'currency' | 'currency_precise' | 'percentage' | 'ratio' | 'count'  // How to display values
  is_key_item?: boolean  // Whether to highlight this item
}

// Navigation Types
export interface NavigationState {
  current_path: string[]
  breadcrumb_trail: BreadcrumbItem[]
  available_drill_downs: string[]
  is_leaf_node: boolean
  tree_view_active: boolean
}

export interface BreadcrumbItem {
  name: string
  path: string
}

export interface HierarchyTree {
  root_nodes: string[]
  node_relationships: Record<string, string[]>
  node_metadata: Record<string, any>
  navigation_paths: string[][]
  max_depth: number
  total_nodes: number
}

// Period Analysis Types
export interface PeriodMapping {
  aligned_periods: string[]
  projection_vs_actual_periods: string[]
  projection_vs_projection_periods: string[]
  alignment_quality_score: number
}

export interface ComparisonMode {
  mode: 'projection_vs_actual' | 'projection_vs_projection'
  description: string
  periods: string[]
}

// API Response Wrappers
export interface StructureResponse {
  session_id: string
  hierarchy_tree: HierarchyTree
  navigation_state: NavigationState
}

export interface VarianceResponse {
  session_id: string
  executive_summary?: ExecutiveSummary
  hierarchy_path?: string
  variance_detail?: HierarchyVariance
  navigation_state?: NavigationState
}

export interface PeriodAnalysisResponse {
  session_id: string
  period_mapping: PeriodMapping
  comparison_modes: ComparisonMode[]
}

// UI Component Types
export interface FileUploadState {
  oldFile: File | null
  newFile: File | null
  uploading: boolean
  error: string | null
  progress: number
}

export interface DashboardProps {
  sessionId: string
  hierarchyPath?: string
}