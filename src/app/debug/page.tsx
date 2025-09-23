'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function DebugPage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/images')
        const data = await response.json()
        setImages(data.data || [])
      } catch (error) {
        console.error('Error fetching images:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Debug Images
        </h1>
        
        <div className="space-y-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{image.originalName}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Info */}
                <div>
                  <h4 className="font-medium mb-2">Image Data:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(image, null, 2)}
                  </pre>
                </div>
                
                {/* Image Preview */}
                <div>
                  <h4 className="font-medium mb-2">Preview:</h4>
                  <div className="relative w-full h-48 bg-gray-100 rounded">
                    <Image
                      src={image.path}
                      alt={image.originalName}
                      fill
                      className="object-cover rounded"
                      onError={(e) => {
                        console.error('Image load error:', e)
                        console.error('Failed URL:', image.path)
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', image.path)
                      }}
                    />
                  </div>
                  
                  {/* Direct link test */}
                  <div className="mt-2">
                    <a 
                      href={image.path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Test direct link
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {images.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No images found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
