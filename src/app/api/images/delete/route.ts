import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { prisma } from '@/lib/prisma'

const execAsync = promisify(exec)

export async function DELETE(request: NextRequest) {
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

    // Xóa file vật lý từ Git repo
    for (const image of images) {
      try {
        const filePath = path.join(process.cwd(), 'git-images', image.filename)
        await unlink(filePath)
      } catch (error) {
        console.error(`Không thể xóa file ${image.filename}:`, error)
        // Tiếp tục xóa các file khác
      }
    }

    // Xóa record trong database
    await prisma.image.deleteMany({
      where: {
        id: {
          in: imageIds
        }
      }
    })

    // Commit việc xóa vào Git
    try {
      await execAsync('git add git-images/', { cwd: process.cwd() })
      await execAsync(`git commit -m "Delete ${images.length} images"`, { cwd: process.cwd() })
      await execAsync('git push', { cwd: process.cwd() })
    } catch (gitError) {
      console.error('Git commit error:', gitError)
      // Không fail delete nếu Git commit lỗi
    }

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
