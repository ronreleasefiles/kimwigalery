// GitHub API helper để upload file lên repository
export interface GitHubUploadResponse {
  success: boolean
  downloadUrl?: string
  error?: string
}

export async function uploadToGitHub(
  file: Buffer,
  filename: string,
  folder: string = 'Gallery'
): Promise<GitHubUploadResponse> {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const REPO_OWNER = 'ronreleasefiles'
    const REPO_NAME = 'filestorage'
    
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN không được cấu hình')
    }

    // Kiểm tra size file - GitHub API giới hạn 25MB
    const maxSize = 25 * 1024 * 1024 // 25MB
    if (file.length > maxSize) {
      throw new Error(`File quá lớn: ${(file.length / 1024 / 1024).toFixed(2)}MB. Giới hạn tối đa: 25MB`)
    }

    console.log(`Uploading file: ${filename}, size: ${(file.length / 1024 / 1024).toFixed(2)}MB`)

    // Chuyển file thành base64
    const base64Content = file.toString('base64')
    
    // Đường dẫn file trong repository
    const filePath = `${folder}/${filename}`
    
    // Upload file lên GitHub qua API
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: `Upload image: ${filename}`,
          content: base64Content,
          branch: 'main'
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`GitHub API error: ${errorData.message}`)
    }

    const data = await response.json()
    
    // Trả về URL để download file
    const downloadUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${filePath}`
    
    return {
      success: true,
      downloadUrl
    }

  } catch (error) {
    console.error('GitHub upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Xóa file từ GitHub repository
export async function deleteFromGitHub(
  filename: string,
  folder: string = 'Gallery'
): Promise<{ success: boolean; error?: string }> {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const REPO_OWNER = 'ronreleasefiles'
    const REPO_NAME = 'filestorage'
    
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN không được cấu hình')
    }

    const filePath = `${folder}/${filename}`
    
    // Lấy SHA của file hiện tại
    const getResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )

    if (!getResponse.ok) {
      throw new Error('File không tồn tại hoặc không thể truy cập')
    }

    const fileData = await getResponse.json()
    
    // Xóa file
    const deleteResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: `Delete image: ${filename}`,
          sha: fileData.sha,
          branch: 'main'
        })
      }
    )

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json()
      throw new Error(`GitHub API error: ${errorData.message}`)
    }

    return { success: true }

  } catch (error) {
    console.error('GitHub delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
