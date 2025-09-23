'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MoreVertical, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2,
  Image as ImageIcon
} from 'lucide-react'
import { FolderType } from '@/types'
import { formatDate } from '@/lib/utils'
import FolderIcon from '@/components/icons/FolderIcon'

interface FolderGridProps {
  folders: FolderType[]
  onRefreshFolders: () => void
  loading?: boolean
  selectedFolders?: string[]
  onFolderActionSelect?: (folderId: string) => void
}

export default function FolderGrid({
  folders,
  onRefreshFolders,
  loading = false,
  selectedFolders = [],
  onFolderActionSelect
}: FolderGridProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  // Xử lý xóa folder
  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Bạn có chắc muốn xóa folder này? Các ảnh trong folder sẽ được chuyển về thư mục gốc.')) {
      return
    }

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        onRefreshFolders()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      alert('Lỗi khi xóa folder')
    }
    
    setMenuOpen(null)
  }

  // Xử lý thay đổi trạng thái công khai/riêng tư
  const handleTogglePublic = async (folderId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublic })
      })

      const data = await response.json()

      if (data.success) {
        onRefreshFolders()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error toggling folder public status:', error)
      alert('Lỗi khi cập nhật trạng thái folder')
    }
    
    setMenuOpen(null)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="w-12 h-12 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FolderIcon className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 text-center">
          Chưa có folder nào
        </h3>
        <p className="text-sm sm:text-base text-gray-500 text-center max-w-sm">
          Tạo folder đầu tiên để tổ chức ảnh của bạn
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
      {folders.map((folder) => (
        <div
          key={folder.id}
          className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          {/* Selection checkbox */}
          {onFolderActionSelect && (
            <div className="absolute top-2 left-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFolderActionSelect(folder.id)
                }}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedFolders.includes(folder.id)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                }`}
              >
                {selectedFolders.includes(folder.id) && (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* Menu button */}
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(menuOpen === folder.id ? null : folder.id)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown menu */}
            {menuOpen === folder.id && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTogglePublic(folder.id, !folder.isPublic)
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {folder.isPublic ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Chuyển riêng tư
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Chuyển công khai
                    </>
                  )}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteFolder(folder.id)
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa folder
                </button>
              </div>
            )}
          </div>

          {/* Folder content */}
          <div
            onClick={() => router.push(`/folder/${folder.id}`)}
            className="p-4"
          >
            {/* Folder icon */}
            <div className="flex items-center justify-center mb-3">
              <FolderIcon 
                className="w-12 h-12"
                isPublic={folder.isPublic}
                isEmpty={(folder._count?.images || 0) === 0}
              />
            </div>

            {/* Folder info */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                {folder.name}
              </h3>
              
              <div className="flex items-center justify-center text-xs text-gray-500 space-x-2">
                <div className="flex items-center">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  <span>{folder._count?.images || 0}</span>
                </div>
                <span>•</span>
                <span>{formatDate(new Date(folder.createdAt))}</span>
              </div>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-blue-50 bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-200 pointer-events-none" />
        </div>
      ))}

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
