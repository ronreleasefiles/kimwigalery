export interface ImageType {
  id: string
  filename: string
  originalName: string
  path: string
  base64Data: string
  size: number
  mimeType: string
  mediaType: string // "image" hoặc "video"
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  folderId?: string | null
  folder?: FolderType | null
  metadata?: string | null // JSON metadata cho chunked files
}

export interface FolderType {
  id: string
  name: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  images?: ImageType[]
  _count?: {
    images: number
  }
}

export interface UploadResponse {
  success: boolean
  message: string
  data?: ImageType | ImageType[]
}

export interface DeleteResponse {
  success: boolean
  message: string
}
