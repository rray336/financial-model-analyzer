import axios from 'axios'
import type {
  SessionResponse,
  UploadStatus,
  StructureResponse,
  VarianceResponse,
  PeriodAnalysisResponse
} from './types'

const API_BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export class AnalysisAPI {
  async uploadModelPair(oldFile: File, newFile: File): Promise<SessionResponse> {
    const formData = new FormData()
    formData.append('old_file', oldFile)
    formData.append('new_file', newFile)

    const response = await api.post('/upload-models', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  async processModels(sessionId: string): Promise<void> {
    await api.post(`/process-models/${sessionId}`)
  }

  async getSessionStatus(sessionId: string): Promise<UploadStatus> {
    const response = await api.get(`/session/${sessionId}/status`)
    return response.data
  }

  async getAvailableSheets(sessionId: string): Promise<{
    session_id: string
    old_model_sheets: string[]
    new_model_sheets: string[]
    common_sheets: string[]
  }> {
    const response = await api.get(`/session/${sessionId}/sheets`)
    return response.data
  }

  async selectSheets(sessionId: string, sheetSelection: {
    income_statement?: string
    balance_sheet?: string
    cash_flow?: string
  }): Promise<{
    session_id: string
    selected_sheets: any
    period_analysis: {
      total_periods: number
      annual_periods: string[]
      quarterly_periods: string[]
      other_periods: string[]
      suggested_templates: Array<{
        name: string
        pattern: string
        example: string
        description: string
      }>
    }
    periods_need_review: boolean
    status: string
  }> {
    const response = await api.post(`/session/${sessionId}/select-sheets`, sheetSelection)
    return response.data
  }

  async approvePeriods(sessionId: string, approval: {
    approved: boolean
    custom_templates?: Array<{
      name: string
      pattern: string
      example: string
      description: string
      type: string
    }>
  }): Promise<{
    session_id: string
    status: string
    available_periods: string[]
    total_periods: number
    enhancement_details?: any
    templates_used?: number
  }> {
    const response = await api.post(`/session/${sessionId}/approve-periods`, approval)
    return response.data
  }

  async getTemplateHints(sessionId: string): Promise<{
    session_id: string
    template_hints: {
      placeholders: Record<string, string>
      examples: Array<{
        pattern: string
        description: string
        generates: string[]
      }>
      tips: string[]
    }
  }> {
    const response = await api.get(`/session/${sessionId}/template-hints`)
    return response.data
  }

  async getPeriodsFromSheets(sessionId: string): Promise<{
    session_id: string
    available_periods: string[]
    selected_sheets: any
    default_period: string | null
  }> {
    const response = await api.get(`/session/${sessionId}/periods`)
    return response.data
  }

  async getModelStructure(sessionId: string): Promise<StructureResponse> {
    const response = await api.get(`/structure/${sessionId}`)
    return response.data
  }

  async getExecutiveSummary(sessionId: string, period?: string): Promise<VarianceResponse> {
    const params = period ? { period } : {}
    const response = await api.get(`/variance/${sessionId}`, { params })
    return response.data
  }

  async getVarianceDetail(sessionId: string, hierarchyPath: string): Promise<VarianceResponse> {
    const encodedPath = encodeURIComponent(hierarchyPath)
    const response = await api.get(`/variance/${sessionId}/${encodedPath}`)
    return response.data
  }

  async getPeriodAnalysis(sessionId: string): Promise<PeriodAnalysisResponse> {
    const response = await api.get(`/periods/${sessionId}`)
    return response.data
  }

  async exportExecutiveSummary(sessionId: string): Promise<any> {
    const response = await api.get(`/export/${sessionId}/summary`)
    return response.data
  }

  async exportHierarchyTree(sessionId: string): Promise<any> {
    const response = await api.get(`/export/${sessionId}/hierarchy`)
    return response.data
  }

  async exportVarianceData(sessionId: string): Promise<any> {
    const response = await api.get(`/export/${sessionId}/variances`)
    return response.data
  }

  async drillDownLineItem(sessionId: string, request: {
    statement_type: string
    line_item_name: string
    period: string
  }): Promise<any> {
    const response = await api.post(`/drill-down/${sessionId}`, request)
    return response.data
  }

  async getDrillDownPreview(sessionId: string, statementType: string, lineItemName: string): Promise<any> {
    const params = new URLSearchParams({
      statement_type: statementType,
      line_item_name: lineItemName
    })
    const response = await api.get(`/drill-down-preview/${sessionId}?${params}`)
    return response.data
  }
}

export const analysisAPI = new AnalysisAPI()