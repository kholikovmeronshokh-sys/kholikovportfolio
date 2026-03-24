import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import jwt from 'jsonwebtoken'

const DATA_DIR = join(process.cwd(), 'data')
const PROJECTS_FILE = join(DATA_DIR, 'projects.json')

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!existsSync(PROJECTS_FILE)) {
    writeFileSync(PROJECTS_FILE, JSON.stringify([]))
  }
}

function getProjects() {
  ensureDataDir()
  const data = readFileSync(PROJECTS_FILE, 'utf-8')
  return JSON.parse(data)
}

function saveProjects(projects: any[]) {
  ensureDataDir()
  writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2))
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
    const projects = getProjects()
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
    const projects = getProjects()
    const index = projects.findIndex((p: any) => p.id === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    projects[index] = { ...projects[index], ...body }
    saveProjects(projects)
    
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
    const projects = getProjects()
    const filtered = projects.filter((p: any) => p.id !== params.id)
    saveProjects(filtered)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
