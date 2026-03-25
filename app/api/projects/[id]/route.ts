import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const PROJECTS_KEY = 'portfolio:projects'

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

async function getProjects() {
  const kvClient = await getKV()
  if (kvClient) {
    return await kvClient.get<any[]>(PROJECTS_KEY) || []
  }
  // Fallback: call parent route
  const response = await fetch(new URL('/api/projects', process.env.VERCEL_URL || 'http://localhost:3000'))
  return await response.json()
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projects = await getProjects()
    const project = projects.find((p: any) => p.id === params.id)
    
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Storage Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const kvClient = await getKV()
    
    if (kvClient) {
      const projects = await kvClient.get<any[]>(PROJECTS_KEY) || []
      const index = projects.findIndex((p: any) => p.id === params.id)
      if (index !== -1) {
        projects[index] = { ...projects[index], ...body }
        await kvClient.set(PROJECTS_KEY, projects)
        return NextResponse.json(projects[index])
      }
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('Storage Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const kvClient = await getKV()
    
    if (kvClient) {
      const projects = await kvClient.get<any[]>(PROJECTS_KEY) || []
      const filtered = projects.filter((p: any) => p.id !== params.id)
      await kvClient.set(PROJECTS_KEY, projects)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Storage Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
