import { NextResponse } from 'next/server'

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

export async function GET() {
  try {
    const kvClient = await getKV()
    
    // Sample project with embedded image
    const sampleProject = {
      id: '1',
      title: 'Sample Project',
      description: 'This is a sample project to test the portfolio. You can edit or delete this from the admin panel.',
      category: 'Website',
      link: 'https://example.com',
      images: [
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%238B5CF6;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%2310B981;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="600" fill="url(%23grad)"/%3E%3Ctext x="400" y="280" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle"%3ESample Project%3C/text%3E%3Ctext x="400" y="340" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" opacity="0.8"%3EUpload your own images in admin panel%3C/text%3E%3C/svg%3E',
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23667eea"/%3E%3Ctext x="400" y="300" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle"%3EImage 2%3C/text%3E%3C/svg%3E'
      ],
      video: '',
      createdAt: new Date().toISOString()
    }
    
    if (kvClient) {
      const existing = await kvClient.get('portfolio:projects')
      if (!existing || (Array.isArray(existing) && existing.length === 0)) {
        await kvClient.set('portfolio:projects', [sampleProject])
        return NextResponse.json({ message: 'Sample project created', project: sampleProject })
      }
      return NextResponse.json({ message: 'Projects already exist' })
    }
    
    return NextResponse.json({ message: 'KV not available, sample project shown', project: sampleProject })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Failed to initialize' }, { status: 500 })
  }
}
