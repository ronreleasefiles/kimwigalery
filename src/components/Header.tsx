'use client'

import { Upload, FolderPlus, Trash2, Eye, EyeOff } from 'lucide-react'

interface HeaderProps {
  selectedCount: number
  onUpload: () => void
  onCreateFolder: () => void
  onDeleteSelected: () => void
  onTogglePublic: (isPublic: boolean) => void
}

export default function Header({
  selectedCount,
  onUpload,
  onCreateFolder,
  onDeleteSelected,
  onTogglePublic
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo và title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Kimwi Gallery
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            {selectedCount > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  Đã chọn {selectedCount} ảnh
                </span>
                
                <button
                  onClick={() => onTogglePublic(true)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Công khai
                </button>
                
                <button
                  onClick={() => onTogglePublic(false)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Riêng tư
                </button>
                
                <button
                  onClick={onDeleteSelected}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </button>
              </>
            )}
            
            <button
              onClick={onCreateFolder}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Tạo folder
            </button>
            
            <button
              onClick={onUpload}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload ảnh
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
