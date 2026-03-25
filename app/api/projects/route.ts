import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const PROJECTS_KEY = 'portfolio:projects'

// In-memory fallback for development (when KV is not available)
let memoryStore: any[] = []

// Check if Vercel KV is available
const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN

async function getKV() {
  if (!hasKV) return null
  try {
    const { kv } = await import('@vercel/kv')
    return kv
  } catch {
    return null
  }
}

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
  try {
    const kvClient = await getKV()
    if (kvClient) {
      const projects = await kvClient.get<any[]>(PROJECTS_KEY) || []
      return NextResponse.json(projects)
    } else {
      // Fallback to memory store for development
      return NextResponse.json(memoryStore)
    }
  } catch (error) {
    console.error('Storage Error:', error)
    return NextResponse.json(memoryStore)
  }
}

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const kvClient = await getKV()
    
    const newProject = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }
    
    if (kvClient) {
      const projects = await kvClient.get<any[]>(PROJECTS_KEY) || []
      projects.unshift(newProject)
      await kvClient.set(PROJECTS_KEY, projects)
    } else {
      // Fallback to memory store
      memoryStore.unshift(newProject)
    }
    
    return NextResponse.json(newProject)
  } catch (error) {
    console.error('Storage Error:', error)
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
    const kvClient = await getKV()
    
    if (kvClient) {
      const projects = await kvClient.get<any[]>(PROJECTS_KEY) || []
      const index = projects.findIndex((p: any) => p.id === id)
      if (index !== -1) {
        projects[index] = { ...projects[index], ...updates }
        await kvClient.set(PROJECTS_KEY, projects)
        return NextResponse.json(projects[index])
      }
    } else {
      // Fallback to memory store
      const index = memoryStore.findIndex((p: any) => p.id === id)
      if (index !== -1) {
        memoryStore[index] = { ...memoryStore[index], ...updates }
        return NextResponse.json(memoryStore[index])
      }
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('Storage Error:', error)
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
    const kvClient = await getKV()
    
    if (kvClient) {
      const projects = await kvClient.get<any[]>(PROJECTS_KEY) || []
      const filtered = projects.filter((p: any) => p.id !== id)
      await kvClient.set(PROJECTS_KEY, filtered)
    } else {
      // Fallback to memory store
      memoryStore = memoryStore.filter((p: any) => p.id !== id)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Storage Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
