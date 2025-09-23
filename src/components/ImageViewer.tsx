'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Heart,
  Info
} from 'lucide-react'
import { ImageType } from '@/types'

interface ImageViewerProps {
  images: ImageType[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onImageSelect?: (imageId: string) => void
  selectedImages?: string[]
}

export default function ImageViewer({
  images,
  currentIndex,
  isOpen,
  onClose,
  onImageSelect,
  selectedImages = []
}: ImageViewerProps) {
  const [index, setIndex] = useState(currentIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showUI, setShowUI] = useState(true)

  const currentImage = images[index]

  // Reset states when opening
  useEffect(() => {
    if (isOpen) {
      setIndex(currentIndex)
      setZoom(1)
      setRotation(0)
      setShowInfo(false)
      setIsLoading(true)
      setShowUI(true)
    }
  }, [isOpen, currentIndex])

  // Toggle UI visibility
  const toggleUI = () => {
    setShowUI(!showUI)
  }

  // Navigation functions
  const handlePrevious = useCallback(() => {
    if (index > 0) {
      setIndex(index - 1)
      setZoom(1)
      setRotation(0)
      setIsLoading(true)
    }
  }, [index])

  const handleNext = useCallback(() => {
    if (index < images.length - 1) {
      setIndex(index + 1)
      setZoom(1)
      setRotation(0)
      setIsLoading(true)
    }
  }, [index, images.length])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        handlePrevious()
        break
      case 'ArrowRight':
        handleNext()
        break
      case 'i':
      case 'I':
        setShowInfo(!showInfo)
        break
      case '+':
      case '=':
        handleZoomIn()
        break
      case '-':
        handleZoomOut()
        break
      case 'r':
      case 'R':
        handleRotate()
        break
    }
  }, [isOpen, showInfo, onClose, handlePrevious, handleNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Zoom functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // Download function
  const handleDownload = async () => {
    if (!currentImage) return

    try {
      const link = document.createElement('a')
      link.href = currentImage.path
      link.download = currentImage.originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  // Share function
  const handleShare = async () => {
    if (!currentImage) return

    try {
      const shareUrl = `${window.location.origin}/share/images/${currentImage.id}`
      await navigator.clipboard.writeText(shareUrl)
      alert('Link đã được sao chép!')
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen || !currentImage) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      {/* Header */}
      {showUI && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent transition-opacity duration-300">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">
              {index + 1} / {images.length}
            </span>
            <span className="text-white text-sm font-medium">
              {currentImage.originalName}
            </span>
          </div>

          <div className="flex items-center space-x-2 self-end">
            {/* Action buttons */}
            <button
              onClick={handleDownload}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Tải xuống (D)"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={handleShare}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Chia sẻ (S)"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {onImageSelect && (
              <button
                onClick={() => onImageSelect(currentImage.id)}
                className={`p-2 rounded-lg transition-colors ${selectedImages.includes(currentImage.id)
                    ? 'bg-blue-600 text-white'
                    : 'text-white hover:bg-white/20'
                  }`}
                title="Chọn ảnh"
              >
                <Heart className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-lg transition-colors ${showInfo ? 'bg-white/20' : 'hover:bg-white/20'
                } text-white`}
              title="Thông tin (I)"
            >
              <Info className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Đóng (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative w-full h-full flex items-center justify-center p-4 pt-20 pb-20">
        {/* Navigation buttons */}
        {showUI && index > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white bg-black/30 hover:bg-black/50 rounded-full transition-all duration-300"
            title="Ảnh trước (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {showUI && index < images.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white bg-black/30 hover:bg-black/50 rounded-full transition-all duration-300"
            title="Ảnh tiếp (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Media container */}
        <div
          className={`relative transition-transform duration-300 ease-out cursor-pointer ${
            currentImage.mediaType === 'video' 
              ? 'flex items-center justify-center w-full h-full' 
              : 'max-w-full max-h-full'
          }`}
          style={{
            transform: currentImage.mediaType === 'video' ? 'none' : `scale(${zoom}) rotate(${rotation}deg)`
          }}
          onClick={toggleUI}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {currentImage.mediaType === 'video' ? (
            <video
              src={currentImage.path}
              className="w-full h-full max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              controls
              autoPlay
              muted
              loop
              playsInline
              style={{
                maxWidth: 'min(90vw, 1200px)',
                maxHeight: 'min(80vh, 800px)',
                aspectRatio: '16/9' // Default aspect ratio
              }}
              onLoadedMetadata={(e) => {
                setIsLoading(false)
                // Tự động điều chỉnh aspect ratio dựa trên video thực tế
                const video = e.target as HTMLVideoElement
                const aspectRatio = video.videoWidth / video.videoHeight
                video.style.aspectRatio = aspectRatio.toString()
              }}
              onError={() => setIsLoading(false)}
            />
          ) : (
            <Image
              src={currentImage.path}
              alt={currentImage.originalName}
              className="max-w-full max-h-full "
              onLoad={() => setIsLoading(false)}
              height={1200}
              width={560}
              objectFit="contain"
            />
          )}
        </div>
      </div>

      {/* Bottom controls */}
      {showUI && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300">
        <div className="flex items-center justify-center p-4 space-x-4">
          {/* Zoom và Rotate controls chỉ cho images */}
          {currentImage.mediaType !== 'video' && (
            <>
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Thu nhỏ (-)"
              >
                <ZoomOut className="w-5 h-5" />
              </button>

              <span className="text-white text-sm min-w-16 text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Phóng to (+)"
              >
                <ZoomIn className="w-5 h-5" />
              </button>

              <button
                onClick={handleRotate}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Xoay (R)"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </>
          )}
          
          {/* Media type indicator */}
          <span className="text-white text-sm px-3 py-1 bg-white/20 rounded-full">
            {currentImage.mediaType === 'video' ? '🎬 Video' : '🖼️ Image'}
          </span>
        </div>
        </div>
      )}

      {/* Info panel */}
      {showUI && showInfo && (
        <div className="absolute top-20 right-4 w-80 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
          <h3 className="font-semibold mb-3">Thông tin ảnh</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-300">Tên file:</dt>
              <dd className="text-right truncate ml-2">{currentImage.filename}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-300">Kích thước:</dt>
              <dd>{formatFileSize(currentImage.size)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-300">Loại file:</dt>
              <dd>{currentImage.mimeType}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-300">Ngày tải lên:</dt>
              <dd>{formatDate(currentImage.createdAt.toString())}</dd>
            </div>
            {currentImage.folder && (
              <div className="flex justify-between">
                <dt className="text-gray-300">Thư mục:</dt>
                <dd>{currentImage.folder.name}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-300">Trạng thái:</dt>
              <dd>
                <span className={`px-2 py-1 rounded-full text-xs ${currentImage.isPublic
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-white'
                  }`}>
                  {currentImage.isPublic ? 'Công khai' : 'Riêng tư'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Thumbnail strip */}
      {showUI && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-2 p-4 bg-black/30 rounded-lg max-w-full overflow-x-auto transition-opacity duration-300">
        {images.slice(Math.max(0, index - 5), index + 6).map((img, i) => {
          const actualIndex = Math.max(0, index - 5) + i
          return (
            <button
              key={img.id}
              onClick={() => {
                setIndex(actualIndex)
                setZoom(1)
                setRotation(0)
                setIsLoading(true)
              }}
              className={`relative w-12 h-12 rounded overflow-hidden flex-shrink-0 ${actualIndex === index
                  ? 'ring-2 ring-white'
                  : 'opacity-60 hover:opacity-80'
                }`}
            >
              <Image
                src={img.path}
                alt={img.originalName}
                fill
                className="object-cover"
                sizes="48px"
              />
            </button>
          )
        })}
        </div>
      )}
    </div>
  )
}
