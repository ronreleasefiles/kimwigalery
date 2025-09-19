import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { exec } from 'child_process'
import { promisify } from 'util'
import { prisma } from '@/lib/prisma'
import { isValidImageType } from '@/lib/utils'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folderId = formData.get('folderId') as string | null
    const isPublic = formData.get('isPublic') === 'true'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không có file nào được chọn' },
        { status: 400 }
      )
    }

    // Tạo thư mục images trong Git repo nếu chưa tồn tại
    const imagesDir = path.join(process.cwd(), 'git-images')
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true })
    }

    const uploadedImages = []

    for (const file of files) {
      // Kiểm tra loại file
      if (!isValidImageType(file.type)) {
        continue // Bỏ qua file không hợp lệ
      }

      // Kiểm tra kích thước file (10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        continue // Bỏ qua file quá lớn
      }

      // Tạo tên file unique
      const fileExtension = path.extname(file.name)
      const filename = `${uuidv4()}${fileExtension}`
      const filePath = path.join(imagesDir, filename)

      // Chuyển đổi file thành base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Data = buffer.toString('base64')
      
      // Lưu file vào Git repo
      await writeFile(filePath, buffer)

      // Lưu thông tin vào database với base64
      const image = await prisma.image.create({
        data: {
          filename,
          originalName: file.name,
          path: `/api/images/serve/${filename}`, // API endpoint để serve ảnh
          base64Data: `data:${file.type};base64,${base64Data}`,
          size: file.size,
          mimeType: file.type,
          isPublic,
          folderId: folderId || null
        },
        include: {
          folder: true
        }
      })

      uploadedImages.push(image)
    }

    // Commit ảnh vào Git repository
    if (uploadedImages.length > 0) {
      try {
        await execAsync('git add git-images/', { cwd: process.cwd() })
        await execAsync(`git commit -m "Add ${uploadedImages.length} new images"`, { cwd: process.cwd() })
        await execAsync('git push', { cwd: process.cwd() })
      } catch (gitError) {
        console.error('Git commit error:', gitError)
        // Không fail upload nếu Git commit lỗi
      }
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không có file hợp lệ nào được upload' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Đã upload thành công ${uploadedImages.length} ảnh`,
      data: uploadedImages
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi upload ảnh' },
      { status: 500 }
    )
  }
}
