'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { storage } from '@/lib/storage'

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
    image: '',
    video: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsAuthenticated(true)
      loadProjects()
    }
  }, [])

  const loadProjects = () => {
    const data = storage.getProjects()
    setProjects(data)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check credentials
    const validUsername = 'kholikov_admin'
    const validPassword = 'Meronshokh@2024!Secure'
    
    if (username === validUsername && password === validPassword) {
      const token = 'authenticated_' + Date.now()
      localStorage.setItem('adminToken', token)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingProject) {
      storage.updateProject(editingProject.id, formData)
    } else {
      const newProject = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      }
      storage.addProject(newProject)
    }
    
    setFormData({ title: '', description: '', link: '', image: '', video: '' })
    setShowForm(false)
    setEditingProject(null)
    loadProjects()
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this project?')) return
    storage.deleteProject(id)
    loadProjects()
  }

  const handleEdit = (project: any) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      link: project.link || '',
      image: project.image || '',
      video: project.video || ''
    })
    setShowForm(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result as string }))
    }
    reader.readAsDataURL(file)
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
              setFormData({ title: '', description: '', link: '', image: '', video: '' })
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full glass rounded-lg px-4 py-3 outline-none"
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="mt-2 rounded-lg w-full h-32 object-cover" />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Upload Video</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="w-full glass rounded-lg px-4 py-3 outline-none"
                  />
                  {formData.video && (
                    <video src={formData.video} className="mt-2 rounded-lg w-full h-32 object-cover" />
                  )}
                </div>
              </div>

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
                {project.image && (
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-6">
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
