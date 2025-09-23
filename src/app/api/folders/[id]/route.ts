import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Lấy thông tin folder
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: folderId } = await params

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        _count: {
          select: {
            images: true
          }
        }
      }
    })

    if (!folder) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy folder' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: folder
    })

  } catch (error) {
    console.error('Get folder error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy thông tin folder' },
      { status: 500 }
    )
  }
}

// Cập nhật folder
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name, isPublic } = await request.json()
    const { id: folderId } = await params

    const updateData: any = {}
    
    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return NextResponse.json(
          { success: false, message: 'Tên folder không được để trống' },
          { status: 400 }
        )
      }
      
      // Kiểm tra tên folder đã tồn tại chưa (trừ folder hiện tại)
      const existingFolder = await prisma.folder.findFirst({
        where: {
          name: name.trim(),
          NOT: {
            id: folderId
          }
        }
      })

      if (existingFolder) {
        return NextResponse.json(
          { success: false, message: 'Tên folder đã tồn tại' },
          { status: 400 }
        )
      }
      
      updateData.name = name.trim()
    }
    
    if (isPublic !== undefined) {
      updateData.isPublic = isPublic
    }

    const folder = await prisma.folder.update({
      where: { id: folderId },
      data: updateData,
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
      message: 'Cập nhật folder thành công',
      data: folder
    })

  } catch (error) {
    console.error('Update folder error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật folder' },
      { status: 500 }
    )
  }
}

// Xóa folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: folderId } = await params

    // Kiểm tra folder có tồn tại không
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        _count: {
          select: {
            images: true
          }
        }
      }
    })

    if (!folder) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy folder' },
        { status: 404 }
      )
    }

    // Cập nhật các ảnh trong folder về null (không thuộc folder nào)
    await prisma.image.updateMany({
      where: { folderId: folderId },
      data: { folderId: null }
    })

    // Xóa folder
    await prisma.folder.delete({
      where: { id: folderId }
    })

    return NextResponse.json({
      success: true,
      message: `Đã xóa folder "${folder.name}" và chuyển ${folder._count.images} ảnh về thư mục gốc`
    })

  } catch (error) {
    console.error('Delete folder error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa folder' },
      { status: 500 }
    )
  }
}
