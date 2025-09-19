'use client'

import { useState, useEffect } from 'react'
import { ImageType, FolderType } from '@/types'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ImageGrid from '@/components/ImageGrid'
import UploadModal from '@/components/UploadModal'
import FolderModal from '@/components/FolderModal'

export default function Home() {
  const [images, setImages] = useState<ImageType[]>([])
  const [folders, setFolders] = useState<FolderType[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [loading, setLoading] = useState(true)

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
  }

  // Handle image selection
  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
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

  // Handle delete images
  const handleDeleteImages = async () => {
    if (selectedImages.length === 0) return

    try {
      const response = await fetch('/api/images/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds: selectedImages }),
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchImages(selectedFolder)
        setSelectedImages([])
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error deleting images:', error)
      alert('Lỗi khi xóa ảnh')
    }
  }

  // Handle toggle public status
  const handleTogglePublic = async (isPublic: boolean) => {
    if (selectedImages.length === 0) return

    try {
      const response = await fetch('/api/images/toggle-public', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageIds: selectedImages, 
          isPublic 
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchImages(selectedFolder)
        setSelectedImages([])
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error toggling public status:', error)
      alert('Lỗi khi cập nhật trạng thái ảnh')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        selectedCount={selectedImages.length}
        onUpload={() => setShowUploadModal(true)}
        onCreateFolder={() => setShowFolderModal(true)}
        onDeleteSelected={handleDeleteImages}
        onTogglePublic={handleTogglePublic}
      />
      
      <div className="flex">
        <Sidebar 
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={handleFolderSelect}
          onRefreshFolders={fetchFolders}
        />
        
        <main className="flex-1 p-6">
          <ImageGrid 
            images={images}
            selectedImages={selectedImages}
            onImageSelect={handleImageSelect}
            loading={loading}
          />
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
    </div>
  )
}
