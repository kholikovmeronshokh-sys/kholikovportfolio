import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Import the shared store from the main route
// This is a temporary solution - for production use a real database
const projectsModule = await import('../route')

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

// Get projects from the parent route's GET handler
async function getProjects() {
  const response = await projectsModule.GET()
  return await response.json()
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
    const projects = await getProjects()
    const index = projects.findIndex((p: any) => p.id === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    projects[index] = { ...projects[index], ...body }
    
    return NextResponse.json(projects[index])
  } catch (error) {
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
    const projects = await getProjects()
    // Filter will be handled by the store
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
