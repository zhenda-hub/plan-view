// Time hierarchy levels
export enum TimeLevel {
  DECADE = 'decade',        // 10 years
  FIVE_YEAR = 'five_year',  // 5 years
  THREE_YEAR = 'three_year', // 3 years
  YEAR = 'year',            // 1 year
  QUARTERLY = 'quarterly',  // Quarterly view
  MONTHLY = 'monthly',      // Monthly view
  WEEKLY = 'weekly'         // Weekly view
}

// Time pattern configurations
export interface TimePattern {
  level: TimeLevel
  units: number           // Number of main units (e.g., 4 quarters)
  label: string
  duration: number        // Duration in months
}

// Planning item structure
export interface PlanningItem {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  level: TimeLevel        // Which level this item belongs to
  color?: string          // Visual indicator
  status: 'planned' | 'in_progress' | 'completed' | 'delayed'
  parentId?: string       // For hierarchical relationships
  children?: PlanningItem[]
  metadata?: Record<string, any>
  // 甘特图相关字段
  progress?: number           // 进度 0-100
  type?: 'task' | 'milestone' | 'summary'  // 任务类型
  dependencies?: string[]     // 前置任务ID数组
  assignedTo?: string[]       // 分配资源
  priority?: 'low' | 'medium' | 'high' | 'critical'
  projectId?: string          // 项目ID
}

// 任务依赖关系
export interface TaskDependency {
  id: string
  fromTaskId: string
  toTaskId: string
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish'
  lag?: number
}

// 视图模式
export enum ViewMode {
  GRID = 'grid',      // 网格视图
  GANTT = 'gantt'     // 甘特图视图
}

// View state
export interface ViewState {
  currentLevel: TimeLevel
  currentDate: Date       // Current date being viewed
  selectedItemId?: string
}
