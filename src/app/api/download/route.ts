import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import JSZip from 'jszip'

export async function POST(request: NextRequest) {
  try {
    const { itemIds, itemType } = await request.json()

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không có item nào được chọn' },
        { status: 400 }
      )
    }

    if (itemType === 'images') {
      // Download images
      const images = await prisma.image.findMany({
        where: {
          id: { in: itemIds }
        }
      })

      if (images.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy ảnh nào' },
          { status: 404 }
        )
      }

      if (images.length === 1) {
        // Single image - redirect to direct download
        const image = images[0]
        return NextResponse.json({
          success: true,
          type: 'single',
          downloadUrl: image.path,
          filename: image.originalName
        })
      } else {
        // Multiple images - create zip
        const zip = new JSZip()
        
        for (const image of images) {
          try {
            const response = await fetch(image.path)
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer()
              zip.file(image.originalName, arrayBuffer)
            }
          } catch (error) {
            console.error(`Error downloading image ${image.id}:`, error)
          }
        }

        const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' })
        
        return new NextResponse(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="images_${Date.now()}.zip"`
          }
        })
      }
    } else {
      // Download folder info as JSON
      const folders = await prisma.folder.findMany({
        where: {
          id: { in: itemIds }
        },
        include: {
          images: true,
          _count: {
            select: {
              images: true
            }
          }
        }
      })

      if (folders.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy folder nào' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        type: 'folder_info',
        data: folders
      })
    }

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải xuống' },
      { status: 500 }
    )
  }
}
