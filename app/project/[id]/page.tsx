'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { storage } from '@/lib/storage'

export default function ProjectDetail() {
  const params = useParams()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = storage.getProject(params.id as string)
    setProject(data)
    setLoading(false)
  }, [params.id])

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
            ) : project.image ? (
              <img 
                src={project.image}
                alt={project.title}
                className="w-full h-auto"
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-gray-900">
                <span className="text-gray-600 text-6xl">📁</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="glass rounded-2xl p-6 sm:p-8">
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
