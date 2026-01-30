/**
 * Jordium Gantt Vue3 类型声明
 * 由于该库没有提供完整的类型定义，这里提供基本类型
 */

declare module 'jordium-gantt-vue3' {
  import { DefineComponent } from 'vue'

  export interface Task {
    id: number
    name: string
    startDate: string  // 'YYYY-MM-DD' format
    endDate: string    // 'YYYY-MM-DD' format
    progress?: number  // 0-100
    predecessor?: number[]  // 前置任务ID数组
    assignee?: string | string[]
    type?: 'task' | 'milestone' | 'summary' | 'project'
    color?: string
    icon?: string
    isEditable?: boolean
    level?: number
    [key: string]: any
  }

  export interface TaskBarConfig {
    showAvatar?: boolean
    showTitle?: boolean
    showProgress?: boolean
    dragThreshold?: number
  }

  export const GanttChart: DefineComponent<{
    tasks?: Task[]
    milestones?: Task[]
    showToolbar?: boolean
    allowDragAndResize?: boolean
    useDefaultDrawer?: boolean
    useDefaultMilestoneDialog?: boolean
    autoSortByStartDate?: boolean
    enableTaskRowMove?: boolean
    enableTaskListContextMenu?: boolean
    enableTaskBarContextMenu?: boolean
    assigneeOptions?: Array<{ value: string | number; label: string }>
    locale?: 'zh-CN' | 'en-US'
    theme?: 'light' | 'dark'
    timeScale?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
    fullscreen?: boolean
    taskBarConfig?: TaskBarConfig
    taskListConfig?: any
  }>

  export const TaskListContextMenu: DefineComponent
  export const TaskBarContextMenu: DefineComponent
  export const TaskListColumn: DefineComponent
}
