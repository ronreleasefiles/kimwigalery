import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename

    // Tìm ảnh trong database
    const image = await prisma.image.findFirst({
      where: {
        filename: filename
      }
    })

    if (!image) {
      return new NextResponse('Image not found', { status: 404 })
    }

    // Kiểm tra quyền truy cập (nếu ảnh không public)
    if (!image.isPublic) {
      // Có thể thêm logic xác thực ở đây
      // Hiện tại cho phép truy cập tất cả ảnh private
    }

    // Chuyển đổi base64 thành buffer
    const base64Data = image.base64Data.split(',')[1] // Bỏ phần "data:image/...;base64,"
    const buffer = Buffer.from(base64Data, 'base64')

    // Trả về ảnh với đúng content-type
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': image.mimeType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache 1 năm
      },
    })

  } catch (error) {
    console.error('Serve image error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
