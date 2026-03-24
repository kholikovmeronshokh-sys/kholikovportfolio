import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Vercel KV alternative - using Vercel Postgres or external DB
// For now, we'll use a simple JSON approach with Vercel Blob or external storage
// This is a temporary in-memory store that will work across requests in the same instance

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

export async function PUT(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    const index = projectsStore.findIndex((p: any) => p.id === id)
    if (index !== -1) {
      projectsStore[index] = { ...projectsStore[index], ...updates }
      return NextResponse.json(projectsStore[index])
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    projectsStore = projectsStore.filter((p: any) => p.id !== id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
