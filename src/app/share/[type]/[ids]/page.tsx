'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Download, Eye, Calendar } from 'lucide-react'
import { ImageType, FolderType } from '@/types'
import { formatFileSize, formatDate } from '@/lib/utils'
import FolderIcon from '@/components/icons/FolderIcon'

export default function SharePage() {
  const params = useParams()
  const { type, ids } = params
  const [items, setItems] = useState<(ImageType | FolderType)[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchSharedItems = async () => {
      try {
        const itemIds = (ids as string).split(',')
        const endpoint = type === 'images' ? '/api/images' : '/api/folders'
        
        const response = await fetch(`${endpoint}?publicOnly=true`)
        const data = await response.json()
        
        if (data.success) {
          const filteredItems = data.data.filter((item: any) => 
            itemIds.includes(item.id) && item.isPublic
          )
          setItems(filteredItems)
        } else {
          setError('Không thể tải dữ liệu')
        }
      } catch (error) {
        console.error('Error fetching shared items:', error)
        setError('Lỗi khi tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }

    fetchSharedItems()
  }, [type, ids])

  const handleDownload = async (item: ImageType | FolderType) => {
    if (type === 'images') {
      const image = item as ImageType
      try {
        const response = await fetch(image.path)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = image.originalName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Download error:', error)
        alert('Không thể tải file')
      }
    }
  }

  const handleDownloadAll = async () => {
    for (const item of items) {
      await handleDownload(item)
      // Delay để tránh spam download
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy nội dung
          </h1>
          <p className="text-gray-600">
            {error || 'Nội dung không tồn tại hoặc không được chia sẻ công khai'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Kimwi Gallery - Chia sẻ
              </h1>
              <p className="text-sm text-gray-600">
                {items.length} {type === 'images' ? 'ảnh' : 'folder'} được chia sẻ
              </p>
            </div>
            
            {type === 'images' && items.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Tải tất cả
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {type === 'images' ? (
          /* Images Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <Image
                  src={(image as ImageType).path}
                  alt={(image as ImageType).originalName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => handleDownload(image)}
                    className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-all"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-xs font-medium truncate">
                    {(image as ImageType).originalName}
                  </p>
                  <p className="text-white/80 text-xs">
                    {formatFileSize((image as ImageType).size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Folders Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {items.map((folder) => (
              <div
                key={folder.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  <FolderIcon 
                    className="w-12 h-12 mb-3"
                    isPublic={true}
                  />
                  <h3 className="text-sm font-medium text-gray-900 truncate w-full mb-1">
                    {(folder as FolderType).name}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(new Date(folder.createdAt))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Được chia sẻ từ Kimwi Gallery
          </p>
        </div>
      </footer>
    </div>
  )
}
