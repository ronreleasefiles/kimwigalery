interface FolderIconProps {
  className?: string
  isPublic?: boolean
  isEmpty?: boolean
}

export default function FolderIcon({ 
  className = "w-12 h-12", 
  isPublic = false,
  isEmpty = false 
}: FolderIconProps) {
  const folderColor = isPublic ? "#3B82F6" : "#6B7280" // Blue for public, gray for private
  const folderLightColor = isPublic ? "#DBEAFE" : "#F3F4F6"
  
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simplified folder */}
      <path
        d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H12L10 5H5C3.89543 5 3 5.89543 3 7Z"
        fill={folderColor}
        fillOpacity="0.2"
        stroke={folderColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Status indicator */}
      {isPublic && (
        <circle cx="18" cy="9" r="2" fill="#10B981" opacity="0.8" />
      )}
    </svg>
  )
}
