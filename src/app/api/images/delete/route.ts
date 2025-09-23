import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteFromGitHub } from '@/lib/git-storage'

interface ChunkedFileMetadata {
  sessionId: string
  totalChunks: number
  isChunkedFile: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { imageIds } = await request.json()

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không có ảnh nào được chọn để xóa' },
        { status: 400 }
      )
    }

    // Lấy thông tin các ảnh cần xóa
    const images = await prisma.image.findMany({
      where: {
        id: {
          in: imageIds
        }
      }
    })

    if (images.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy ảnh nào để xóa' },
        { status: 404 }
      )
    }

    console.log(`\n🗑️  ============= DELETING ${images.length} FILES =============`)
    
    let deletedCount = 0
    let chunkedFilesDeleted = 0
    let regularFilesDeleted = 0
    
    // Xóa từng file từ GitHub storage
    for (const image of images) {
      try {
        console.log(`🗑️  Processing: ${image.originalName}`)
        
        // Kiểm tra xem có phải chunked file không
        if (image.metadata) {
          try {
            const metadata: ChunkedFileMetadata = JSON.parse(image.metadata)
            
            if (metadata.isChunkedFile && metadata.sessionId && metadata.totalChunks) {
              console.log(`🧩 Chunked file detected: ${metadata.totalChunks} chunks`)
              
              // Xóa từng chunk
              let chunksDeleted = 0
              for (let i = 0; i < metadata.totalChunks; i++) {
                const chunkFileName = `${metadata.sessionId}_chunk_${i.toString().padStart(4, '0')}`
                try {
                  await deleteFromGitHub(chunkFileName, `temp_chunks/${metadata.sessionId}`)
                  chunksDeleted++
                  console.log(`✅ Deleted chunk ${i + 1}/${metadata.totalChunks}: ${chunkFileName}`)
                } catch (chunkError) {
                  console.warn(`⚠️  Failed to delete chunk ${i + 1}: ${chunkError}`)
                }
              }
              
              console.log(`🧩 Chunked file cleanup: ${chunksDeleted}/${metadata.totalChunks} chunks deleted`)
              chunkedFilesDeleted++
            }
          } catch (metadataError) {
            console.warn(`⚠️  Invalid metadata for ${image.filename}:`, metadataError)
          }
        } else {
          // File thông thường - xóa từ Gallery folder
          try {
            await deleteFromGitHub(image.filename, 'Gallery')
            console.log(`✅ Deleted regular file: ${image.filename}`)
            regularFilesDeleted++
          } catch (deleteError) {
            console.error(`❌ Failed to delete ${image.filename}:`, deleteError)
          }
        }
        
        deletedCount++
        
      } catch (error) {
        console.error(`❌ Error processing ${image.filename}:`, error)
      }
    }

    // Xóa records trong database
    console.log(`\n💾 Deleting ${images.length} records from database...`)
    await prisma.image.deleteMany({
      where: {
        id: {
          in: imageIds
        }
      }
    })
    
    console.log(`\n🎉 ============= DELETION COMPLETE =============`)
    console.log(`📊 Total files processed: ${deletedCount}/${images.length}`)
    console.log(`🧩 Chunked files: ${chunkedFilesDeleted}`)
    console.log(`📁 Regular files: ${regularFilesDeleted}`)
    console.log(`💾 Database records deleted: ${images.length}`)
    console.log(`⏰ Completed at: ${new Date().toLocaleTimeString('vi-VN')}`)
    console.log(`=============================================\n`)

    return NextResponse.json({
      success: true,
      message: `Đã xóa thành công ${images.length} ảnh`
    })

  } catch (error) {
    console.error('Delete images error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa ảnh' },
      { status: 500 }
    )
  }
}
