import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasGitHubToken: !!process.env.GITHUB_TOKEN,
    tokenLength: process.env.GITHUB_TOKEN?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: !!process.env.DATABASE_URL
  })
}
