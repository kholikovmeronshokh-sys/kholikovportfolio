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

export async function GET() {
  try {
    const projects = getProjects()
    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const projects = getProjects()
    
    const newProject = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }
    
    projects.unshift(newProject)
    saveProjects(projects)
    
    return NextResponse.json(newProject)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
