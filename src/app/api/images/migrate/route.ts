import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Xóa tất cả ảnh có path cũ (không phải GitHub URL)
    const result = await prisma.image.deleteMany({
      where: {
        OR: [
          {
            path: {
              startsWith: '/api/images/serve/'
            }
          },
          {
            path: {
              startsWith: '/git-images/'
            }
          },
          {
            path: {
              startsWith: 'data:'
            }
          }
        ]
      }
    })

    return NextResponse.json({
      success: true,
      message: `Đã xóa ${result.count} ảnh cũ với path không hợp lệ`,
      deletedCount: result.count
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi migration dữ liệu' },
      { status: 500 }
    )
  }
}
