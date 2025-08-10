import React, { useState, useCallback } from 'react'
import { Upload, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react'
import { analysisAPI } from '../../services/api'
import type { FileUploadState } from '../../services/types'

interface DualFileUploadProps {
  onUploadComplete: (sessionId: string) => void
}

export const DualFileUpload: React.FC<DualFileUploadProps> = ({ onUploadComplete }) => {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    oldFile: null,
    newFile: null,
    uploading: false,
    error: null,
    progress: 0
  })

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
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({ 
          ...prev, 
          progress: Math.min(prev.progress + Math.random() * 20, 90) 
        }))
      }, 500)

      const response = await analysisAPI.uploadModelPair(uploadState.oldFile, uploadState.newFile)
      
      clearInterval(progressInterval)
      setUploadState(prev => ({ ...prev, progress: 100 }))
      
      // Start processing
      await analysisAPI.processModels(response.session_id)
      
      setTimeout(() => {
        onUploadComplete(response.session_id)
      }, 1000)

    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        error: error instanceof Error ? error.message : 'Upload failed',
        progress: 0
      }))
    }
  }

  const FileUploadZone = ({ 
    file, 
    label, 
    description,
    onClick,
    inputId,
    onChange
  }: { 
    file: File | null, 
    label: string, 
    description: string,
    onClick: () => void,
    inputId: string,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  }) => (
    <div
      onClick={onClick}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${file ? 'border-success-400 bg-success-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
      `}
    >
      <input
        id={inputId}
        type="file"
        accept=".xlsx,.xls"
        onChange={onChange}
        style={{ display: 'none' }}
      />
      
      <div className="space-y-4">
        {file ? (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-success-500" />
            <div>
              <p className="text-lg font-medium text-success-700">{label}</p>
              <p className="text-sm text-gray-600 mt-1">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">{label}</p>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
              <p className="text-xs text-gray-400 mt-2">
                Click to select (.xlsx, .xls)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUploadZone
          file={uploadState.oldFile}
          label="Old Model"
          description="Upload your baseline financial model"
          onClick={triggerOldFileSelect}
          inputId="old-file-input"
          onChange={handleOldFileChange}
        />
        
        <FileUploadZone
          file={uploadState.newFile}
          label="New Model"
          description="Upload your updated financial model"
          onClick={triggerNewFileSelect}
          inputId="new-file-input"
          onChange={handleNewFileChange}
        />
      </div>

      {uploadState.error && (
        <div className="flex items-center space-x-2 p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-danger-500" />
          <p className="text-danger-700">{uploadState.error}</p>
        </div>
      )}

      {uploadState.uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Processing files...</span>
            <span className="text-gray-600">{Math.round(uploadState.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleUpload}
          disabled={!uploadState.oldFile || !uploadState.newFile || uploadState.uploading}
          className="btn-primary flex items-center space-x-2 px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="h-5 w-5" />
          <span>{uploadState.uploading ? 'Processing...' : 'Analyze Models'}</span>
        </button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Your files are processed locally and never stored in the cloud</p>
      </div>
    </div>
  )
}