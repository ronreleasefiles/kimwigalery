import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')
    const showPublicOnly = searchParams.get('publicOnly') === 'true'

    const where: any = {}
    
    if (folderId) {
      where.folderId = folderId
    }
    
    if (showPublicOnly) {
      where.isPublic = true
    }

    const images = await prisma.image.findMany({
      where,
      include: {
        folder: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: images
    })

  } catch (error) {
    console.error('Get images error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy danh sách ảnh' },
      { status: 500 }
    )
  }
}
