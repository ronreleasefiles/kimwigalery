'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageType } from '@/types'
import { formatFileSize, formatDate } from '@/lib/utils'
import { Eye, EyeOff, Check } from 'lucide-react'

interface ImageGridProps {
  images: ImageType[]
  selectedImages: string[]
  onImageSelect: (imageId: string) => void
  loading: boolean
}

export default function ImageGrid({
  images,
  selectedImages,
  onImageSelect,
  loading
}: ImageGridProps) {
  const [imageModal, setImageModal] = useState<ImageType | null>(null)

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Image
            src="/placeholder-image.svg"
            alt="No images"
            width={48}
            height={48}
            className="text-gray-400"
          />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có ảnh nào
        </h3>
        <p className="text-gray-500 text-center max-w-sm">
          Bắt đầu bằng cách upload ảnh đầu tiên của bạn vào thư viện
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            {/* Checkbox for selection */}
            <div className="absolute top-2 left-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onImageSelect(image.id)
                }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedImages.includes(image.id)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                }`}
              >
                {selectedImages.includes(image.id) && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Public/Private indicator */}
            <div className="absolute top-2 right-2 z-10">
              {image.isPublic ? (
                <div className="bg-green-500 text-white p-1 rounded-full">
                  <Eye className="w-3 h-3" />
                </div>
              ) : (
                <div className="bg-gray-500 text-white p-1 rounded-full">
                  <EyeOff className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Image */}
            <Image
              src={image.path}
              alt={image.originalName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              onClick={() => setImageModal(image)}
            />

            {/* Overlay with image info */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-end">
              <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm font-medium truncate">
                  {image.originalName}
                </p>
                <p className="text-xs text-gray-200">
                  {formatFileSize(image.size)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {imageModal.originalName}
                </h3>
                <button
                  onClick={() => setImageModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Image */}
                <div className="flex-1">
                  <div className="relative aspect-square max-w-lg mx-auto">
                    <Image
                      src={imageModal.path}
                      alt={imageModal.originalName}
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                </div>
                
                {/* Image details */}
                <div className="lg:w-80 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Thông tin ảnh
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Tên file:</dt>
                        <dd className="text-gray-900 truncate ml-2">
                          {imageModal.filename}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Kích thước:</dt>
                        <dd className="text-gray-900">
                          {formatFileSize(imageModal.size)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Loại file:</dt>
                        <dd className="text-gray-900">
                          {imageModal.mimeType}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Trạng thái:</dt>
                        <dd className="flex items-center">
                          {imageModal.isPublic ? (
                            <>
                              <Eye className="w-4 h-4 text-green-500 mr-1" />
                              <span className="text-green-600">Công khai</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 text-gray-500 mr-1" />
                              <span className="text-gray-600">Riêng tư</span>
                            </>
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Ngày tạo:</dt>
                        <dd className="text-gray-900">
                          {formatDate(new Date(imageModal.createdAt))}
                        </dd>
                      </div>
                      {imageModal.folder && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Folder:</dt>
                          <dd className="text-gray-900">
                            {imageModal.folder.name}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
