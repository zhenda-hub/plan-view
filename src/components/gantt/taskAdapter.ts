import type { PlanningItem } from '@/types/planning'
import dayjs from 'dayjs'

/**
 * Jordium Gantt Task 接口定义
 * 注意：该库没有提供 TypeScript 类型定义文件
 */
export interface JordiumTask {
  id: number
  name: string
  startDate: string  // 格式: 'YYYY-MM-DD'
  endDate: string    // 格式: 'YYYY-MM-DD'
  progress?: number  // 0-100
  predecessor?: number[]  // 前置任务ID数组
  assignee?: string | string[]
  type?: 'task' | 'milestone' | 'summary' | 'project'
  color?: string
  icon?: string  // 里程碑图标
  isEditable?: boolean
  [key: string]: any  // 允许其他自定义字段
}

/**
 * 将 PlanningItem 转换为 JordiumTask
 */
export function toJordiumTask(item: PlanningItem): JordiumTask {
  // 将字符串ID转换为数字ID（Jordium使用数字ID）
  const numericId = typeof item.id === 'string'
    ? parseInt(item.id.replace(/\D/g, '')) || Math.random() * 1000000
    : item.id

  // 转换前置任务ID
  const predecessor = item.dependencies
    ? item.dependencies.map(depId => {
        const num = typeof depId === 'string'
          ? parseInt(depId.replace(/\D/g, ''))
          : depId
        return num || 0
      }).filter(n => n > 0)
    : undefined

  return {
    id: numericId,
    name: item.title,
    startDate: dayjs(item.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(item.endDate).format('YYYY-MM-DD'),
    progress: item.progress ?? 0,
    predecessor,
    type: item.type === 'milestone' ? 'milestone' : 'task',
    color: item.color,
    icon: item.type === 'milestone' ? 'diamond' : undefined,
    isEditable: true,
    // 保留原始ID用于后续映射
    _originalId: item.id,
    // 保留其他可能的自定义字段
    ...(item.metadata || {})
  }
}

/**
 * 将 JordiumTask 转换回 PlanningItem
 */
export function fromJordiumTask(task: JordiumTask, originalItem?: PlanningItem): PlanningItem {
  // 使用原始ID或生成新的字符串ID
  const id = (task as any)._originalId || `task-${task.id}`

  return {
    id,
    title: task.name,
    startDate: dayjs(task.startDate).toDate(),
    endDate: dayjs(task.endDate).toDate(),
    progress: task.progress ?? 0,
    type: task.type === 'milestone' ? 'milestone' : 'task',
    color: task.color,
    dependencies: task.predecessor?.map(p => `task-${p}`),
    // 继承原始项的其他属性
    level: originalItem?.level ?? 'year' as any,
    status: originalItem?.status ?? 'planned',
    projectId: originalItem?.projectId ?? 'default',
    // 保留自定义字段
    metadata: Object.entries(task).reduce((acc, [key, value]) => {
      if (!['id', 'name', 'startDate', 'endDate', 'progress', 'predecessor',
            'type', 'color', 'icon', 'isEditable', '_originalId'].includes(key)) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, any>)
  }
}

/**
 * 批量转换 PlanningItem 到 JordiumTask
 */
export function toJordiumTasks(items: PlanningItem[]): JordiumTask[] {
  return items.map(toJordiumTask)
}

/**
 * 批量转换 JordiumTask 到 PlanningItem
 */
export function fromJordiumTasks(tasks: JordiumTask[], originalItems: PlanningItem[]): PlanningItem[] {
  // 创建原始项目映射
  const originalMap = new Map<string, PlanningItem>()
  for (const item of originalItems) {
    const task = toJordiumTask(item)
    originalMap.set(String(task.id), item)
  }

  return tasks.map(task => {
    const original = originalMap.get(String(task.id))
    return fromJordiumTask(task, original)
  })
}
