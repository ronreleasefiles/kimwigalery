'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageType } from '@/types'
import { formatFileSize } from '@/lib/utils'
import { Eye, EyeOff, Play, Check } from 'lucide-react'
import ImageViewer from './ImageViewer'

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
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
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
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <img
            src="/placeholder-image.svg"
            alt="No images"
            className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
          />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 text-center">
          Chưa có ảnh nào
        </h3>
        <p className="text-sm sm:text-base text-gray-500 text-center max-w-sm">
          Bắt đầu bằng cách upload ảnh đầu tiên của bạn vào thư viện
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow touch-manipulation"
            onClick={() => {
              setViewerIndex(index)
              setViewerOpen(true)
            }}
          >
            {/* Checkbox for selection */}
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onImageSelect(image.id)
                }}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedImages.includes(image.id)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                }`}
              >
                {selectedImages.includes(image.id) && (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </button>
            </div>

            {/* Public/Private indicator */}
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-10">
              {image.isPublic ? (
                <div className="bg-green-500 text-white p-1 rounded-full">
                  <Eye className="w-2 h-2 sm:w-3 sm:h-3" />
                </div>
              ) : (
                <div className="bg-gray-500 text-white p-1 rounded-full">
                  <EyeOff className="w-2 h-2 sm:w-3 sm:h-3" />
                </div>
              )}
            </div>

            {/* Media Content - Image or Video */}
            {image.mediaType === 'video' ? (
              <video
                src={image.path}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                muted
                loop
                playsInline
                preload="metadata"
                poster="" // Không hiển thị poster để tránh flash
                onMouseEnter={(e) => {
                  const video = e.target as HTMLVideoElement
                  video.currentTime = 0
                  video.play().catch(() => {
                    // Ignore autoplay errors
                  })
                }}
                onMouseLeave={(e) => {
                  const video = e.target as HTMLVideoElement
                  video.pause()
                  video.currentTime = 0
                }}
                onError={(e) => {
                  console.error('Video load error for:', image.path)
                }}
                onLoadedMetadata={() => {
                  console.log('Video loaded successfully:', image.path)
                }}
                onCanPlay={(e) => {
                  // Đảm bảo video có aspect ratio đúng
                  const video = e.target as HTMLVideoElement
                  video.style.objectFit = 'cover'
                }}
              />
            ) : (
              <Image
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                src={image.path}
                alt={image.originalName}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  console.error('Image load error for:', image.path)
                  // Fallback to a placeholder or hide the image
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-image.svg'
                  target.alt = 'Image not found'
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', image.path)
                }}
              />
            )}

            {/* Video Play Icon */}
            {image.mediaType === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black bg-opacity-50 rounded-full p-3 group-hover:bg-opacity-70 transition-all duration-200">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
            )}

            {/* Overlay with image info - hidden on mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:bg-opacity-40 transition-all duration-200 flex items-end">
              <div className="p-2 sm:p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                <p className="text-xs sm:text-sm font-medium truncate">
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

      {/* Image Viewer */}
      <ImageViewer
        images={images}
        currentIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onImageSelect={onImageSelect}
        selectedImages={selectedImages}
      />
    </>
  )
}
