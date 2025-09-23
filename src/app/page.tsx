'use client'

import { useState, useEffect } from 'react'
import { ImageType, FolderType } from '@/types'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ImageGrid from '@/components/ImageGrid'
import FolderGrid from '@/components/FolderGrid'
import ListView from '@/components/ListView'
import ViewToggle, { ViewMode } from '@/components/ViewToggle'
import Breadcrumb from '@/components/Breadcrumb'
import ActionBar from '@/components/ActionBar'
import FloatingActionMenu from '@/components/FloatingActionMenu'
import UploadModal from '@/components/UploadModal'
import FolderModal from '@/components/FolderModal'
import { useQueueOperations } from '@/hooks/useQueueOperations'

export default function Home() {
  const [images, setImages] = useState<ImageType[]>([])
  const [folders, setFolders] = useState<FolderType[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [selectedFolders, setSelectedFolders] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('images')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null)

  // Queue operations
  const { queueDelete, queueTogglePublic } = useQueueOperations()

  // Fetch images
  const fetchImages = async (folderId?: string | null) => {
    try {
      const url = folderId 
        ? `/api/images?folderId=${folderId}`
        : '/api/images'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setImages(data.data)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    }
  }

  // Fetch folders
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

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchImages(selectedFolder),
        fetchFolders()
      ])
      setLoading(false)
    }
    
    loadData()
  }, [selectedFolder])

  // Handle folder selection
  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolder(folderId)
    setSelectedImages([])
    setSidebarOpen(false) // Close sidebar on mobile after selection
    
    // Update current folder for breadcrumb
    if (folderId) {
      const folder = folders.find(f => f.id === folderId)
      setCurrentFolder(folder || null)
      setViewMode('images') // Switch to images view when entering folder
    } else {
      setCurrentFolder(null)
      setViewMode('folders') // Switch to folders view when going back to root
    }
  }

  // Handle folder selection from grid
  const handleFolderGridSelect = (folderId: string) => {
    handleFolderSelect(folderId)
  }

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = (folderId: string | null) => {
    handleFolderSelect(folderId)
  }

  // Handle image selection
  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  // Handle folder selection for actions (checkbox)
  const handleFolderActionSelect = (folderId: string) => {
    setSelectedFolders(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  // Handle share
  const handleShare = async (itemIds: string[]) => {
    try {
      const itemType = viewMode === 'folders' ? 'folders' : 'images'
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds, itemType })
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
      const itemType = viewMode === 'folders' ? 'folders' : 'images'
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds, itemType })
      })
      
      if (itemType === 'images' && itemIds.length > 1) {
        // Download zip file
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
        if (data.success) {
          if (data.type === 'single') {
            // Single image download
            const a = document.createElement('a')
            a.href = data.downloadUrl
            a.download = data.filename
            a.click()
          }
        }
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Lỗi khi tải xuống')
    }
  }

  // Handle upload success
  const handleUploadSuccess = () => {
    fetchImages(selectedFolder)
    setShowUploadModal(false)
  }

  // Handle folder creation success
  const handleFolderSuccess = () => {
    fetchFolders()
    setShowFolderModal(false)
  }

  // Handle delete images with queue
  const handleDeleteImages = async () => {
    if (selectedImages.length === 0) return

    try {
      await queueDelete(selectedImages, () => {
        fetchImages(selectedFolder)
        setSelectedImages([])
      })
    } catch (error) {
      console.error('Queue delete error:', error)
      // Error is already handled in queue operations
    }
  }

  // Handle toggle public status with queue
  const handleTogglePublic = async (isPublic: boolean) => {
    if (selectedImages.length === 0) return

    try {
      await queueTogglePublic(selectedImages, isPublic, () => {
        fetchImages(selectedFolder)
        setSelectedImages([])
      })
    } catch (error) {
      console.error('Queue toggle public error:', error)
      // Error is already handled in queue operations
    }
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
          selectedFolder={selectedFolder}
          onFolderSelect={handleFolderSelect}
          onRefreshFolders={fetchFolders}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 lg:ml-0">
          {/* Action Bar */}
          <ActionBar 
            selectedCount={viewMode === 'folders' ? selectedFolders.length : selectedImages.length}
            selectedItems={viewMode === 'folders' ? selectedFolders : selectedImages}
            itemType={viewMode === 'folders' ? 'folders' : 'images'}
            totalCount={viewMode === 'folders' ? folders.length : images.length}
            onShare={handleShare}
            onDownload={handleDownload}
            onTogglePublic={handleTogglePublic}
            onDelete={handleDeleteImages}
            onSelectAll={() => {
              if (viewMode === 'folders') {
                setSelectedFolders(folders.map(f => f.id))
              } else {
                setSelectedImages(images.map(i => i.id))
              }
            }}
            onDeselectAll={() => {
              if (viewMode === 'folders') {
                setSelectedFolders([])
              } else {
                setSelectedImages([])
              }
            }}
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
              folderCount={folders.length}
              imageCount={images.length}
            />

          {/* Content based on view mode */}
          {viewMode === 'folders' && !selectedFolder && (
            <FolderGrid 
              folders={folders}
              onRefreshFolders={fetchFolders}
              loading={loading}
              selectedFolders={selectedFolders}
              onFolderActionSelect={handleFolderActionSelect}
            />
          )}

          {viewMode === 'images' && (
            <ImageGrid 
              images={images}
              selectedImages={selectedImages}
              onImageSelect={handleImageSelect}
              loading={loading}
            />
          )}

          {viewMode === 'list' && (
            <ListView 
              folders={!selectedFolder ? folders : []}
              images={images}
              selectedImages={selectedImages}
              selectedFolders={selectedFolders}
              onImageSelect={handleImageSelect}
              onFolderActionSelect={handleFolderActionSelect}
              onRefreshFolders={fetchFolders}
              showFolders={!selectedFolder}
            />
          )}
          </div>
        </main>
      </div>

      {showUploadModal && (
        <UploadModal 
          folderId={selectedFolder}
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
