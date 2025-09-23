'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { FolderType } from '@/types'
import SimpleFolderIcon from '@/components/icons/SimpleFolderIcon'

interface BreadcrumbProps {
  currentFolder: FolderType | null
}

export default function Breadcrumb({
  currentFolder
}: BreadcrumbProps) {
  const router = useRouter()

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-4 sm:mb-6">
      {/* Home */}
      <button
        onClick={() => router.push('/')}
        className={`flex items-center px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors ${
          !currentFolder ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
        }`}
      >
        <Home className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Trang chủ</span>
      </button>

      {/* Current folder */}
      {currentFolder && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center px-2 py-1 text-blue-600 bg-blue-50 rounded-lg">
            <SimpleFolderIcon className="w-4 h-4 mr-1" isPublic={currentFolder.isPublic} />
            <span className="font-medium truncate max-w-[150px] sm:max-w-none">
              {currentFolder.name}
            </span>
          </div>
        </>
      )}
    </nav>
  )
}
