import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const PROJECTS_KEY = 'portfolio:projects'

// Simple in-memory store for development
let memoryStore: any[] = []

// Try to use Vercel KV if available
async function getKV() {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv')
      return kv
    }
  } catch (error) {
    console.log('KV not available, using memory store')
  }
  return null
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
      const projects = await kvClient.get(PROJECTS_KEY) || []
      return NextResponse.json(projects)
    }
    return NextResponse.json(memoryStore)
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json(memoryStore)
  }
}

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    
    const newProject = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description,
      category: body.category || '',
      link: body.link || '',
      images: body.images || [],
      video: body.video || '',
      createdAt: new Date().toISOString()
    }
    
    const kvClient = await getKV()
    if (kvClient) {
      const projects: any = await kvClient.get(PROJECTS_KEY) || []
      projects.unshift(newProject)
      await kvClient.set(PROJECTS_KEY, projects)
    } else {
      memoryStore.unshift(newProject)
    }
    
    return NextResponse.json(newProject)
  } catch (error) {
    console.error('POST Error:', error)
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
      const projects: any = await kvClient.get(PROJECTS_KEY) || []
      const index = projects.findIndex((p: any) => p.id === id)
      
      if (index !== -1) {
        projects[index] = { ...projects[index], ...updates }
        await kvClient.set(PROJECTS_KEY, projects)
        return NextResponse.json(projects[index])
      }
    } else {
      const index = memoryStore.findIndex((p: any) => p.id === id)
      if (index !== -1) {
        memoryStore[index] = { ...memoryStore[index], ...updates }
        return NextResponse.json(memoryStore[index])
      }
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('PUT Error:', error)
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
      const projects: any = await kvClient.get(PROJECTS_KEY) || []
      const filtered = projects.filter((p: any) => p.id !== id)
      await kvClient.set(PROJECTS_KEY, filtered)
    } else {
      memoryStore = memoryStore.filter((p: any) => p.id !== id)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
