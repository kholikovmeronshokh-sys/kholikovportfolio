// Client-side storage wrapper that syncs with API
export const clientStorage = {
  // Save to both localStorage and API
  async saveProject(project: any, token: string) {
    // Save to localStorage
    const projects = this.getLocalProjects()
    const existing = projects.findIndex(p => p.id === project.id)
    if (existing >= 0) {
      projects[existing] = project
    } else {
      projects.unshift(project)
    }
    localStorage.setItem('portfolio_projects', JSON.stringify(projects))
    
    // Also save to API
    try {
      const url = existing >= 0 ? `/api/projects/${project.id}` : '/api/projects'
      const method = existing >= 0 ? 'PUT' : 'POST'
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(project)
      })
    } catch (error) {
      console.error('API save failed, using localStorage only:', error)
    }
    
    return project
  },
  
  // Get from localStorage first, fallback to API
  async getProjects() {
    const local = this.getLocalProjects()
    if (local.length > 0) {
      return local
    }
    
    // Fallback to API
    try {
      const res = await fetch('/api/projects')
      const apiProjects = await res.json()
      if (apiProjects.length > 0) {
        localStorage.setItem('portfolio_projects', JSON.stringify(apiProjects))
        return apiProjects
      }
    } catch (error) {
      console.error('API fetch failed:', error)
    }
    
    return []
  },
  
  // Get single project
  async getProject(id: string) {
    const projects = await this.getProjects()
    return projects.find((p: any) => p.id === id)
  },
  
  // Delete project
  async deleteProject(id: string, token: string) {
    const projects = this.getLocalProjects()
    const filtered = projects.filter((p: any) => p.id !== id)
    localStorage.setItem('portfolio_projects', JSON.stringify(filtered))
    
    // Also delete from API
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } catch (error) {
      console.error('API delete failed:', error)
    }
  },
  
  // Helper: get from localStorage
  getLocalProjects(): any[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('portfolio_projects')
    return data ? JSON.parse(data) : []
  }
}
