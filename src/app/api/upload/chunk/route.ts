import { NextRequest, NextResponse } from 'next/server'
import { uploadToGitHub } from '@/lib/git-storage'
import { ChunkInfo } from '@/lib/chunk-upload'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chunk = formData.get('chunk') as File
    const chunkInfoStr = formData.get('chunkInfo') as string
    const sessionId = formData.get('sessionId') as string
    
    if (!chunk || !chunkInfoStr || !sessionId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const chunkInfo: ChunkInfo = JSON.parse(chunkInfoStr)
    
    const chunkSizeMB = (chunk.size / 1024 / 1024).toFixed(2)
    const uploadStartTime = Date.now()
    
    console.log(`\n📤 ============= CHUNK UPLOAD =============`)
    console.log(`📦 Session: ${sessionId}`)
    console.log(`🧩 Chunk: ${chunkInfo.chunkIndex + 1}/${chunkInfo.totalChunks}`)
    console.log(`📊 Size: ${chunkSizeMB}MB`)
    console.log(`📁 Original: ${chunkInfo.originalFileName}`)
    console.log(`⏰ Started at: ${new Date().toLocaleTimeString('vi-VN')}`)
    
    // Tạo tên file cho chunk
    const chunkFileName = `${sessionId}_chunk_${chunkInfo.chunkIndex.toString().padStart(4, '0')}`
    console.log(`🔑 Chunk ID: ${chunkFileName}`)
    
    // Convert chunk to buffer
    const bytes = await chunk.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload chunk lên GitHub trong folder tạm
    console.log(`📤 Uploading to GitHub storage...`)
    const uploadResult = await uploadToGitHub(
      buffer, 
      chunkFileName, 
      `temp_chunks/${sessionId}`
    )
    
    const uploadDuration = (Date.now() - uploadStartTime) / 1000
    
    if (!uploadResult.success) {
      console.error(`❌ Chunk upload failed after ${uploadDuration.toFixed(1)}s:`, uploadResult.error)
      return NextResponse.json(
        { success: false, message: `Chunk upload failed: ${uploadResult.error}` },
        { status: 500 }
      )
    }
    
    console.log(`✅ Chunk ${chunkInfo.chunkIndex + 1}/${chunkInfo.totalChunks} uploaded successfully in ${uploadDuration.toFixed(1)}s`)
    console.log(`🌐 URL: ${uploadResult.downloadUrl}`)
    console.log(`========================================\n`)
    
    return NextResponse.json({
      success: true,
      chunkId: chunkFileName,
      chunkIndex: chunkInfo.chunkIndex,
      uploadUrl: uploadResult.downloadUrl
    })
    
  } catch (error) {
    console.error('Chunk upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
