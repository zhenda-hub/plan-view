import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { PlanningItem, TimeLevel } from '@/types/planning'
import { taskApi } from '@/services/api'

export const usePlanningStore = defineStore('planning', () => {
  // State
  const items = ref<PlanningItem[]>([])
  const loading = ref(false)

  // Getters
  const getItemsByLevel = computed(() => {
    return (level: TimeLevel) => {
      return items.value.filter(item => item.level === level)
    }
  })

  const getItemById = computed(() => {
    return (id: string) => {
      return items.value.find(item => item.id === id)
    }
  })

  const getItemsForDateRange = computed(() => {
    return (startDate: Date, endDate: Date) => {
      return items.value.filter(item => {
        return item.startDate <= endDate && item.endDate >= startDate
      })
    }
  })

  // Actions
  function addItem(item: PlanningItem) {
    items.value.push(item)
  }

  function updateItem(id: string, updates: Partial<PlanningItem>) {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updates }
    }
  }

  function deleteItem(id: string) {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  // 从 API 加载数据
  async function loadFromApi() {
    loading.value = true
    try {
      const data = await taskApi.getAll()
      items.value = data.map(task => ({
        ...task,
        startDate: new Date(task.startDate),
        endDate: new Date(task.endDate),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        level: task.level as TimeLevel,
        status: task.status as PlanningItem['status'],
        type: task.type as PlanningItem['type'],
        assignedTo: task.assignedTo ? (typeof task.assignedTo === 'string' ? [task.assignedTo] : task.assignedTo) : undefined,
        priority: task.priority as PlanningItem['priority']
      }))
    } catch (error) {
      console.error('加载数据失败:', error)
      // 如果 API 调用失败，加载示例数据
      loadSampleData()
    } finally {
      loading.value = false
    }
  }

  function loadSampleData() {
    const today = new Date()
    const currentYear = today.getFullYear()

    items.value = [
      {
        id: 'decade-1',
        title: '十年战略目标 (2024-2034)',
        description: '公司未来十年的主要发展方向',
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear + 10, 11, 31),
        level: TimeLevel.DECADE,
        status: 'planned',
        color: '#3b82f6',
        progress: 10,
        type: 'task',
        dependencies: [],
        projectId: 'default'
      },
      {
        id: 'five-year-1',
        title: '第一个五年计划 (2024-2029)',
        description: '短期战略实施阶段',
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear + 5, 11, 31),
        level: TimeLevel.FIVE_YEAR,
        status: 'in_progress',
        color: '#10b981',
        progress: 20,
        type: 'task',
        dependencies: [],
        parentId: 'decade-1',
        projectId: 'default'
      },
      {
        id: 'three-year-1',
        title: '前三年里程碑',
        description: '关键目标达成期',
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear + 3, 11, 31),
        level: TimeLevel.THREE_YEAR,
        status: 'in_progress',
        color: '#8b5cf6',
        progress: 30,
        type: 'milestone',
        dependencies: [],
        parentId: 'five-year-1',
        projectId: 'default'
      },
      {
        id: 'year-1',
        title: '2024年度计划',
        description: '本年度核心工作',
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear, 11, 31),
        level: TimeLevel.YEAR,
        status: 'in_progress',
        color: '#f59e0b',
        progress: 50,
        type: 'task',
        dependencies: [],
        projectId: 'default'
      },
      {
        id: 'quarter-1',
        title: '2024 Q1 目标',
        description: '第一季度关键指标',
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear, 2, 31),
        level: TimeLevel.QUARTERLY,
        status: 'in_progress',
        color: '#ef4444',
        progress: 75,
        type: 'task',
        dependencies: [],
        projectId: 'default'
      },
      {
        id: 'quarter-2',
        title: '2024 Q2 目标',
        description: '第二季度关键指标',
        startDate: new Date(currentYear, 3, 1),
        endDate: new Date(currentYear, 5, 30),
        level: TimeLevel.QUARTERLY,
        status: 'planned',
        color: '#ec4899',
        progress: 0,
        type: 'task',
        dependencies: ['quarter-1'],
        projectId: 'default'
      },
      {
        id: 'month-1',
        title: '1月工作计划',
        description: '开年重点工作',
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear, 0, 31),
        level: TimeLevel.MONTHLY,
        status: 'completed',
        color: '#06b6d4',
        progress: 100,
        type: 'task',
        dependencies: [],
        projectId: 'default'
      },
      {
        id: 'week-1',
        title: '第1周任务',
        description: '启动核心项目',
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear, 0, 7),
        level: TimeLevel.WEEKLY,
        status: 'completed',
        color: '#84cc16',
        progress: 100,
        type: 'task',
        dependencies: [],
        projectId: 'default'
      }
    ]
  }

  return {
    items,
    loading,
    getItemsByLevel,
    getItemById,
    getItemsForDateRange,
    addItem,
    updateItem,
    deleteItem,
    loadFromApi,
    loadSampleData
  }
})
