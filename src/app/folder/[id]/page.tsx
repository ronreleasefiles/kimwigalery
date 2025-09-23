'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ImageType, FolderType } from '@/types'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ImageGrid from '@/components/ImageGrid'
import ListView from '@/components/ListView'
import ViewToggle, { ViewMode } from '@/components/ViewToggle'
import Breadcrumb from '@/components/Breadcrumb'
import ActionBar from '@/components/ActionBar'
import FloatingActionMenu from '@/components/FloatingActionMenu'
import UploadModal from '@/components/UploadModal'
import FolderModal from '@/components/FolderModal'

export default function FolderPage() {
  const params = useParams()
  const router = useRouter()
  const folderId = params.id as string

  const [images, setImages] = useState<ImageType[]>([])
  const [folders, setFolders] = useState<FolderType[]>([])
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('images')

  // Fetch folder data
  const fetchFolder = async () => {
    try {
      const response = await fetch(`/api/folders/${folderId}`)
      const data = await response.json()
      
      if (data.success) {
        setCurrentFolder(data.data)
      } else {
        console.error('Folder not found')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching folder:', error)
      router.push('/')
    }
  }

  // Fetch images in folder
  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/images?folderId=${folderId}`)
      const data = await response.json()
      
      if (data.success) {
        setImages(data.data)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all folders for sidebar
  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders')
      const data = await response.json()
      
      if (data.success) {
        setFolders(data.data)
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchFolder(),
        fetchImages(),
        fetchFolders()
      ])
      setLoading(false)
    }
    
    loadData()
  }, [folderId])

  // Handle navigation
  const handleFolderSelect = (selectedFolderId: string | null) => {
    if (selectedFolderId) {
      router.push(`/folder/${selectedFolderId}`)
    } else {
      router.push('/')
    }
    setSidebarOpen(false)
  }

  const handleBreadcrumbNavigate = (selectedFolderId: string | null) => {
    if (selectedFolderId) {
      router.push(`/folder/${selectedFolderId}`)
    } else {
      router.push('/')
    }
  }

  // Handle image selection
  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  // Handle share
  const handleShare = async (itemIds: string[]) => {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds, itemType: 'images' })
      })
      
      const data = await response.json()
      if (data.success) {
        navigator.clipboard.writeText(data.shareUrl)
        alert('Link chia sẻ đã được sao chép!')
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Share error:', error)
      alert('Lỗi khi tạo link chia sẻ')
    }
  }

  // Handle download
  const handleDownload = async (itemIds: string[]) => {
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds, itemType: 'images' })
      })
      
      if (itemIds.length > 1) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `images_${Date.now()}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        if (data.success && data.type === 'single') {
          const a = document.createElement('a')
          a.href = data.downloadUrl
          a.download = data.filename
          a.click()
        }
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Lỗi khi tải xuống')
    }
  }

  // Handle delete images
  const handleDeleteImages = async () => {
    if (selectedImages.length === 0) return
    
    if (!confirm(`Bạn có chắc muốn xóa ${selectedImages.length} ảnh đã chọn?`)) {
      return
    }

    try {
      const response = await fetch('/api/images/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: selectedImages })
      })

      const data = await response.json()
      if (data.success) {
        fetchImages()
        setSelectedImages([])
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error deleting images:', error)
      alert('Lỗi khi xóa ảnh')
    }
  }

  // Handle toggle public
  const handleTogglePublic = async (isPublic: boolean) => {
    if (selectedImages.length === 0) return

    try {
      const response = await fetch('/api/images/toggle-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: selectedImages, isPublic })
      })

      const data = await response.json()
      if (data.success) {
        fetchImages()
        setSelectedImages([])
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error toggling public status:', error)
      alert('Lỗi khi cập nhật trạng thái ảnh')
    }
  }

  // Handle upload success
  const handleUploadSuccess = () => {
    fetchImages()
    setShowUploadModal(false)
  }

  // Handle folder creation success
  const handleFolderSuccess = () => {
    fetchFolders()
    setShowFolderModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        selectedCount={selectedImages.length}
        onDeleteSelected={handleDeleteImages}
        onTogglePublic={handleTogglePublic}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex">
        <Sidebar 
          folders={folders}
          selectedFolder={folderId}
          onFolderSelect={handleFolderSelect}
          onRefreshFolders={fetchFolders}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 lg:ml-0">
          {/* Action Bar */}
          <ActionBar 
            selectedCount={selectedImages.length}
            selectedItems={selectedImages}
            itemType="images"
            onShare={handleShare}
            onDownload={handleDownload}
            onTogglePublic={handleTogglePublic}
            onDelete={handleDeleteImages}
          />

          <div className="p-3 sm:p-6">
            {/* Breadcrumb */}
            <Breadcrumb 
              currentFolder={currentFolder}
            />

            {/* View Toggle */}
            <ViewToggle 
              currentView={viewMode}
              onViewChange={setViewMode}
              folderCount={0}
              imageCount={images.length}
            />

            {/* Content */}
            {viewMode === 'images' ? (
              <ImageGrid 
                images={images}
                selectedImages={selectedImages}
                onImageSelect={handleImageSelect}
                loading={loading}
              />
            ) : (
              <ListView 
                folders={[]}
                images={images}
                selectedImages={selectedImages}
                onImageSelect={handleImageSelect}
                showFolders={false}
              />
            )}
          </div>
        </main>
      </div>

      {showUploadModal && (
        <UploadModal 
          folderId={folderId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {showFolderModal && (
        <FolderModal 
          onClose={() => setShowFolderModal(false)}
          onSuccess={handleFolderSuccess}
        />
      )}

      {/* Floating Action Menu */}
      <FloatingActionMenu 
        onUpload={() => setShowUploadModal(true)}
        onCreateFolder={() => setShowFolderModal(true)}
      />
    </div>
  )
}
