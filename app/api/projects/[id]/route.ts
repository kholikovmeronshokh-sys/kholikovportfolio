import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Import from parent to share the same store
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await projectsModule.GET()
    const projects = await response.json()
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
    const updateBody = { id: params.id, ...body }
    
    const response = await projectsModule.PUT(
      new NextRequest(request.url, {
        method: 'PUT',
        headers: request.headers,
        body: JSON.stringify(updateBody)
      })
    )
    
    return response
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
    const url = new URL(request.url)
    url.searchParams.set('id', params.id)
    
    const response = await projectsModule.DELETE(
      new NextRequest(url.toString(), {
        method: 'DELETE',
        headers: request.headers
      })
    )
    
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
