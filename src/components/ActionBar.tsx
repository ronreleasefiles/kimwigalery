'use client'

import { useState } from 'react'
import {
  Share2,
  Download,
  Eye,
  EyeOff,
  Trash2,
  MoreHorizontal,
  Link,
  Copy,
  CheckSquare,
  Square
} from 'lucide-react'

interface ActionBarProps {
  selectedCount: number
  selectedItems: string[]
  itemType: 'images' | 'folders'
  totalCount: number
  onShare: (itemIds: string[]) => void
  onDownload: (itemIds: string[]) => void
  onTogglePublic: (isPublic: boolean) => void
  onDelete: () => void
  onSelectAll: () => void
  onDeselectAll: () => void
}

export default function ActionBar({
  selectedCount,
  selectedItems,
  itemType,
  totalCount,
  onShare,
  onDownload,
  onTogglePublic,
  onDelete,
  onSelectAll,
  onDeselectAll
}: ActionBarProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)

  if (selectedCount === 0) return null

  const handleShare = () => {
    onShare(selectedItems)
    setShowShareMenu(false)
  }

  const handleCopyLink = () => {
    // Generate shareable link
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/share/${itemType}/${selectedItems.join(',')}`

    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Link đã được sao chép!')
    }).catch(() => {
      alert('Không thể sao chép link')
    })

    setShowShareMenu(false)
  }

  return (
    <div className="sticky top-16 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex items-start md:items-center justify-between flex-col md:flex-row">
        {/* Selection info */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            Đã chọn {selectedCount} {itemType === 'images' ? 'ảnh' : 'folder'}
          </span>
          
          {/* Select All / Deselect All buttons */}
          {selectedCount > 0 && selectedCount < totalCount && (
            <button
              onClick={onSelectAll}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              Chọn tất cả ({totalCount})
            </button>
          )}
          
          {selectedCount === totalCount && totalCount > 0 && (
            <button
              onClick={onDeselectAll}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
            >
              <Square className="w-3 h-3 mr-1" />
              Bỏ chọn tất cả
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Share menu */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Share2 className="w-4 h-4 mr-2" />
            </button>

            {showShareMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-40">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Chia sẻ
                </button>
                <button
                  onClick={handleShare}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Sao chép link
                </button>
              </div>
            )}
          </div>

          {/* Download */}
          <button
            onClick={() => onDownload(selectedItems)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
          </button>

          {/* Toggle Public */}
          <div className="flex">
            <button
              onClick={() => onTogglePublic(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-l-lg hover:bg-green-100"
            >
              <Eye className="w-4 h-4 mr-1" />
            </button>
            <button
              onClick={() => onTogglePublic(false)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border-l-0 border border-gray-200 rounded-r-lg hover:bg-gray-100"
            >
              <EyeOff className="w-4 h-4 mr-1" />
            </button>
          </div>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4 mr-2" />
          </button>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  )
}
