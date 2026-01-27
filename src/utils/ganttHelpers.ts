import dayjs from 'dayjs'
import { PlanningItem } from '@/types/planning'

/**
 * 计算任务条在时间轴上的位置和宽度
 */
export function calculateTaskPosition(
  task: PlanningItem,
  viewStartDate: Date,
  viewEndDate: Date,
  timelineWidth: number
): { left: number; width: number } {
  const totalDays = dayjs(viewEndDate).diff(dayjs(viewStartDate), 'day')
  const taskStart = dayjs(task.startDate)
  const taskEnd = dayjs(task.endDate)

  const daysFromStart = taskStart.diff(dayjs(viewStartDate), 'day')
  const taskDuration = taskEnd.diff(taskStart, 'day') + 1

  const left = (daysFromStart / totalDays) * timelineWidth
  const width = (taskDuration / totalDays) * timelineWidth

  return { left: Math.max(0, left), width: Math.max(width, 10) }
}

/**
 * 计算依赖关系箭头的 SVG 路径
 */
export function calculateDependencyPath(
  fromTask: PlanningItem,
  toTask: PlanningItem,
  timelineWidth: number,
  viewStartDate: Date,
  viewEndDate: Date,
  rowHeight: number = 50,
  fromRowIndex: number = 0,
  toRowIndex: number = 0
): string {
  const fromPos = calculateTaskPosition(fromTask, viewStartDate, viewEndDate, timelineWidth)
  const toPos = calculateTaskPosition(toTask, viewStartDate, viewEndDate, timelineWidth)

  const startX = fromPos.left + fromPos.width
  const startY = fromRowIndex * rowHeight + rowHeight / 2
  const endX = toPos.left
  const endY = toRowIndex * rowHeight + rowHeight / 2

  // 创建平滑的贝塞尔曲线
  const midX = (startX + endX) / 2
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
}

/**
 * 检测循环依赖
 */
export function detectCircularDependencies(
  taskId: string,
  allTasks: PlanningItem[],
  visited = new Set<string>(),
  recursionStack = new Set<string>()
): boolean {
  if (recursionStack.has(taskId)) {
    return true // 发现循环
  }

  if (visited.has(taskId)) {
    return false // 已访问过，不是循环
  }

  visited.add(taskId)
  recursionStack.add(taskId)

  const task = allTasks.find(t => t.id === taskId)
  if (task?.dependencies) {
    for (const depId of task.dependencies) {
      if (detectCircularDependencies(depId, allTasks, visited, recursionStack)) {
        return true
      }
    }
  }

  recursionStack.delete(taskId)
  return false
}

/**
 * 验证任务日期
 */
export function validateTaskDates(
  startDate: Date,
  endDate: Date,
  parentTask?: PlanningItem
): { valid: boolean; error?: string } {
  if (dayjs(endDate).isBefore(dayjs(startDate))) {
    return { valid: false, error: '结束日期不能早于开始日期' }
  }

  if (parentTask) {
    if (dayjs(startDate).isBefore(dayjs(parentTask.startDate))) {
      return { valid: false, error: '任务开始日期不能早于父任务开始日期' }
    }
    if (dayjs(endDate).isAfter(dayjs(parentTask.endDate))) {
      return { valid: false, error: '任务结束日期不能晚于父任务结束日期' }
    }
  }

  return { valid: true }
}

/**
 * 计算关键路径
 */
export function calculateCriticalPath(tasks: PlanningItem[]): string[] {
  // 简化版关键路径计算
  // 实际应用中需要完整的 CPM 算法
  const inDegree = new Map<string, number>()
  const adjList = new Map<string, string[]>()

  // 初始化
  for (const task of tasks) {
    inDegree.set(task.id, 0)
    adjList.set(task.id, [])
  }

  // 构建图
  for (const task of tasks) {
    if (task.dependencies) {
      for (const depId of task.dependencies) {
        adjList.get(depId)?.push(task.id)
        inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1)
      }
    }
  }

  // 拓扑排序找最长路径
  const queue: string[] = []
  const dist = new Map<string, number>()

  for (const [taskId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(taskId)
      dist.set(taskId, 0)
    }
  }

  const criticalPath: string[] = []
  let maxDist = 0

  while (queue.length > 0) {
    const taskId = queue.shift()!
    const currentDist = dist.get(taskId) || 0

    if (currentDist > maxDist) {
      maxDist = currentDist
      criticalPath.length = 0
      criticalPath.push(taskId)
    } else if (currentDist === maxDist) {
      criticalPath.push(taskId)
    }

    for (const nextId of adjList.get(taskId) || []) {
      const newDist = currentDist + 1
      if ((dist.get(nextId) || 0) < newDist) {
        dist.set(nextId, newDist)
      }
      inDegree.set(nextId, (inDegree.get(nextId) || 0) - 1)
      if (inDegree.get(nextId) === 0) {
        queue.push(nextId)
      }
    }
  }

  return criticalPath
}
