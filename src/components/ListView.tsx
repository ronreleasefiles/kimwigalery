'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  MoreVertical, 
  Eye, 
  EyeOff, 
  Trash2,
  Image as ImageIcon,
  Check
} from 'lucide-react'
import SimpleFolderIcon from '@/components/icons/SimpleFolderIcon'
import { ImageType, FolderType } from '@/types'
import { formatFileSize, formatDate } from '@/lib/utils'

interface ListViewProps {
  folders?: FolderType[]
  images?: ImageType[]
  selectedImages?: string[]
  selectedFolders?: string[]
  onImageSelect?: (imageId: string) => void
  onFolderActionSelect?: (folderId: string) => void
  onRefreshFolders?: () => void
  showFolders?: boolean
}

export default function ListView({
  folders = [],
  images = [],
  selectedImages = [],
  selectedFolders = [],
  onImageSelect,
  onFolderActionSelect,
  onRefreshFolders,
  showFolders = false
}: ListViewProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Bạn có chắc muốn xóa folder này?')) return

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success && onRefreshFolders) {
        onRefreshFolders()
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
    }
    setMenuOpen(null)
  }

  const handleToggleFolderPublic = async (folderId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic })
      })
      const data = await response.json()
      if (data.success && onRefreshFolders) {
        onRefreshFolders()
      }
    } catch (error) {
      console.error('Error toggling folder:', error)
    }
    setMenuOpen(null)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
        <div className="col-span-1"></div>
        <div className="col-span-5 sm:col-span-4">Tên</div>
        <div className="hidden sm:block col-span-2">Loại</div>
        <div className="hidden sm:block col-span-2">Kích thước</div>
        <div className="col-span-3 sm:col-span-2">Ngày tạo</div>
        <div className="col-span-3 sm:col-span-1"></div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200">
        {/* Folders */}
        {showFolders && folders.map((folder) => (
          <div
            key={folder.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer group"
            onClick={() => router.push(`/folder/${folder.id}`)}
          >
            <div className="col-span-1 flex items-center">
              <SimpleFolderIcon className="w-5 h-5" isPublic={folder.isPublic} />
            </div>
            
            <div className="col-span-5 sm:col-span-4 flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {folder.name}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  {folder.isPublic ? (
                    <><Eye className="w-3 h-3 mr-1" />Công khai</>
                  ) : (
                    <><EyeOff className="w-3 h-3 mr-1" />Riêng tư</>
                  )}
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex col-span-2 items-center">
              <span className="text-sm text-gray-500">Folder</span>
            </div>
            
            <div className="hidden sm:flex col-span-2 items-center">
              <span className="text-sm text-gray-500">
                {folder._count?.images || 0} ảnh
              </span>
            </div>
            
            <div className="col-span-3 sm:col-span-2 flex items-center">
              <span className="text-sm text-gray-500">
                {formatDate(new Date(folder.createdAt))}
              </span>
            </div>
            
            <div className="col-span-3 sm:col-span-1 flex items-center justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(menuOpen === folder.id ? null : folder.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen === folder.id && (
                <div className="absolute right-4 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleFolderPublic(folder.id, !folder.isPublic)
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {folder.isPublic ? (
                      <><EyeOff className="w-4 h-4 mr-2" />Chuyển riêng tư</>
                    ) : (
                      <><Eye className="w-4 h-4 mr-2" />Chuyển công khai</>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFolder(folder.id)
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />Xóa folder
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Images */}
        {images.map((image) => (
          <div
            key={image.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 group"
          >
            <div className="col-span-1 flex items-center">
              {onImageSelect && (
                <button
                  onClick={() => onImageSelect(image.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedImages.includes(image.id)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {selectedImages.includes(image.id) && (
                    <Check className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
            
            <div className="col-span-5 sm:col-span-4 flex items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 relative rounded overflow-hidden mr-3 flex-shrink-0">
                  <Image
                    src={image.path}
                    alt={image.originalName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {image.originalName}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    {image.isPublic ? (
                      <><Eye className="w-3 h-3 mr-1" />Công khai</>
                    ) : (
                      <><EyeOff className="w-3 h-3 mr-1" />Riêng tư</>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex col-span-2 items-center">
              <span className="text-sm text-gray-500">{image.mimeType}</span>
            </div>
            
            <div className="hidden sm:flex col-span-2 items-center">
              <span className="text-sm text-gray-500">
                {formatFileSize(image.size)}
              </span>
            </div>
            
            <div className="col-span-3 sm:col-span-2 flex items-center">
              <span className="text-sm text-gray-500">
                {formatDate(new Date(image.createdAt))}
              </span>
            </div>
            
            <div className="col-span-3 sm:col-span-1 flex items-center justify-end">
              <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setMenuOpen(null)}
        />
      )}
    </div>
  )
}
