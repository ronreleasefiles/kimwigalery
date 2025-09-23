import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import { uploadToGitHub } from '@/lib/git-storage'
import { isValidMediaType, isValidVideoType } from '@/lib/utils'

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

    const uploadedImages = []

    for (const file of files) {
      if (!file || file.size === 0) {
        console.log(`Skipping empty file: ${file?.name}`)
        continue
      }

      // Kiểm tra loại file
      if (!isValidMediaType(file.type)) {
        console.log(`Invalid media type: ${file.type} for file: ${file.name}`)
        continue
      }

      console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`)

      // Kiểm tra size file
      const maxImageSize = 10 * 1024 * 1024 // 10MB
      const maxVideoSize = 25 * 1024 * 1024 // 25MB
      const isVideo = isValidVideoType(file.type)
      const maxSize = isVideo ? maxVideoSize : maxImageSize
      
      if (file.size > maxSize) {
        console.log(`File too large: ${file.name}, size: ${file.size}, max: ${maxSize}`)
        continue
      }

      // Tạo tên file unique
      const fileExtension = file.name.split('.').pop() || ''
      const filename = `${uuidv4()}.${fileExtension}`

      // Chuyển đổi file thành buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Upload lên GitHub storage
      console.log(`Uploading to GitHub: ${filename}`)
      const uploadResult = await uploadToGitHub(buffer, filename, 'Gallery')
      
      if (!uploadResult.success) {
        console.error('GitHub upload failed for', filename, ':', uploadResult.error)
        continue
      }
      
      console.log(`GitHub upload success for ${filename}:`, uploadResult.downloadUrl)

      // Lưu thông tin vào database với GitHub URL
      const image = await prisma.image.create({
        data: {
          filename,
          originalName: file.name,
          path: uploadResult.downloadUrl!, // URL từ GitHub
          size: file.size,
          mimeType: file.type,
          mediaType: isValidVideoType(file.type) ? 'video' : 'image',
          isPublic,
          folderId: folderId || null
        },
        include: {
          folder: true
        }
      })

      uploadedImages.push(image)
    }

    // GitHub upload đã được thực hiện trong vòng lặp trên

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
