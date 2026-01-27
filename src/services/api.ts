import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ==================== 项目接口 ====================

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  tasks?: Task[]
}

export const projectApi = {
  // 获取所有项目
  getAll: async () => {
    const response = await api.get<Project[]>('/projects')
    return response.data
  },

  // 获取单个项目
  getById: async (id: string) => {
    const response = await api.get<Project>(`/projects/${id}`)
    return response.data
  },

  // 创建项目
  create: async (data: { name: string; description?: string }) => {
    const response = await api.post<Project>('/projects', data)
    return response.data
  },

  // 更新项目
  update: async (id: string, data: { name?: string; description?: string }) => {
    const response = await api.patch<Project>(`/projects/${id}`, data)
    return response.data
  },

  // 删除项目
  delete: async (id: string) => {
    await api.delete(`/projects/${id}`)
  }
}

// ==================== 任务接口 ====================

export interface Task {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  level: string
  color?: string
  status: string
  progress: number
  type: string
  priority?: string
  assignedTo?: string
  dependencies: string[]
  parentId?: string
  projectId: string
  createdAt: Date
  updatedAt: Date
}

export const taskApi = {
  // 获取所有任务
  getAll: async (projectId?: string) => {
    const params = projectId ? { projectId } : {}
    const response = await api.get<Task[]>('/tasks', { params })
    return response.data
  },

  // 获取单个任务
  getById: async (id: string) => {
    const response = await api.get<Task>(`/tasks/${id}`)
    return response.data
  },

  // 创建任务
  create: async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<Task>('/tasks', data)
    return response.data
  },

  // 更新任务
  update: async (id: string, data: Partial<Task>) => {
    const response = await api.patch<Task>(`/tasks/${id}`, data)
    return response.data
  },

  // 删除任务
  delete: async (id: string) => {
    await api.delete(`/tasks/${id}`)
  }
}

// ==================== 依赖关系接口 ====================

export interface Dependency {
  id: string
  fromTaskId: string
  toTaskId: string
  type: string
  lag: number
  createdAt: Date
}

export const dependencyApi = {
  // 获取所有依赖关系
  getAll: async () => {
    const response = await api.get<Dependency[]>('/dependencies')
    return response.data
  },

  // 创建依赖关系
  create: async (data: Omit<Dependency, 'id' | 'createdAt'>) => {
    const response = await api.post<Dependency>('/dependencies', data)
    return response.data
  },

  // 删除依赖关系
  delete: async (id: string) => {
    await api.delete(`/dependencies/${id}`)
  }
}

export default api
