'use client'

import { useState } from 'react'
import { Plus, Upload, FolderPlus, X } from 'lucide-react'

interface FloatingActionMenuProps {
  onUpload: () => void
  onCreateFolder: () => void
}

export default function FloatingActionMenu({
  onUpload,
  onCreateFolder
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Menu items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          {/* Upload ảnh */}
          <div className="flex items-center">
            <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-lg mr-3 whitespace-nowrap shadow-lg">
              Upload ảnh
            </span>
            <button
              onClick={() => handleAction(onUpload)}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>

          {/* Tạo folder */}
          <div className="flex items-center">
            <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-lg mr-3 whitespace-nowrap shadow-lg">
              Tạo folder
            </span>
            <button
              onClick={() => handleAction(onCreateFolder)}
              className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <FolderPlus className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={toggleMenu}
        className={`w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        } hover:scale-105`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
