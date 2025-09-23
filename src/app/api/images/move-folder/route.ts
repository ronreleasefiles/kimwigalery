import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { imageIds, folderId } = await request.json()

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không có ảnh nào được chọn để di chuyển' },
        { status: 400 }
      )
    }

    // Validate folder exists if folderId is provided
    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId }
      })

      if (!folder) {
        return NextResponse.json(
          { success: false, message: 'Thư mục không tồn tại' },
          { status: 404 }
        )
      }
    }

    // Update images folder
    await prisma.image.updateMany({
      where: {
        id: {
          in: imageIds
        }
      },
      data: {
        folderId: folderId || null
      }
    })

    const actionText = folderId 
      ? 'di chuyển vào thư mục' 
      : 'di chuyển ra khỏi thư mục'
    
    return NextResponse.json({
      success: true,
      message: `Đã ${actionText} ${imageIds.length} ảnh thành công`
    })

  } catch (error) {
    console.error('Move folder error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi di chuyển ảnh' },
      { status: 500 }
    )
  }
}
