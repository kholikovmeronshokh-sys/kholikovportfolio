import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// In-memory storage (will reset on server restart, but works on Vercel)
// For production, use a database like MongoDB, PostgreSQL, or Vercel KV
let projectsStore: any[] = []

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  
  const token = authHeader.split(' ')[1]
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'secret')
    return true
  } catch {
    return false
  }
}

export async function GET() {
  return NextResponse.json(projectsStore)
}

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    
    const newProject = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }
    
    projectsStore.unshift(newProject)
    
    return NextResponse.json(newProject)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
