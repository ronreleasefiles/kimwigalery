import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const { imageIds, isPublic } = await request.json()

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không có ảnh nào được chọn' },
        { status: 400 }
      )
    }

    // Cập nhật trạng thái công khai
    await prisma.image.updateMany({
      where: {
        id: {
          in: imageIds
        }
      },
      data: {
        isPublic: isPublic
      }
    })

    const statusText = isPublic ? 'công khai' : 'riêng tư'
    
    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${imageIds.length} ảnh thành ${statusText}`
    })

  } catch (error) {
    console.error('Toggle public error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật trạng thái ảnh' },
      { status: 500 }
    )
  }
}
