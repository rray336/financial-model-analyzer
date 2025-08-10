import React, { useState } from 'react'

export const TestDropzone: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      console.log('File selected:', file.name)
    }
  }

  const handleDivClick = () => {
    console.log('Div clicked!')
    const input = document.getElementById('test-file-input') as HTMLInputElement
    input?.click()
  }

  return (
    <div className="p-4 border-2 border-red-500">
      <h3 className="text-lg font-bold mb-4">Test File Upload (No react-dropzone)</h3>
      
      {/* Direct file input test */}
      <div className="mb-4">
        <label className="block mb-2">Direct file input:</label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="block"
        />
      </div>

      {/* Hidden input with div trigger */}
      <div className="mb-4">
        <label className="block mb-2">Hidden input triggered by div:</label>
        <div 
          onClick={handleDivClick}
          className="border-2 border-dashed border-gray-300 p-4 cursor-pointer hover:border-gray-400"
        >
          <p>Click here to select file</p>
          <input
            id="test-file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {selectedFile && (
        <div className="p-2 bg-green-100 border border-green-300 rounded">
          <p><strong>Selected:</strong> {selectedFile.name}</p>
          <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}
    </div>
  )
}