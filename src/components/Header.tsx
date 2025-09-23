'use client'

import { useState } from 'react'
import { Upload, FolderPlus, Trash2, Eye, EyeOff, Menu, X } from 'lucide-react'

interface HeaderProps {
  selectedCount: number
  onDeleteSelected: () => void
  onTogglePublic: (isPublic: boolean) => void
  onToggleSidebar?: () => void
}

export default function Header({
  selectedCount,
  onDeleteSelected,
  onTogglePublic,
  onToggleSidebar
}: HeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo và menu button */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 hidden sm:block">
              Kimwi Gallery
            </h1>
          </div>

          {/* Desktop action buttons */}
          

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {showMobileMenu ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              {selectedCount > 0 && (
                <div className="text-sm text-gray-600 mb-3">
                  Đã chọn {selectedCount} ảnh
                </div>
              )}
              

              {selectedCount > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <button
                    onClick={() => {
                      onTogglePublic(true)
                      setShowMobileMenu(false)
                    }}
                    className="flex items-center justify-center px-2 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Công khai
                  </button>
                  
                  <button
                    onClick={() => {
                      onTogglePublic(false)
                      setShowMobileMenu(false)
                    }}
                    className="flex items-center justify-center px-2 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <EyeOff className="w-4 h-4 mr-1" />
                    Riêng tư
                  </button>
                  
                  <button
                    onClick={() => {
                      onDeleteSelected()
                      setShowMobileMenu(false)
                    }}
                    className="flex items-center justify-center px-2 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Xóa
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
