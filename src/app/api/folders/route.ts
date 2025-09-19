import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Lấy danh sách folder
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showPublicOnly = searchParams.get('publicOnly') === 'true'

    const where: any = {}
    
    if (showPublicOnly) {
      where.isPublic = true
    }

    const folders = await prisma.folder.findMany({
      where,
      include: {
        images: true,
        _count: {
          select: {
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: folders
    })

  } catch (error) {
    console.error('Get folders error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy danh sách folder' },
      { status: 500 }
    )
  }
}

// Tạo folder mới
export async function POST(request: NextRequest) {
  try {
    const { name, isPublic = false } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Tên folder không được để trống' },
        { status: 400 }
      )
    }

    // Kiểm tra tên folder đã tồn tại chưa
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: name.trim()
      }
    })

    if (existingFolder) {
      return NextResponse.json(
        { success: false, message: 'Tên folder đã tồn tại' },
        { status: 400 }
      )
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        isPublic
      },
      include: {
        _count: {
          select: {
            images: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tạo folder thành công',
      data: folder
    })

  } catch (error) {
    console.error('Create folder error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo folder' },
      { status: 500 }
    )
  }
}
