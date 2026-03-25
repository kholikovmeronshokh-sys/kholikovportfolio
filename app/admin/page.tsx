'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    category: '', // New: category field
    mediaType: 'images' as 'images' | 'video', // New: media type selector
    images: [] as string[], // Multiple images (max 6)
    video: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsAuthenticated(true)
      loadProjects()
    }
  }, [])

  const loadProjects = async () => {
    // Try localStorage first
    const localProjects = localStorage.getItem('portfolio_projects')
    if (localProjects) {
      try {
        const parsed = JSON.parse(localProjects)
        setProjects(parsed)
      } catch (e) {
        console.error('Failed to parse local projects:', e)
      }
    }
    
    // Then sync with API
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (data && data.length > 0) {
        setProjects(data)
        localStorage.setItem('portfolio_projects', JSON.stringify(data))
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    
    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('adminToken', data.token)
      setIsAuthenticated(true)
      loadProjects()
    } else {
      alert('Invalid credentials')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate: must have either images or video
    if (formData.mediaType === 'images' && formData.images.length === 0) {
      alert('Please add at least one image')
      return
    }
    
    if (formData.mediaType === 'video' && !formData.video) {
      alert('Please add a video')
      return
    }
    
    const token = localStorage.getItem('adminToken')
    
    // Prepare data: clear unused media type
    const dataToSend = {
      ...formData,
      images: formData.mediaType === 'images' ? formData.images : [],
      video: formData.mediaType === 'video' ? formData.video : ''
    }
    
    console.log('📤 Submitting project:', {
      title: dataToSend.title,
      category: dataToSend.category,
      mediaType: dataToSend.mediaType,
      imageCount: dataToSend.images.length,
      hasVideo: !!dataToSend.video
    })
    
    const url = editingProject 
      ? `/api/projects/${editingProject.id}`
      : '/api/projects'
    
    const method = editingProject ? 'PUT' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      })
      
      if (res.ok) {
        const result = await res.json()
        console.log('✓ Project saved successfully:', result.id)
        
        // Save to localStorage immediately
        const localProjects = localStorage.getItem('portfolio_projects')
        const projects = localProjects ? JSON.parse(localProjects) : []
        
        if (editingProject) {
          const index = projects.findIndex((p: any) => p.id === editingProject.id)
          if (index >= 0) {
            projects[index] = result
          }
        } else {
          projects.unshift(result)
        }
        
        localStorage.setItem('portfolio_projects', JSON.stringify(projects))
        
        setFormData({ title: '', description: '', link: '', category: '', mediaType: 'images', images: [], video: '' })
        setShowForm(false)
        setEditingProject(null)
        await loadProjects()
        alert('Project saved successfully!')
      } else {
        const error = await res.text()
        console.error('✗ Save error:', error)
        alert('Error saving project: ' + error)
      }
    } catch (error) {
      console.error('✗ Network error:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    
    const token = localStorage.getItem('adminToken')
    await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    loadProjects()
  }

  const handleEdit = (project: any) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      link: project.link || '',
      category: project.category || '',
      mediaType: project.video ? 'video' : 'images',
      images: project.images || [],
      video: project.video || ''
    })
    setShowForm(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const currentImages = formData.images.length
    const remainingSlots = 6 - currentImages
    
    if (remainingSlots <= 0) {
      alert('Maximum 6 images allowed')
      return
    }
    
    const filesToProcess = Array.from(files).slice(0, remainingSlots)
    let processedCount = 0
    
    console.log(`Starting to process ${filesToProcess.length} images...`)
    
    filesToProcess.forEach((file, idx) => {
      // Check file size (max 2MB per image)
      if (file.size > 2 * 1024 * 1024) {
        alert(`Image ${file.name} is too large. Max 2MB per image.`)
        return
      }
      
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (result) {
          console.log(`✓ Image ${idx + 1} loaded successfully (${Math.round(result.length / 1024)}KB)`)
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, result]
          }))
          processedCount++
          
          if (processedCount === filesToProcess.length) {
            console.log(`All ${processedCount} images loaded!`)
          }
        }
      }
      
      reader.onerror = (error) => {
        console.error(`✗ Error reading image ${idx + 1}:`, error)
        alert(`Failed to load image: ${file.name}`)
      }
      
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, video: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 w-full max-w-md"
        >
          <h1 className="text-3xl font-bold mb-6 gradient-text text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full glass rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button type="submit" className="w-full btn-primary">
              Login
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link href="/landing">
            <h1 className="text-xl sm:text-2xl font-bold gradient-text cursor-pointer">KM</h1>
          </Link>
          <div className="flex gap-3 sm:gap-6 items-center text-sm sm:text-base">
            <Link href="/landing" className="hover:text-purple-400 transition">Home</Link>
            <Link href="/projects" className="hover:text-purple-400 transition">Projects</Link>
            <button onClick={handleLogout} className="hover:text-red-400 transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto pb-12 sm:pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">Admin Dashboard</h1>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingProject(null)
              setFormData({ title: '', description: '', link: '', category: '', mediaType: 'images', images: [], video: '' })
            }}
            className="btn-primary text-sm sm:text-base whitespace-nowrap"
          >
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8 mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Project Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full glass rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              
              <input
                type="text"
                placeholder="Category (e.g., Website, Telegram Bot, Mobile App)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full glass rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full glass rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 min-h-32"
                required
              />
              <input
                type="url"
                placeholder="External Link (optional)"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full glass rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              {/* Media Type Selector */}
              <div className="space-y-4">
                <label className="block text-sm text-gray-400 mb-2">Media Type (Choose One)</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mediaType: 'images', video: '' })}
                    className={`flex-1 py-3 rounded-lg transition ${
                      formData.mediaType === 'images'
                        ? 'bg-gradient-to-r from-purple-600 to-green-600 text-white'
                        : 'glass hover:bg-white/10'
                    }`}
                  >
                    📷 Images (up to 6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mediaType: 'video', images: [] })}
                    className={`flex-1 py-3 rounded-lg transition ${
                      formData.mediaType === 'video'
                        ? 'bg-gradient-to-r from-purple-600 to-green-600 text-white'
                        : 'glass hover:bg-white/10'
                    }`}
                  >
                    🎥 Video
                  </button>
                </div>
              </div>
              
              {/* Conditional Media Upload */}
              {formData.mediaType === 'images' ? (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Upload Images (Max 6) - {formData.images.length}/6
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={formData.images.length >= 6}
                    className="w-full glass rounded-lg px-4 py-3 outline-none"
                  />
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={img} 
                            alt={`Preview ${index + 1}`} 
                            className="rounded-lg w-full h-24 object-cover" 
                            onError={(e) => {
                              console.error('Preview image error:', index)
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/><text x="50" y="50" text-anchor="middle" fill="%23999" font-size="14">Error</text></svg>'
                            }}
                            onLoad={() => {
                              console.log('Preview loaded:', index)
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Upload Video</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="w-full glass rounded-lg px-4 py-3 outline-none"
                  />
                  {formData.video && (
                    <video src={formData.video} className="mt-2 rounded-lg w-full h-32 object-cover" controls />
                  )}
                </div>
              )}

              <button type="submit" className="btn-primary w-full">
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Projects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <div key={project.id} className="glass rounded-xl overflow-hidden">
              <div className="aspect-video relative bg-gray-900">
                {project.images && project.images.length > 0 ? (
                  <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    No image
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-600/30 text-purple-300">
                    {project.category || 'Uncategorized'}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
