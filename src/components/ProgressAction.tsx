'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface ProgressActionProps {
  isVisible: boolean
  title: string
  items: string[]
  onClose: () => void
  onAction: (itemId: string) => Promise<{ success: boolean; message?: string }>
}

export default function ProgressAction({
  isVisible,
  title,
  items,
  onClose,
  onAction
}: ProgressActionProps) {
  const [progress, setProgress] = useState<{
    [key: string]: 'pending' | 'processing' | 'success' | 'error'
  }>({})
  const [results, setResults] = useState<{
    [key: string]: string
  }>({})
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isVisible && items.length > 0) {
      // Initialize progress state
      const initialProgress: { [key: string]: 'pending' } = {}
      items.forEach(item => {
        initialProgress[item] = 'pending'
      })
      setProgress(initialProgress)
      setResults({})
      
      // Start processing
      processItems()
    }
  }, [isVisible, items])

  const processItems = async () => {
    setIsProcessing(true)
    
    for (const itemId of items) {
      setProgress(prev => ({ ...prev, [itemId]: 'processing' }))
      
      try {
        const result = await onAction(itemId)
        
        setProgress(prev => ({ 
          ...prev, 
          [itemId]: result.success ? 'success' : 'error' 
        }))
        
        if (result.message) {
          setResults(prev => ({ ...prev, [itemId]: result.message! }))
        }
        
        // Small delay between items
        await new Promise(resolve => setTimeout(resolve, 300))
        
      } catch (error) {
        setProgress(prev => ({ ...prev, [itemId]: 'error' }))
        setResults(prev => ({ 
          ...prev, 
          [itemId]: error instanceof Error ? error.message : 'Unknown error' 
        }))
      }
    }
    
    setIsProcessing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
    }
  }

  const completedCount = Object.values(progress).filter(
    status => status === 'success' || status === 'error'
  ).length

  const successCount = Object.values(progress).filter(
    status => status === 'success'
  ).length

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Tiến độ</span>
              <span>{completedCount}/{items.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / items.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {items.map((itemId, index) => (
              <div
                key={itemId}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
              >
                <div className="flex items-center">
                  {getStatusIcon(progress[itemId] || 'pending')}
                  <span className="ml-2 text-sm text-gray-700">
                    Item {index + 1}
                  </span>
                </div>
                
                {results[itemId] && (
                  <span className={`text-xs ${
                    progress[itemId] === 'success' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {results[itemId]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {!isProcessing && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Hoàn thành: {successCount}/{items.length} thành công
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
