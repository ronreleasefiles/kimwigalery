'use client'

export interface ChunkInfo {
  chunkId: string
  chunkIndex: number
  totalChunks: number
  chunkSize: number
  originalFileName: string
  originalFileSize: number
  mimeType: string
}

export interface ChunkUploadResult {
  success: boolean
  chunkId?: string
  error?: string
}

export interface AssembleResult {
  success: boolean
  downloadUrl?: string
  error?: string
}

/**
 * Tính toán chunk size tối ưu dựa trên file size
 */
function calculateOptimalChunkSize(fileSize: number): number {
  const MB = 1024 * 1024
  
  if (fileSize <= 50 * MB) {
    return 15 * MB // 15MB chunks cho file nhỏ
  } else if (fileSize <= 100 * MB) {
    return 20 * MB // 20MB chunks cho file trung bình
  } else if (fileSize <= 200 * MB) {
    return 25 * MB // 25MB chunks cho file lớn (tối đa GitHub cho phép)
  } else {
    return 25 * MB // Giữ 25MB cho file rất lớn
  }
}

/**
 * Chia file thành các chunks nhỏ với size tự động tối ưu
 */
export function splitFileIntoChunks(
  file: File, 
  customChunkSize?: number
): { chunks: Blob[], chunkInfos: ChunkInfo[] } {
  const chunkSize = customChunkSize || calculateOptimalChunkSize(file.size)
  const chunks: Blob[] = []
  const chunkInfos: ChunkInfo[] = []
  const totalChunks = Math.ceil(file.size / chunkSize)
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)
    
    const chunkInfo: ChunkInfo = {
      chunkId: `${Date.now()}_${i}`,
      chunkIndex: i,
      totalChunks,
      chunkSize: chunk.size,
      originalFileName: file.name,
      originalFileSize: file.size,
      mimeType: file.type
    }
    
    chunks.push(chunk)
    chunkInfos.push(chunkInfo)
  }
  
  return { chunks, chunkInfos }
}

/**
 * Upload một chunk lên server
 */
export async function uploadChunk(
  chunk: Blob, 
  chunkInfo: ChunkInfo,
  sessionId: string
): Promise<ChunkUploadResult> {
  try {
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('chunkInfo', JSON.stringify(chunkInfo))
    formData.append('sessionId', sessionId)
    
    const response = await fetch('/api/upload/chunk', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Chunk upload failed: ${errorText}`)
    }
    
    const result = await response.json()
    return {
      success: true,
      chunkId: result.chunkId
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Ghép các chunks thành file hoàn chỉnh
 */
export async function assembleChunks(
  sessionId: string,
  originalFileName: string,
  totalChunks: number,
  mimeType: string,
  folderId?: string | null,
  isPublic?: boolean
): Promise<AssembleResult> {
  try {
    const response = await fetch('/api/upload/assemble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        originalFileName,
        totalChunks,
        mimeType,
        folderId,
        isPublic
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Assembly failed: ${errorText}`)
    }
    
    const result = await response.json()
    return {
      success: true,
      downloadUrl: result.downloadUrl
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Upload file lớn với chunked upload
 */
export async function uploadLargeFile(
  file: File,
  folderId?: string | null,
  isPublic?: boolean,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const { chunks, chunkInfos } = splitFileIntoChunks(file)
    
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
    const chunkSizeMB = (chunkInfos[0]?.chunkSize / 1024 / 1024).toFixed(2)
    
    console.log(`\n🚀 ============= CHUNKED UPLOAD START =============`)
    console.log(`📁 File: ${file.name}`)
    console.log(`📊 Size: ${fileSizeMB}MB`)
    console.log(`🧩 Strategy: ${chunks.length} chunks x ~${chunkSizeMB}MB each`)
    console.log(`🔑 Session: ${sessionId}`)
    console.log(`⏰ Started at: ${new Date().toLocaleTimeString('vi-VN')}`)
    console.log(`===============================================\n`)
    
    // Upload từng chunk
    const uploadedChunks: string[] = []
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const chunkInfo = chunkInfos[i]
      
      const chunkSizeMB = (chunk.size / 1024 / 1024).toFixed(2)
      const chunkStartTime = Date.now()
      
      console.log(`📤 [${i + 1}/${chunks.length}] Uploading chunk (${chunkSizeMB}MB)...`)
      
      const result = await uploadChunk(chunk, chunkInfo, sessionId)
      const chunkEndTime = Date.now()
      const chunkDuration = (chunkEndTime - chunkStartTime) / 1000
      
      if (!result.success) {
        console.error(`❌ [${i + 1}/${chunks.length}] FAILED after ${chunkDuration.toFixed(1)}s:`, result.error)
        throw new Error(`Chunk ${i + 1} upload failed: ${result.error}`)
      }
      
      console.log(`✅ [${i + 1}/${chunks.length}] SUCCESS in ${chunkDuration.toFixed(1)}s`)
      uploadedChunks.push(result.chunkId!)
      
      // Update progress with detailed info
      const progress = Math.round(((i + 1) / chunks.length) * 90) // 90% cho upload chunks
      const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5))
      console.log(`📊 Progress: ${progress}% [${progressBar}] (${i + 1}/${chunks.length} chunks)`)
      
      onProgress?.(progress)
    }
    
    console.log(`\n🔧 ============= ASSEMBLY PHASE =============`)
    console.log(`📥 Downloading ${chunks.length} chunks...`)
    console.log(`🔗 Concatenating into final file...`)
    console.log(`📤 Uploading complete file to storage...`)
    
    const assembleStartTime = Date.now()
    
    // Ghép các chunks
    const assembleResult = await assembleChunks(
      sessionId,
      file.name,
      chunks.length,
      file.type,
      folderId,
      isPublic
    )
    
    const assembleEndTime = Date.now()
    const assembleDuration = (assembleEndTime - assembleStartTime) / 1000
    
    if (!assembleResult.success) {
      console.error(`❌ ASSEMBLY FAILED after ${assembleDuration.toFixed(1)}s:`, assembleResult.error)
      throw new Error(`Assembly failed: ${assembleResult.error}`)
    }
    
    const totalDuration = (assembleEndTime - Date.parse(new Date().toISOString())) / 1000
    
    console.log(`✅ Assembly completed in ${assembleDuration.toFixed(1)}s`)
    console.log(`📊 Progress: 100% [████████████████████] COMPLETE!`)
    
    console.log(`\n🎉 ============= UPLOAD COMPLETE =============`)
    console.log(`📁 File: ${file.name}`)
    console.log(`📊 Size: ${fileSizeMB}MB`)
    console.log(`⏱️  Total time: ${Math.abs(totalDuration).toFixed(1)}s`)
    console.log(`🌐 URL: ${assembleResult.downloadUrl}`)
    console.log(`⏰ Completed at: ${new Date().toLocaleTimeString('vi-VN')}`)
    console.log(`=============================================\n`)
    
    onProgress?.(100) // 100% hoàn thành
    
    return {
      success: true,
      downloadUrl: assembleResult.downloadUrl
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
