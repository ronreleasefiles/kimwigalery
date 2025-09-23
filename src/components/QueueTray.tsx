'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock, 
  X, 
  ChevronUp, 
  ChevronDown,
  Trash2,
  Upload,
  Eye,
  FolderOpen
} from 'lucide-react'
import { useQueue, QueueTask } from '@/contexts/QueueContext'

export default function QueueTray() {
  const { 
    tasks, 
    removeTask, 
    clearCompleted, 
    isProcessing, 
    totalTasks, 
    completedTasks, 
    failedTasks 
  } = useQueue()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Auto show/hide tray based on tasks
  useEffect(() => {
    if (totalTasks > 0) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
      setIsExpanded(false)
    }
  }, [totalTasks])

  // Auto expand when processing
  useEffect(() => {
    if (isProcessing) {
      setIsExpanded(true)
    }
  }, [isProcessing])

  const getTaskIcon = (task: QueueTask) => {
    switch (task.type) {
      case 'upload':
        return <Upload className="w-4 h-4" />
      case 'delete':
        return <Trash2 className="w-4 h-4" />
      case 'toggle-public':
        return <Eye className="w-4 h-4" />
      case 'move-folder':
        return <FolderOpen className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: QueueTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusText = (status: QueueTask['status']) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ'
      case 'processing':
        return 'Đang xử lý'
      case 'completed':
        return 'Hoàn thành'
      case 'failed':
        return 'Thất bại'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.round(seconds % 60)
      return `${minutes}m ${remainingSeconds}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h ${minutes}m`
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-80 max-w-96">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-t-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {totalTasks}
                </span>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Hàng đợi tác vụ
              </h3>
              <p className="text-xs text-gray-500">
                {completedTasks}/{totalTasks} hoàn thành
                {failedTasks > 0 && `, ${failedTasks} thất bại`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {(completedTasks > 0 || failedTasks > 0) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  clearCompleted()
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Xóa tác vụ đã hoàn thành"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className="px-3 pb-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Task list */}
        {isExpanded && (
          <div className="border-t border-gray-200 max-h-64 overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Không có tác vụ nào
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <div key={task.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-0.5">
                          {getTaskIcon(task)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </p>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusIcon(task.status)}
                            <span className="text-xs text-gray-500">
                              {getStatusText(task.status)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTime(task.createdAt)}
                            </span>
                          </div>

                          {task.status === 'processing' && task.progress !== undefined && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500">
                                  {task.progress}%
                                </span>
                                <div className="flex items-center space-x-2">
                                  {task.title.includes('chunks') && (
                                    <span className="text-xs text-blue-600 font-medium">
                                      Chunked Upload
                                    </span>
                                  )}
                                  {task.startedAt && task.progress > 0 && (
                                    <span className="text-xs text-gray-400">
                                      {(() => {
                                        const elapsed = (Date.now() - task.startedAt.getTime()) / 1000
                                        const speed = task.progress / elapsed
                                        return `${speed.toFixed(1)}%/s`
                                      })()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    task.title.includes('chunks') 
                                      ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                                      : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${Math.max(task.progress, 2)}%` }}
                                />
                              </div>
                              {task.title.includes('Chunk') && (
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                  <span>
                                    {task.currentChunk && task.totalChunks 
                                      ? `Chunk ${task.currentChunk}/${task.totalChunks}`
                                      : task.title.split('(')[1]?.split(')')[0] || 'Processing...'
                                    }
                                  </span>
                                  {task.estimatedTimeRemaining && task.estimatedTimeRemaining > 0 && (
                                    <span className="text-blue-600 font-medium">
                                      ~{formatDuration(task.estimatedTimeRemaining)} còn lại
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {task.error && (
                            <p className="text-xs text-red-600 mt-1 truncate">
                              {task.error}
                            </p>
                          )}
                        </div>
                      </div>

                      {(task.status === 'completed' || task.status === 'failed') && (
                        <button
                          onClick={() => removeTask(task.id)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded ml-2"
                          title="Xóa tác vụ"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
