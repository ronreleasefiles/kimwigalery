import { NextRequest, NextResponse } from 'next/server'
import { uploadToGitHub, deleteFromGitHub } from '@/lib/git-storage'
import { prisma } from '@/lib/prisma'
import { isValidVideoType } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

interface AssembleRequest {
  sessionId: string
  originalFileName: string
  totalChunks: number
  mimeType: string
  folderId?: string | null
  isPublic?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: AssembleRequest = await request.json()
    const { sessionId, originalFileName, totalChunks, mimeType, folderId, isPublic } = body
    
    console.log(`\n🔧 ============= SERVER ASSEMBLY =============`)
    console.log(`📦 Session: ${sessionId}`)
    console.log(`🧩 Total chunks: ${totalChunks}`)
    console.log(`📁 Target file: ${originalFileName}`)
    console.log(`⏰ Started at: ${new Date().toLocaleTimeString('vi-VN')}`)
    console.log(`============================================`)
    
    // Download và ghép các chunks
    const chunkBuffers: Buffer[] = []
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkFileName = `${sessionId}_chunk_${i.toString().padStart(4, '0')}`
      const chunkUrl = `https://raw.githubusercontent.com/ronreleasefiles/filestorage/main/temp_chunks/${sessionId}/${chunkFileName}`
      
      const downloadStartTime = Date.now()
      console.log(`📥 [${i + 1}/${totalChunks}] Downloading chunk...`)
      
      try {
        const response = await fetch(chunkUrl)
        if (!response.ok) {
          throw new Error(`Failed to download chunk ${i + 1}: ${response.statusText}`)
        }
        
        const arrayBuffer = await response.arrayBuffer()
        const chunkBuffer = Buffer.from(arrayBuffer)
        chunkBuffers.push(chunkBuffer)
        
        const downloadDuration = (Date.now() - downloadStartTime) / 1000
        const chunkSizeMB = (chunkBuffer.length / 1024 / 1024).toFixed(2)
        console.log(`✅ [${i + 1}/${totalChunks}] Downloaded ${chunkSizeMB}MB in ${downloadDuration.toFixed(1)}s`)
        
      } catch (error) {
        console.error(`❌ [${i + 1}/${totalChunks}] Download failed:`, error)
        throw new Error(`Failed to download chunk ${i + 1}`)
      }
    }
    
    // Ghép tất cả chunks thành file hoàn chỉnh
    const concatStartTime = Date.now()
    console.log(`\n🔗 Concatenating ${totalChunks} chunks...`)
    const completeBuffer = Buffer.concat(chunkBuffers)
    const concatDuration = (Date.now() - concatStartTime) / 1000
    
    const finalSizeMB = (completeBuffer.length / 1024 / 1024).toFixed(2)
    console.log(`✅ Concatenation completed in ${concatDuration.toFixed(1)}s - Final size: ${finalSizeMB}MB`)
    
    // Tạo tên file unique cho file hoàn chỉnh
    const fileExtension = originalFileName.split('.').pop() || ''
    const finalFileName = `${uuidv4()}.${fileExtension}`
    
    // Thay vì upload file hoàn chỉnh lên GitHub (bị giới hạn 25MB),
    // ta sẽ tạo một "virtual file" reference và giữ chunks
    const uploadStartTime = Date.now()
    console.log(`\n📤 Creating virtual file reference...`)
    console.log(`📁 File: ${finalFileName}`)
    console.log(`📊 Size: ${finalSizeMB}MB`)
    console.log(`🧩 Strategy: Keep chunks, create virtual reference`)
    
    // Tạo URL ảo để serve file từ chunks
    const virtualUrl = `/api/serve/${sessionId}/${finalFileName}`
    
    const uploadDuration = (Date.now() - uploadStartTime) / 1000
    console.log(`✅ Virtual file created in ${uploadDuration.toFixed(1)}s`)
    
    // Lưu thông tin vào database
    const dbStartTime = Date.now()
    console.log(`\n💾 Saving to database...`)
    
    const image = await prisma.image.create({
      data: {
        filename: finalFileName,
        originalName: originalFileName,
        path: virtualUrl, // Sử dụng virtual URL thay vì GitHub URL
        size: completeBuffer.length,
        mimeType: mimeType,
        mediaType: isValidVideoType(mimeType) ? 'video' : 'image',
        isPublic: isPublic || false,
        folderId: folderId || null,
        // Lưu thông tin chunks để serve sau này
        metadata: JSON.stringify({
          sessionId: sessionId,
          totalChunks: totalChunks,
          chunkSize: chunkBuffers[0]?.length || 0,
          isChunkedFile: true
        })
      },
      include: {
        folder: true
      }
    })
    
    const dbDuration = (Date.now() - dbStartTime) / 1000
    console.log(`✅ Database saved in ${dbDuration.toFixed(1)}s`)
    
    // KHÔNG xóa chunks - giữ lại để serve file sau này
    console.log(`\n📦 Keeping chunks for future serving...`)
    console.log(`🔗 Chunks will be served via: ${virtualUrl}`)
    console.log(`📍 Chunk location: temp_chunks/${sessionId}/`)
    console.log(`⚠️  Note: Chunks are preserved for file serving`)
    
    const totalAssemblyTime = (Date.now() - Date.parse(new Date().toISOString())) / 1000
    
    console.log(`\n🎉 ============= ASSEMBLY COMPLETE =============`)
    console.log(`📁 Original: ${originalFileName}`)
    console.log(`📁 Final: ${finalFileName}`)
    console.log(`📊 Size: ${finalSizeMB}MB`)
    console.log(`⏱️  Total assembly time: ${Math.abs(totalAssemblyTime).toFixed(1)}s`)
    console.log(`🌐 URL: ${virtualUrl}`)
    console.log(`⏰ Completed at: ${new Date().toLocaleTimeString('vi-VN')}`)
    console.log(`=============================================\n`)
    
    return NextResponse.json({
      success: true,
      downloadUrl: virtualUrl,
      image: image
    })
    
  } catch (error) {
    console.error('Assembly error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Assembly failed' 
      },
      { status: 500 }
    )
  }
}
