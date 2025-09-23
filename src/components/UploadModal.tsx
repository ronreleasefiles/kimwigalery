'use client'

import { useState, useRef } from 'react'
import { Upload, X, Check, AlertCircle, Play } from 'lucide-react'
import { useQueueOperations } from '@/hooks/useQueueOperations'
import { useModalAutoClose } from '@/hooks/useModalAutoClose'

interface UploadModalProps {
  folderId: string | null
  onClose: () => void
  onSuccess: () => void
}

export default function UploadModal({
  folderId,
  onClose,
  onSuccess
}: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Queue operations
  const { queueUpload } = useQueueOperations()
  
  // Auto close modal when upload task is queued
  useModalAutoClose(true, onClose, {
    taskTypes: ['upload'],
    delay: 300
  })

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv']
    const validTypes = [...validImageTypes, ...validVideoTypes]
    
    const maxImageSize = 10 * 1024 * 1024 // 10MB cho ảnh
    const maxVideoSize = 100 * 1024 * 1024 // 100MB cho video (sử dụng chunked upload)
    
    const validFiles: File[] = []
    const rejectedFiles: string[] = []

    for (const file of Array.from(selectedFiles)) {
      const isImage = validImageTypes.includes(file.type)
      const isVideo = validVideoTypes.includes(file.type)
      const maxSize = isVideo ? maxVideoSize : maxImageSize
      
      if (!validTypes.includes(file.type)) {
        rejectedFiles.push(`${file.name}: Định dạng không hỗ trợ`)
      } else if (file.size > maxSize) {
        const maxSizeMB = isVideo ? 100 : 10
        rejectedFiles.push(`${file.name}: Quá lớn (tối đa ${maxSizeMB}MB)`)
      } else {
        validFiles.push(file)
      }
    }

    if (rejectedFiles.length > 0) {
      alert(`Một số file không thể thêm:\n${rejectedFiles.join('\n')}`)
    }

    setFiles(prev => [...prev, ...validFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)

    try {
      // Add isPublic to each file for processing
      const filesWithMeta = files.map(file => {
        const fileWithMeta = file as File & { isPublic?: boolean }
        fileWithMeta.isPublic = isPublic
        return fileWithMeta
      })

      // Queue the upload task - modal will auto close via useModalAutoClose
      await queueUpload(filesWithMeta, folderId, undefined, () => {
        onSuccess() // Refresh data when upload completes
      })
      
    } catch (error) {
      console.error('Queue upload error:', error)
      // Error is already handled in queue operations
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-full overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Upload ảnh
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Kéo thả ảnh vào đây
            </p>
            <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">
              hoặc
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
            >
              Chọn file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 10MB) và MP4, WebM, AVI, MOV (tối đa 100MB).
            </p>
          </div>

          {/* Selected files */}
          {files.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Đã chọn {files.length} file
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center relative">
                        {file.type.startsWith('video/') ? (
                          <>
                            <video
                              src={URL.createObjectURL(file)}
                              className="w-full h-full object-cover rounded"
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                          {file.type.startsWith('video/') && file.size > 25 * 1024 * 1024 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              Chunked Upload
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="ml-2 text-sm text-gray-900">
                Công khai ảnh (có thể xem được mà không cần đăng nhập)
              </label>
            </div>

            {folderId && (
              <div className="flex items-center text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                Ảnh sẽ được lưu vào folder đã chọn
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Đang upload...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length} ảnh
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
