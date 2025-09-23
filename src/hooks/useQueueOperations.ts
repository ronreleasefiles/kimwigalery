'use client'

import { useCallback } from 'react'
import { useQueue } from '@/contexts/QueueContext'
import { useToast } from '@/contexts/ToastContext'
import { uploadLargeFile } from '@/lib/chunk-upload'
import { isValidVideoType } from '@/lib/utils'

export const useQueueOperations = () => {
  const { addTask, updateTask } = useQueue()
  const { addToast } = useToast()

  // Queue upload operation
  const queueUpload = useCallback(async (
    files: (File & { isPublic?: boolean })[], 
    folderId?: string | null,
    onProgress?: (progress: number) => void,
    onComplete?: () => void
  ) => {
    const taskId = addTask({
      type: 'upload',
      title: `Tải lên ${files.length} tệp`,
      data: { files, folderId }
    })

    // Show toast notification
    addToast({
      type: 'info',
      title: 'Đã thêm vào hàng đợi',
      message: `${files.length} tệp đang được tải lên`,
      duration: 3000
    })

    updateTask(taskId, { status: 'processing' })

    try {
      const uploadedResults = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const isVideo = isValidVideoType(file.type)
        const isLargeFile = file.size > 25 * 1024 * 1024 // 25MB threshold
        
        if (isVideo && isLargeFile) {
          // Use chunked upload for large videos
          const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
          
          // Tính chunk size tối ưu
          let chunkSize = 20 * 1024 * 1024 // Default 20MB
          if (file.size <= 50 * 1024 * 1024) {
            chunkSize = 15 * 1024 * 1024 // 15MB cho file nhỏ
          } else if (file.size > 100 * 1024 * 1024) {
            chunkSize = 25 * 1024 * 1024 // 25MB cho file lớn
          }
          
          const estimatedChunks = Math.ceil(file.size / chunkSize)
          const chunkSizeMB = (chunkSize / 1024 / 1024).toFixed(0)
          
          console.log(`🎬 Auto-detected large video: ${file.name}`)
          console.log(`📊 Size: ${fileSizeMB}MB → Will split into ${estimatedChunks} chunks (${chunkSizeMB}MB each)`)
          
          // Update task title to show chunked upload
          updateTask(taskId, { 
            title: `Upload video lớn: ${file.name} (${fileSizeMB}MB, ${estimatedChunks} chunks)`,
            progress: 0,
            startedAt: new Date(),
            totalChunks: estimatedChunks,
            currentChunk: 0
          })
          
          const result = await uploadLargeFile(
            file,
            folderId,
            file.isPublic,
            (progress) => {
              // Update progress for this specific file with chunk info
              const overallProgress = Math.round(((i + progress / 100) / files.length) * 100)
              const currentChunk = Math.ceil(progress / 100 * estimatedChunks)
              
              // Calculate estimated time remaining
              const now = new Date()
              const startTime = new Date(now.getTime() - 1000) // Approximate start time
              const elapsedSeconds = (now.getTime() - startTime.getTime()) / 1000
              const estimatedTotalTime = elapsedSeconds / (progress / 100)
              const estimatedTimeRemaining = Math.max(0, estimatedTotalTime - elapsedSeconds)
              
              updateTask(taskId, { 
                progress: overallProgress,
                currentChunk: currentChunk,
                estimatedTimeRemaining: estimatedTimeRemaining,
                title: `Upload video: ${file.name} (${Math.round(progress)}% - Chunk ${currentChunk}/${estimatedChunks})`
              })
              onProgress?.(overallProgress)
            }
          )
          
          if (!result.success) {
            throw new Error(`Chunked upload failed: ${result.error}`)
          }
          
          uploadedResults.push(result)
          
        } else {
          // Use regular upload for small files
          const formData = new FormData()
          formData.append('files', file)
          
          if (folderId) {
            formData.append('folderId', folderId)
          }
          
          if (file.isPublic !== undefined) {
            formData.append('isPublic', file.isPublic.toString())
          }

          const response = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Upload error response:', errorText)
            throw new Error(`Upload failed: ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          uploadedResults.push(result)
          
          // Update progress for this file
          const overallProgress = Math.round(((i + 1) / files.length) * 100)
          updateTask(taskId, { progress: overallProgress })
          onProgress?.(overallProgress)
        }
      }
      
      updateTask(taskId, { 
        status: 'completed', 
        progress: 100 
      })

      onComplete?.()
      return { success: true, results: uploadedResults }

    } catch (error) {
      updateTask(taskId, { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Upload failed' 
      })
      throw error
    }
  }, [addTask, updateTask, addToast])

  // Queue delete operation
  const queueDelete = useCallback(async (
    imageIds: string[],
    onComplete?: () => void
  ) => {
    const taskId = addTask({
      type: 'delete',
      title: `Xóa ${imageIds.length} ảnh`,
      data: { imageIds }
    })

    // Show toast notification
    addToast({
      type: 'info',
      title: 'Đã thêm vào hàng đợi',
      message: `${imageIds.length} ảnh đang được xóa`,
      duration: 3000
    })

    updateTask(taskId, { status: 'processing' })

    try {
      // Process each image individually for better progress tracking
      for (let i = 0; i < imageIds.length; i++) {
        const imageId = imageIds[i]
        const progress = Math.round(((i + 1) / imageIds.length) * 100)
        
        const response = await fetch('/api/images/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageIds: [imageId] }),
        })

        if (!response.ok) {
          throw new Error(`Delete failed for image ${imageId}`)
        }

        updateTask(taskId, { progress })
        
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      updateTask(taskId, { 
        status: 'completed', 
        progress: 100 
      })

      onComplete?.()

    } catch (error) {
      updateTask(taskId, { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Delete failed' 
      })
      throw error
    }
  }, [addTask, updateTask, addToast])

  // Queue toggle public operation
  const queueTogglePublic = useCallback(async (
    imageIds: string[],
    isPublic: boolean,
    onComplete?: () => void
  ) => {
    const taskId = addTask({
      type: 'toggle-public',
      title: `Cập nhật ${imageIds.length} ảnh thành ${isPublic ? 'công khai' : 'riêng tư'}`,
      data: { imageIds, isPublic }
    })

    // Show toast notification
    addToast({
      type: 'info',
      title: 'Đã thêm vào hàng đợi',
      message: `${imageIds.length} ảnh đang được cập nhật`,
      duration: 3000
    })

    updateTask(taskId, { status: 'processing' })

    try {
      const response = await fetch('/api/images/toggle-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds, isPublic }),
      })

      if (!response.ok) {
        throw new Error(`Toggle public failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      updateTask(taskId, { 
        status: 'completed', 
        progress: 100 
      })

      onComplete?.()
      return result

    } catch (error) {
      updateTask(taskId, { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Toggle public failed' 
      })
      throw error
    }
  }, [addTask, updateTask, addToast])

  // Queue move to folder operation
  const queueMoveToFolder = useCallback(async (
    imageIds: string[],
    folderId: string | null,
    onComplete?: () => void
  ) => {
    const taskId = addTask({
      type: 'move-folder',
      title: `Di chuyển ${imageIds.length} ảnh ${folderId ? 'vào thư mục' : 'ra khỏi thư mục'}`,
      data: { imageIds, folderId }
    })

    // Show toast notification
    addToast({
      type: 'info',
      title: 'Đã thêm vào hàng đợi',
      message: `${imageIds.length} ảnh đang được di chuyển`,
      duration: 3000
    })

    updateTask(taskId, { status: 'processing' })

    try {
      const response = await fetch('/api/images/move-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds, folderId }),
      })

      if (!response.ok) {
        throw new Error(`Move to folder failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      updateTask(taskId, { 
        status: 'completed', 
        progress: 100 
      })

      onComplete?.()
      return result

    } catch (error) {
      updateTask(taskId, { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Move to folder failed' 
      })
      throw error
    }
  }, [addTask, updateTask, addToast])

  return {
    queueUpload,
    queueDelete,
    queueTogglePublic,
    queueMoveToFolder
  }
}
