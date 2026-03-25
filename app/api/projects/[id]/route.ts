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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projects = await kv.get<any[]>(PROJECTS_KEY) || []
    const project = projects.find((p: any) => p.id === params.id)
    
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('KV Error:', error)
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
    const projects = await kv.get<any[]>(PROJECTS_KEY) || []
    
    const index = projects.findIndex((p: any) => p.id === params.id)
    if (index !== -1) {
      projects[index] = { ...projects[index], ...body }
      await kv.set(PROJECTS_KEY, projects)
      return NextResponse.json(projects[index])
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('KV Error:', error)
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
    const projects = await kv.get<any[]>(PROJECTS_KEY) || []
    const filtered = projects.filter((p: any) => p.id !== params.id)
    await kv.set(PROJECTS_KEY, filtered)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('KV Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
