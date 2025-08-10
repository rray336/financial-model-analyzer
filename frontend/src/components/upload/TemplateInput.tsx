import React, { useState, useEffect } from 'react'
import { Plus, X, HelpCircle, CheckCircle, ArrowLeft, Lightbulb } from 'lucide-react'
import { analysisAPI } from '../../services/api'

interface TemplateInputProps {
  sessionId: string
  suggestedTemplates: Array<{
    name: string
    pattern: string
    example: string
    description: string
  }>
  onBack: () => void
  onSubmit: (templates: CustomTemplate[]) => void
}

interface CustomTemplate {
  name: string
  pattern: string
  example: string
  description: string
  type: 'quarterly' | 'annual'
}

interface TemplateHints {
  placeholders: Record<string, string>
  examples: Array<{
    pattern: string
    description: string
    generates: string[]
  }>
  tips: string[]
}

export const TemplateInput: React.FC<TemplateInputProps> = ({
  sessionId,
  suggestedTemplates,
  onBack,
  onSubmit
}) => {
  const [templates, setTemplates] = useState<CustomTemplate[]>([])
  const [hints, setHints] = useState<TemplateHints | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)

  // Load template hints on component mount
  useEffect(() => {
    const loadHints = async () => {
      try {
        const response = await analysisAPI.getTemplateHints(sessionId)
        setHints(response.template_hints)
      } catch (error) {
        console.error('Failed to load template hints:', error)
      }
    }
    
    loadHints()
  }, [sessionId])

  // Initialize with suggested templates
  useEffect(() => {
    if (suggestedTemplates.length > 0 && templates.length === 0) {
      const initialTemplates = suggestedTemplates.map(suggestion => ({
        ...suggestion,
        type: suggestion.pattern.includes('Q') ? 'quarterly' as const : 'annual' as const
      }))
      setTemplates(initialTemplates)
    }
  }, [suggestedTemplates, templates.length])

  const addNewTemplate = () => {
    setTemplates([...templates, {
      name: '',
      pattern: '',
      example: '',
      description: '',
      type: 'quarterly'
    }])
  }

  const removeTemplate = (index: number) => {
    setTemplates(templates.filter((_, i) => i !== index))
    // Remove validation error for this index
    const newErrors = { ...validationErrors }
    delete newErrors[index]
    setValidationErrors(newErrors)
  }

  const updateTemplate = (index: number, field: keyof CustomTemplate, value: string) => {
    const updated = templates.map((template, i) => 
      i === index ? { ...template, [field]: value } : template
    )
    setTemplates(updated)
    
    // Clear validation error for this field
    if (validationErrors[index]) {
      const newErrors = { ...validationErrors }
      delete newErrors[index]
      setValidationErrors(newErrors)
    }
  }

  const validateTemplates = (): boolean => {
    const errors: Record<number, string> = {}
    
    templates.forEach((template, index) => {
      if (!template.name.trim()) {
        errors[index] = 'Template name is required'
      } else if (!template.pattern.trim()) {
        errors[index] = 'Template pattern is required'
      } else if (!template.pattern.includes('{')) {
        errors[index] = 'Pattern must include placeholders like {Q} or {YYYY}'
      }
    })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateTemplates()) {
      return
    }
    
    if (templates.length === 0) {
      setValidationErrors({ 0: 'At least one template is required' })
      return
    }

    setLoading(true)
    try {
      onSubmit(templates)
    } catch (error) {
      console.error('Failed to submit templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const insertPlaceholder = (index: number, placeholder: string) => {
    const template = templates[index]
    const newPattern = template.pattern + placeholder
    updateTemplate(index, 'pattern', newPattern)
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Custom Period Templates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Define templates to find additional periods in your financial statements
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowHints(!showHints)}
          className="btn btn-outline btn-sm flex items-center"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          {showHints ? 'Hide' : 'Show'} Hints
        </button>
      </div>

      {/* Hints Panel */}
      {showHints && hints && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-blue-900">Template Creation Guide</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Placeholders */}
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">Available Placeholders:</h4>
              <div className="space-y-1">
                {Object.entries(hints.placeholders).map(([placeholder, description]) => (
                  <div key={placeholder} className="text-xs">
                    <code className="bg-blue-100 text-blue-800 px-1 rounded">{placeholder}</code>
                    <span className="text-blue-700 ml-2">{description}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Examples */}
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">Pattern Examples:</h4>
              <div className="space-y-2">
                {hints.examples.slice(0, 3).map((example, index) => (
                  <div key={index} className="text-xs">
                    <code className="bg-blue-100 text-blue-800 px-1 rounded">{example.pattern}</code>
                    <div className="text-blue-700 mt-1">{example.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tips */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Tips:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              {hints.tips.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Templates */}
      <div className="space-y-4 mb-6">
        {templates.map((template, index) => (
          <div key={index} className={`p-4 border rounded-lg ${
            validationErrors[index] ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Template {index + 1}</h3>
              <button
                onClick={() => removeTemplate(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => updateTemplate(index, 'name', e.target.value)}
                  placeholder="e.g., Quarterly Format"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={template.type}
                  onChange={(e) => updateTemplate(index, 'type', e.target.value as 'quarterly' | 'annual')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pattern
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={template.pattern}
                  onChange={(e) => updateTemplate(index, 'pattern', e.target.value)}
                  placeholder="e.g., FY{Q}Q{YY}[E]"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm font-mono"
                />
                {hints && (
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          insertPlaceholder(index, e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className="px-3 py-2 border-l-0 border border-gray-300 rounded-r-md text-sm bg-gray-50"
                    >
                      <option value="">+ Add</option>
                      {Object.keys(hints.placeholders).map(placeholder => (
                        <option key={placeholder} value={placeholder}>{placeholder}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Example
                </label>
                <input
                  type="text"
                  value={template.example}
                  onChange={(e) => updateTemplate(index, 'example', e.target.value)}
                  placeholder="e.g., FY1Q25, FY2Q25E"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={template.description}
                  onChange={(e) => updateTemplate(index, 'description', e.target.value)}
                  placeholder="Brief description of this format"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            
            {validationErrors[index] && (
              <div className="mt-2 text-sm text-red-600">
                {validationErrors[index]}
              </div>
            )}
          </div>
        ))}
        
        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No templates defined. Click "Add Template" to create your first template.</p>
          </div>
        )}
      </div>

      {/* Add Template Button */}
      <div className="mb-6">
        <button
          onClick={addNewTemplate}
          className="btn btn-outline btn-sm flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Templates will scan the entire Excel sheet for matching period patterns
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="btn btn-outline"
          >
            Back to Review
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || templates.length === 0}
            className="btn btn-primary flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Apply Templates
          </button>
        </div>
      </div>
    </div>
  )
}