export interface ImageType {
  id: string
  filename: string
  originalName: string
  path: string
  size: number
  mimeType: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  folderId?: string | null
  folder?: FolderType | null
}

export interface FolderType {
  id: string
  name: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  images?: ImageType[]
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
