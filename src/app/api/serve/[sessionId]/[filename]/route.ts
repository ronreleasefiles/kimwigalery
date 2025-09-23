import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ServeParams {
  sessionId: string
  filename: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: ServeParams }
) {
  try {
    const { sessionId, filename } = params
    
    console.log(`\n📥 ============= SERVING CHUNKED FILE =============`)
    console.log(`📁 File: ${filename}`)
    console.log(`🔑 Session: ${sessionId}`)
    console.log(`⏰ Request at: ${new Date().toLocaleTimeString('vi-VN')}`)
    
    // Tìm file trong database
    const image = await prisma.image.findFirst({
      where: {
        filename: filename,
        path: `/api/serve/${sessionId}/${filename}`
      }
    })
    
    if (!image || !image.metadata) {
      console.error(`❌ File not found: ${filename}`)
      return new NextResponse('File not found', { status: 404 })
    }
    
    const metadata = JSON.parse(image.metadata)
    if (!metadata.isChunkedFile) {
      console.error(`❌ Not a chunked file: ${filename}`)
      return new NextResponse('Not a chunked file', { status: 400 })
    }
    
    const { totalChunks } = metadata
    console.log(`🧩 Total chunks: ${totalChunks}`)
    
    // Download và ghép các chunks
    const chunkBuffers: Buffer[] = []
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkFileName = `${sessionId}_chunk_${i.toString().padStart(4, '0')}`
      const chunkUrl = `https://raw.githubusercontent.com/ronreleasefiles/filestorage/main/temp_chunks/${sessionId}/${chunkFileName}`
      
      console.log(`📥 [${i + 1}/${totalChunks}] Downloading chunk...`)
      
      try {
        const response = await fetch(chunkUrl)
        if (!response.ok) {
          throw new Error(`Failed to download chunk ${i + 1}: ${response.statusText}`)
        }
        
        const arrayBuffer = await response.arrayBuffer()
        chunkBuffers.push(Buffer.from(arrayBuffer))
        
      } catch (error) {
        console.error(`❌ [${i + 1}/${totalChunks}] Download failed:`, error)
        return new NextResponse(`Failed to download chunk ${i + 1}`, { status: 500 })
      }
    }
    
    // Ghép tất cả chunks
    console.log(`🔗 Concatenating ${totalChunks} chunks...`)
    const completeBuffer = Buffer.concat(chunkBuffers)
    
    const fileSizeMB = (completeBuffer.length / 1024 / 1024).toFixed(2)
    console.log(`✅ File assembled: ${fileSizeMB}MB`)
    console.log(`📤 Serving to client...`)
    console.log(`===============================================\n`)
    
    // Serve file với proper headers
    const headers = new Headers()
    headers.set('Content-Type', image.mimeType)
    headers.set('Content-Length', completeBuffer.length.toString())
    headers.set('Content-Disposition', `inline; filename="${image.originalName}"`)
    headers.set('Cache-Control', 'public, max-age=31536000') // Cache 1 year
    
    // Support range requests cho video
    const range = request.headers.get('range')
    if (range && image.mediaType === 'video') {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : completeBuffer.length - 1
      const chunkSize = (end - start) + 1
      
      headers.set('Content-Range', `bytes ${start}-${end}/${completeBuffer.length}`)
      headers.set('Accept-Ranges', 'bytes')
      headers.set('Content-Length', chunkSize.toString())
      
      return new NextResponse(completeBuffer.slice(start, end + 1), {
        status: 206, // Partial Content
        headers
      })
    }
    
    return new NextResponse(completeBuffer, { headers })
    
  } catch (error) {
    console.error('Serve error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
