'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function ProjectDetail() {
  const params = useParams()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetch(`/api/projects/${params.id}`)
      .then(res => res.json())
      .then(data => {
        console.log('Project data:', data) // Debug
        setProject(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading project:', error)
        setLoading(false)
      })
  }, [params.id])

  useEffect(() => {
    if (!project || !project.images || project.images.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length)
    }, 3000) // Change image every 3 seconds
    
    return () => clearInterval(interval)
  }, [project])

  const nextImage = () => {
    if (project && project.images) {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length)
    }
  }

  const prevImage = () => {
    if (project && project.images) {
      setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <Link href="/projects">
            <button className="btn-primary">Back to Projects</button>
          </Link>
        </div>
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
          <div className="flex gap-4 sm:gap-6 text-sm sm:text-base">
            <Link href="/landing" className="hover:text-purple-400 transition">Home</Link>
            <Link href="/projects" className="hover:text-purple-400 transition">Projects</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-4 sm:px-6 max-w-5xl mx-auto pb-12 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back Button */}
          <Link href="/projects">
            <button className="mb-6 sm:mb-8 text-sm sm:text-base text-gray-400 hover:text-white transition flex items-center gap-2">
              ← Back to Projects
            </button>
          </Link>

          {/* Media */}
          <div className="glass rounded-2xl overflow-hidden mb-8">
            {project.video ? (
              <video 
                src={project.video}
                controls
                className="w-full h-auto"
              />
            ) : project.images && project.images.length > 0 ? (
              <div className="relative bg-gray-900 min-h-[400px] flex items-center justify-center">
                <img 
                  src={project.images[currentImageIndex]}
                  alt={`${project.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-auto max-h-[600px] object-contain"
                  onError={(e) => {
                    console.error('Image load error:', e)
                    e.currentTarget.style.display = 'none'
                  }}
                  onLoad={(e) => {
                    console.log('Image loaded successfully')
                  }}
                />
                
                {/* Image Counter */}
                {project.images.length > 1 && (
                  <>
                    <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded-full text-sm z-10">
                      {currentImageIndex + 1} / {project.images.length}
                    </div>
                    
                    {/* Navigation Arrows */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition text-lg sm:text-xl z-10"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition text-lg sm:text-xl z-10"
                    >
                      →
                    </button>
                    
                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {project.images.map((_: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full aspect-video flex flex-col items-center justify-center bg-gray-900">
                <span className="text-gray-600 text-6xl mb-4">📁</span>
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="glass rounded-2xl p-6 sm:p-8">
            {project.category && (
              <span className="inline-block text-sm px-3 py-1 rounded-full bg-purple-600/30 text-purple-300 mb-4">
                {project.category}
              </span>
            )}
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 gradient-text">
              {project.title}
            </h1>
            
            <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>

            {project.link && (
              <a 
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block text-sm sm:text-base"
              >
                View Project →
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
