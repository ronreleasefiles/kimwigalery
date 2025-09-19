import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import { isValidImageType } from '@/lib/utils'

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

    // Tạo thư mục upload nếu chưa tồn tại
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
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
      const filePath = path.join(uploadDir, filename)

      // Lưu file
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Lưu thông tin vào database
      const image = await prisma.image.create({
        data: {
          filename,
          originalName: file.name,
          path: `/uploads/${filename}`,
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
