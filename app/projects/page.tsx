'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Masonry from 'react-masonry-css'

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data)
        setLoading(false)
      })
  }, [])

  const categories = ['All', ...Array.from(new Set(projects.map((p: any) => p.category).filter(Boolean)))]

  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const breakpointColumns = {
    default: 4,
    1536: 3,
    1024: 2,
    640: 1
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link href="/landing">
            <h1 className="text-xl sm:text-2xl font-bold gradient-text cursor-pointer">KM</h1>
          </Link>
          <div className="flex gap-4 sm:gap-6 text-sm sm:text-base">
            <Link href="/landing" className="hover:text-purple-400 transition">Home</Link>
            <Link href="/projects" className="hover:text-purple-400 transition">Projects</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 gradient-text">All Projects</h1>
          <p className="text-gray-400 text-base sm:text-lg">Explore my creations</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 sm:mb-12"
        >
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md glass rounded-lg px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-green-600 text-white'
                    : 'glass hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex -ml-6 w-auto"
            columnClassName="pl-6 bg-clip-padding"
          >
            {filteredProjects.map((project: any, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="mb-6"
              >
                <Link href={`/project/${project.id}`}>
                  <div className="glass rounded-xl overflow-hidden cursor-pointer group">
                    <div className="relative overflow-hidden bg-gray-900">
                      {project.video ? (
                        <video 
                          src={project.video}
                          className="w-full h-auto object-cover group-hover:scale-110 transition duration-500"
                          muted
                          loop
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                      ) : project.images && project.images.length > 0 ? (
                        <img 
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-auto object-cover group-hover:scale-110 transition duration-500"
                        />
                      ) : (
                        <div className="w-full aspect-video flex items-center justify-center">
                          <span className="text-gray-600 text-4xl">📁</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition">
                        {project.title}
                      </h3>
                      {project.category && (
                        <span className="inline-block text-xs px-2 py-1 rounded-full bg-purple-600/30 text-purple-300 mb-2">
                          {project.category}
                        </span>
                      )}
                      <p className="text-gray-400 text-sm line-clamp-3">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </Masonry>
        )}

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No projects found</p>
          </div>
        )}
      </div>
    </div>
  )
}
