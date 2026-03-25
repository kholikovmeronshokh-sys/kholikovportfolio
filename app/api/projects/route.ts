import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { kv } from '@vercel/kv'

const PROJECTS_KEY = 'portfolio:projects'

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
    const projects = await kv.get<any[]>(PROJECTS_KEY) || []
    return NextResponse.json(projects)
  } catch (error) {
    console.error('KV Error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const projects = await kv.get<any[]>(PROJECTS_KEY) || []
    
    const newProject = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }
    
    projects.unshift(newProject)
    await kv.set(PROJECTS_KEY, projects)
    
    return NextResponse.json(newProject)
  } catch (error) {
    console.error('KV Error:', error)
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
    const projects = await kv.get<any[]>(PROJECTS_KEY) || []
    
    const index = projects.findIndex((p: any) => p.id === id)
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates }
      await kv.set(PROJECTS_KEY, projects)
      return NextResponse.json(projects[index])
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('KV Error:', error)
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
    const projects = await kv.get<any[]>(PROJECTS_KEY) || []
    
    const filtered = projects.filter((p: any) => p.id !== id)
    await kv.set(PROJECTS_KEY, filtered)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('KV Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
