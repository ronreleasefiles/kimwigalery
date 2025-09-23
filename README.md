# 🎬 Kimwi Gallery

A modern, full-featured image and video gallery built with Next.js 15, featuring chunked upload for large files, video support, and optimized GitHub storage.

## ✨ Features

- 🖼️ **Image & Video Gallery** - Support for images and videos with responsive display
- 📤 **Chunked Upload** - Upload large files (>25MB) by splitting into chunks
- 🎬 **Video Player** - Built-in video player with proper aspect ratio handling
- 📱 **Responsive Design** - Mobile-first design with touch-friendly interface
- 🗂️ **Folder Management** - Organize media into folders
- 🔒 **Privacy Controls** - Public/private media management
- 🗑️ **Smart Delete** - Optimized deletion with GitHub storage cleanup
- ⚡ **Performance** - Optimized for speed with virtual file serving

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: GitHub API for file storage
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React icons
- **File Handling**: Chunked upload system for large files

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Prisma Accelerate)
- GitHub token with repo permissions

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database
DATABASE_URL="your_postgresql_database_url"

# GitHub Token for file storage
# Create at: https://github.com/settings/tokens
# Required permissions: repo (Full control of repositories)
GITHUB_TOKEN="your_github_token_here"
```

## 🛠️ Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/ronreleasefiles/kimwigalery.git
cd kimwi-gallery
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup database**
```bash
npx prisma generate
npx prisma migrate dev
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🌐 Deploy on Vercel

### Automatic Deployment

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub: `ronreleasefiles/kimwigalery`

2. **Configure Environment Variables**
   ```
   DATABASE_URL=your_postgresql_url
   GITHUB_TOKEN=your_github_token
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - Build is optimized with lint/type checking disabled for faster deployment

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   │   ├── upload/    # Chunked upload endpoints
│   │   ├── serve/     # Virtual file serving
│   │   └── images/    # Image management APIs
│   └── components/    # React components
├── lib/               # Utility functions
├── hooks/             # Custom React hooks
└── types/             # TypeScript definitions
```

## 🎯 Key Features Explained

### Chunked Upload System
- Automatically splits large files (>25MB) into smaller chunks
- Bypasses GitHub's 25MB file size limit
- Provides progress tracking and error recovery

### Virtual File Serving
- Large files served on-demand from chunks via `/api/serve/[sessionId]/[filename]`
- Supports video streaming with range requests
- Optimized for performance and storage efficiency

### Smart Storage Management
- Regular files stored in `Gallery/` folder
- Chunked files stored in `temp_chunks/[sessionId]/`
- Automatic cleanup when files are deleted

## 🔧 Build Configuration

The project is configured for optimal Vercel deployment:

- **ESLint**: Disabled during builds (`ignoreDuringBuilds: true`)
- **TypeScript**: Build errors ignored (`ignoreBuildErrors: true`)
- **Prisma**: Auto-generates client during build
- **API Routes**: 60-second timeout for large file operations

## 📊 Performance

- **Upload**: Handles files up to several GB with chunked upload
- **Display**: Responsive image/video grid with lazy loading
- **Storage**: Optimized GitHub API usage with proper cleanup
- **Build**: Fast builds with disabled type checking for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

**Ready for production deployment on Vercel! 🚀**
