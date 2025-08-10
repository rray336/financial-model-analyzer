import React, { useState, useEffect } from 'react'
// import { analysisAPI } from '../../services/api'

export const DebugUpload: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>('Testing...')
  const [backendHealth, setBackendHealth] = useState<any>(null)

  useEffect(() => {
    // Test backend connection
    const testConnection = async () => {
      try {
        const response = await fetch('/api/v1/')
        if (response.ok) {
          const data = await response.json()
          setBackendHealth(data)
          setApiStatus('✅ Backend Connected')
        } else {
          setApiStatus(`❌ Backend Error: ${response.status}`)
        }
      } catch (error) {
        setApiStatus(`❌ Connection Failed: ${error}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
      
      <div className="space-y-2">
        <div>
          <strong>API Status:</strong> {apiStatus}
        </div>
        
        {backendHealth && (
          <div>
            <strong>Backend Response:</strong>
            <pre className="bg-gray-100 p-2 rounded text-sm mt-1">
              {JSON.stringify(backendHealth, null, 2)}
            </pre>
          </div>
        )}
        
        <div>
          <strong>Frontend URL:</strong> {window.location.origin}
        </div>
        
        <div>
          <strong>Expected Backend:</strong> http://localhost:8000
        </div>
        
        <div>
          <strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...
        </div>
      </div>
    </div>
  )
}