'use client'

import { useState } from 'react'

export default function TestUploadPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testGitHubToken = async () => {
    setLoading(true)
    setResult('')
    
    try {
      // Test với một file nhỏ
      const testContent = 'Hello World Test'
      const blob = new Blob([testContent], { type: 'text/plain' })
      const file = new File([blob], 'test.txt', { type: 'text/plain' })
      
      const formData = new FormData()
      formData.append('files', file)
      formData.append('isPublic', 'true')
      
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const checkEnv = async () => {
    try {
      const response = await fetch('/api/test-env')
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Test Upload & GitHub
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <button
            onClick={checkEnv}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium mr-4"
          >
            Check Environment
          </button>
          
          <button
            onClick={testGitHubToken}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium"
          >
            {loading ? 'Testing...' : 'Test GitHub Upload'}
          </button>
          
          {result && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
