import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { UploadWithSheetSelection } from './components/upload/UploadWithSheetSelection'
import { VarianceAnalysisDashboard } from './components/variance/VarianceAnalysisDashboard'

function App() {
  const [currentSession, setCurrentSession] = useState<string | null>(null)

  const handleUploadComplete = (sessionId: string, sheets: any) => {
    console.log('Upload complete:', { sessionId, sheets })
    setCurrentSession(sessionId)
  }

  const handleNewAnalysis = () => {
    setCurrentSession(null)
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Financial Model Analyzer
                </h1>
              </div>
              {currentSession && (
                <button
                  onClick={handleNewAnalysis}
                  className="btn-outline"
                >
                  New Analysis
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                currentSession ? (
                  <Navigate to={`/analysis/${currentSession}`} replace />
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Universal Financial Model Analyzer
                      </h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Upload any two Excel financial models to analyze variances 
                        across Income Statement, Balance Sheet, and Cash Flow. 
                        Select your sheets, choose periods, and drill down through 
                        formula-based dependencies.
                      </p>
                    </div>
                    
                    <UploadWithSheetSelection onComplete={handleUploadComplete} />
                  </div>
                )
              } 
            />
            <Route 
              path="/analysis/:sessionId/*" 
              element={<VarianceAnalysisDashboard />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App