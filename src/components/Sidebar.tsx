'use client'

import { useState } from 'react'
import { FolderType } from '@/types'
import { 
  Folder, 
  FolderOpen, 
  Home, 
  Eye, 
  EyeOff, 
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react'

interface SidebarProps {
  folders: FolderType[]
  selectedFolder: string | null
  onFolderSelect: (folderId: string | null) => void
  onRefreshFolders: () => void
}

export default function Sidebar({
  folders,
  selectedFolder,
  onFolderSelect,
  onRefreshFolders
}: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

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
        if (selectedFolder === folderId) {
          onFolderSelect(null)
        }
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      alert('Lỗi khi xóa folder')
    }
    
    setMenuOpen(null)
  }

  const handleToggleFolderPublic = async (folderId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: !isPublic }),
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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-4">
          Thư viện ảnh
        </h2>
        
        {/* Tất cả ảnh */}
        <button
          onClick={() => onFolderSelect(null)}
          className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
            selectedFolder === null
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Home className="w-4 h-4 mr-3" />
          Tất cả ảnh
        </button>

        {/* Danh sách folder */}
        <div className="mt-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Folders
          </h3>
          
          {folders.length === 0 ? (
            <p className="text-sm text-gray-500 italic px-3 py-2">
              Chưa có folder nào
            </p>
          ) : (
            <div className="space-y-1">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`group relative flex items-center rounded-lg transition-colors ${
                    selectedFolder === folder.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => onFolderSelect(folder.id)}
                    className="flex-1 flex items-center px-3 py-2 text-sm"
                  >
                    {selectedFolder === folder.id ? (
                      <FolderOpen className="w-4 h-4 mr-3 flex-shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 mr-3 flex-shrink-0" />
                    )}
                    <span className="truncate flex-1 text-left">
                      {folder.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {folder._count?.images || 0}
                    </span>
                  </button>

                  {/* Menu dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === folder.id ? null : folder.id)}
                      className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {menuOpen === folder.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleToggleFolderPublic(folder.id, folder.isPublic)}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {folder.isPublic ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-3" />
                                Chuyển thành riêng tư
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-3" />
                                Chuyển thành công khai
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteFolder(folder.id)}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Xóa folder
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Public/Private indicator */}
                  <div className="absolute top-1 right-1">
                    {folder.isPublic ? (
                      <Eye className="w-3 h-3 text-green-500" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
