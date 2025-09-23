'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const runMigration = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/images/migrate', {
        method: 'POST'
      })
      
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Admin Panel - Database Migration
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Xóa dữ liệu ảnh cũ
          </h2>
          
          <p className="text-gray-600 mb-6">
            Xóa tất cả ảnh có path cũ (không phải GitHub URL) để tránh lỗi hiển thị.
          </p>
          
          <button
            onClick={runMigration}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium"
          >
            {loading ? 'Đang xử lý...' : 'Chạy Migration'}
          </button>
          
          {result && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Kết quả:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
