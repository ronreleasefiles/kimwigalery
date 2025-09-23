import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { itemIds, itemType } = await request.json()

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không có item nào được chọn' },
        { status: 400 }
      )
    }

    // Kiểm tra tất cả items có public không
    let items
    if (itemType === 'images') {
      items = await prisma.image.findMany({
        where: {
          id: { in: itemIds },
          isPublic: true
        }
      })
    } else {
      items = await prisma.folder.findMany({
        where: {
          id: { in: itemIds },
          isPublic: true
        }
      })
    }

    if (items.length !== itemIds.length) {
      return NextResponse.json(
        { success: false, message: 'Chỉ có thể chia sẻ các item công khai' },
        { status: 400 }
      )
    }

    // Tạo share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const shareUrl = `${baseUrl}/share/${itemType}/${itemIds.join(',')}`

    return NextResponse.json({
      success: true,
      shareUrl,
      items: items.length
    })

  } catch (error) {
    console.error('Share error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo link chia sẻ' },
      { status: 500 }
    )
  }
}
