'use client'

import { Grid3X3, List, Folder } from 'lucide-react'

export type ViewMode = 'folders' | 'images' | 'list'

interface ViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  folderCount: number
  imageCount: number
}

export default function ViewToggle({
  currentView,
  onViewChange,
  folderCount,
  imageCount
}: ViewToggleProps) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      {/* View info */}
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Folder className="w-4 h-4 mr-1" />
          <span>{folderCount} folder</span>
        </div>
        <div className="flex items-center">
          <Grid3X3 className="w-4 h-4 mr-1" />
          <span>{imageCount} ảnh</span>
        </div>
      </div>

      {/* View toggle buttons */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onViewChange('folders')}
          className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            currentView === 'folders'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Folder className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Folders</span>
        </button>
        
        <button
          onClick={() => onViewChange('images')}
          className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            currentView === 'images'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Grid3X3 className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Grid</span>
        </button>
        
        <button
          onClick={() => onViewChange('list')}
          className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            currentView === 'list'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <List className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">List</span>
        </button>
      </div>
    </div>
  )
}
