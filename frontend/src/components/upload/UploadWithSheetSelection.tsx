import React, { useState, useCallback } from 'react'
import { Upload, AlertCircle, CheckCircle, FileSpreadsheet, ArrowRight } from 'lucide-react'
import { analysisAPI } from '../../services/api'
import { SheetSelector } from './SheetSelector'
import type { FileUploadState } from '../../services/types'

interface UploadWithSheetSelectionProps {
  onComplete: (sessionId: string, sheets: SelectedSheets) => void
}

interface SelectedSheets {
  incomeStatement: string
  balanceSheet: string
  cashFlow: string
}

export const UploadWithSheetSelection: React.FC<UploadWithSheetSelectionProps> = ({ onComplete }) => {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    oldFile: null,
    newFile: null,
    uploading: false,
    error: null,
    progress: 0
  })

  const [currentStep, setCurrentStep] = useState<'upload' | 'sheets'>('upload')
  const [sessionId, setSessionId] = useState<string>('')
  const [availableSheets, setAvailableSheets] = useState<{
    oldModelSheets: string[]
    newModelSheets: string[]
  }>({ oldModelSheets: [], newModelSheets: [] })

  const handleOldFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadState(prev => ({ ...prev, oldFile: file, error: null }))
    }
  }, [])

  const handleNewFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadState(prev => ({ ...prev, newFile: file, error: null }))
    }
  }, [])

  const triggerOldFileSelect = () => {
    const input = document.getElementById('old-file-input') as HTMLInputElement
    input?.click()
  }

  const triggerNewFileSelect = () => {
    const input = document.getElementById('new-file-input') as HTMLInputElement
    input?.click()
  }

  const handleUpload = async () => {
    if (!uploadState.oldFile || !uploadState.newFile) {
      setUploadState(prev => ({ ...prev, error: 'Please select both old and new model files' }))
      return
    }

    setUploadState(prev => ({ ...prev, uploading: true, error: null, progress: 0 }))

    try {
      // Upload files
      setUploadState(prev => ({ ...prev, progress: 25 }))
      const uploadResponse = await analysisAPI.uploadModelPair(uploadState.oldFile, uploadState.newFile)
      
      // Get available sheets
      setUploadState(prev => ({ ...prev, progress: 75 }))
      const sheetsResponse = await analysisAPI.getAvailableSheets(uploadResponse.session_id)
      
      setUploadState(prev => ({ ...prev, progress: 100, uploading: false }))
      setSessionId(uploadResponse.session_id)
      setAvailableSheets({
        oldModelSheets: sheetsResponse.old_model_sheets,
        newModelSheets: sheetsResponse.new_model_sheets
      })
      
      // Move to sheet selection step
      setCurrentStep('sheets')
      
    } catch (error: any) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error.response?.data?.detail || 'Upload failed'
      }))
    }
  }

  const handleSheetsSelected = async (sheets: SelectedSheets) => {
    try {
      // Send sheet selection to backend and get periods
      const response = await analysisAPI.selectSheets(sessionId, {
        income_statement: sheets.incomeStatement,
        balance_sheet: sheets.balanceSheet,
        cash_flow: sheets.cashFlow
      })
      
      console.log('Sheet selection completed:', response)
      // Don't automatically proceed - wait for user to click Continue
      
    } catch (error: any) {
      console.error('Failed to select sheets:', error)
      // Could show error to user here
    }
  }

  const handleCompleteSheetSelection = () => {
    // Proceed to analysis dashboard
    onComplete(sessionId, {} as SelectedSheets)  // The backend already has the sheet selection
  }

  const resetUpload = () => {
    setUploadState({
      oldFile: null,
      newFile: null,
      uploading: false,
      error: null,
      progress: 0
    })
    setCurrentStep('upload')
    setSessionId('')
    setAvailableSheets({ oldModelSheets: [], newModelSheets: [] })
  }

  const canUpload = uploadState.oldFile && uploadState.newFile && !uploadState.uploading

  if (currentStep === 'sheets') {
    return (
      <div className="space-y-6">
        {/* Progress Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Step 2: Select Financial Statements</h2>
              <p className="text-sm text-gray-600 mt-1">
                Files uploaded successfully. Now select which sheets contain your financial statements.
              </p>
            </div>
            <button
              onClick={resetUpload}
              className="btn btn-outline text-sm"
            >
              Upload Different Files
            </button>
          </div>
          
          {/* File Info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Old Model: {uploadState.oldFile?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>New Model: {uploadState.newFile?.name}</span>
            </div>
          </div>
        </div>

        {/* Sheet Selection */}
        <SheetSelector
          sessionId={sessionId}
          availableSheets={availableSheets}
          onSheetsSelected={handleSheetsSelected}
          onCompleteSheetSelection={handleCompleteSheetSelection}
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Upload Excel Models for Comparison</h2>
        <p className="text-gray-600 mt-2">
          Upload your old and new Excel financial models to begin variance analysis
        </p>
      </div>

      {/* Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Old Model Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
            Old Model (Baseline)
          </h3>
          
          <div
            onClick={triggerOldFileSelect}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              uploadState.oldFile 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input
              id="old-file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleOldFileChange}
              className="hidden"
            />
            
            {uploadState.oldFile ? (
              <div className="space-y-2">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <p className="text-sm font-medium text-green-900">{uploadState.oldFile.name}</p>
                <p className="text-xs text-green-700">
                  {(uploadState.oldFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">Choose Old Model</p>
                <p className="text-xs text-gray-500">Excel files (.xlsx, .xls)</p>
              </div>
            )}
          </div>
        </div>

        {/* New Model Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
            New Model (Comparison)
          </h3>
          
          <div
            onClick={triggerNewFileSelect}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              uploadState.newFile 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input
              id="new-file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleNewFileChange}
              className="hidden"
            />
            
            {uploadState.newFile ? (
              <div className="space-y-2">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <p className="text-sm font-medium text-green-900">{uploadState.newFile.name}</p>
                <p className="text-xs text-green-700">
                  {(uploadState.newFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">Choose New Model</p>
                <p className="text-xs text-gray-500">Excel files (.xlsx, .xls)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {uploadState.uploading && (
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {uploadState.progress < 50 ? 'Uploading files...' : 'Reading sheet information...'}
          </p>
        </div>
      )}

      {/* Error Message */}
      {uploadState.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-900">{uploadState.error}</p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="text-center">
        <button
          onClick={handleUpload}
          disabled={!canUpload}
          className={`btn btn-primary btn-lg ${!canUpload ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploadState.uploading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Uploading...
            </div>
          ) : (
            <div className="flex items-center">
              Upload & Continue
              <ArrowRight className="h-5 w-5 ml-2" />
            </div>
          )}
        </button>
      </div>

      {/* Requirements Note */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Both files should have similar financial statement structure for accurate comparison</p>
      </div>
    </div>
  )
}