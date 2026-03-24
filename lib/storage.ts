// Client-side storage for projects
export const storage = {
  getProjects: (): any[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('projects')
    return data ? JSON.parse(data) : []
  },
  
  saveProjects: (projects: any[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('projects', JSON.stringify(projects))
  },
  
  addProject: (project: any) => {
    const projects = storage.getProjects()
    projects.unshift(project)
    storage.saveProjects(projects)
    return project
  },
  
  updateProject: (id: string, updates: any) => {
    const projects = storage.getProjects()
    const index = projects.findIndex(p => p.id === id)
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates }
      storage.saveProjects(projects)
      return projects[index]
    }
    return null
  },
  
  deleteProject: (id: string) => {
    const projects = storage.getProjects()
    const filtered = projects.filter(p => p.id !== id)
    storage.saveProjects(filtered)
    return true
  },
  
  getProject: (id: string) => {
    const projects = storage.getProjects()
    return projects.find(p => p.id === id)
  }
}
