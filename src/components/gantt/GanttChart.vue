<template>
  <div class="gantt-chart">
    <!-- 工具栏 -->
    <div class="gantt-toolbar">
      <button class="toolbar-btn primary" @click="handleAddTask">
        ➕ 新建任务
      </button>
      <button
        class="toolbar-btn"
        :disabled="!selectedTask"
        @click="selectedTask && handleEditTask(selectedTask)"
        title="编辑任务"
      >
        ✏️ 编辑
      </button>
      <button
        class="toolbar-btn danger"
        :disabled="!ganttStore.selectedTaskId"
        @click="handleDeleteTask"
      >
        🗑️ 删除
      </button>
      <div class="toolbar-divider"></div>
      <!-- 状态快速切换 -->
      <template v-if="selectedTask">
        <span class="toolbar-label">状态:</span>
        <button
          v-for="status in statusOptions"
          :key="status.value"
          class="toolbar-btn status-btn"
          :class="{ active: selectedTask.status === status.value }"
          :style="{ borderColor: status.color, color: selectedTask.status === status.value ? 'white' : status.color }"
          @click="handleQuickStatusChange(status.value)"
          :title="status.label"
        >
          {{ status.icon }}
        </button>
        <div class="toolbar-divider"></div>
      </template>
      <button
        class="toolbar-btn"
        :class="{ active: ganttStore.config.showDependencies }"
        @click="ganttStore.toggleDependencies()"
        title="显示/隐藏依赖关系"
      >
        🔗 依赖
      </button>
      <button
        class="toolbar-btn"
        :class="{ active: ganttStore.config.showProgress }"
        @click="ganttStore.toggleProgress()"
        title="显示/隐藏进度"
      >
        📊 进度
      </button>
      <div class="toolbar-divider"></div>
      <span class="toolbar-label">缩放:</span>
      <button
        class="toolbar-btn"
        :class="{ active: ganttStore.config.zoomLevel === 'day' }"
        @click="ganttStore.setZoomLevel('day')"
      >
        日
      </button>
      <button
        class="toolbar-btn"
        :class="{ active: ganttStore.config.zoomLevel === 'week' }"
        @click="ganttStore.setZoomLevel('week')"
      >
        周
      </button>
      <button
        class="toolbar-btn"
        :class="{ active: ganttStore.config.zoomLevel === 'month' }"
        @click="ganttStore.setZoomLevel('month')"
      >
        月
      </button>
    </div>

    <!-- 主甘特图区域 -->
    <div class="gantt-container">
      <!-- 左侧任务列表 -->
      <div class="gantt-task-list">
        <div class="task-list-header">
          <div class="header-cell">任务名称</div>
        </div>
        <div class="task-list-rows">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="task-list-row"
            :class="{ selected: ganttStore.selectedTaskId === task.id }"
            :style="{ paddingLeft: (task.rowIndex || 0) * 20 + 12 + 'px' }"
            @click="handleSelectTask(task.id)"
          >
            <span class="task-status-icon" :style="{ color: getStatusColor(task.status) }">
              {{ getStatusIcon(task.status) }}
            </span>
            <span class="task-name">{{ task.title }}</span>
            <span v-if="task.type === 'milestone'" class="milestone-badge">◆</span>
          </div>
        </div>
      </div>

      <!-- 右侧时间轴 -->
      <div class="gantt-timeline" ref="timelineRef">
        <!-- 时间刻度 -->
        <div class="timeline-header">
          <div
            v-for="date in timeScale"
            :key="date.toISOString()"
            class="timeline-cell"
            :style="{ width: cellWidth + 'px' }"
          >
            {{ formatDate(date) }}
          </div>
        </div>

        <!-- 任务条区域 -->
        <div class="timeline-body" @mousemove="handleTimelineMouseMove" @mouseup="handleDragEnd">
          <!-- 今天标记线 -->
          <div
            v-if="todayMarkerPosition >= 0"
            class="today-marker"
            :style="{ left: todayMarkerPosition + 'px' }"
          >
            <div class="today-label">今天</div>
          </div>

          <svg
            v-if="ganttStore.config.showDependencies"
            class="dependencies-layer"
          >
            <path
              v-for="dep in dependenciesWithPaths"
              :key="dep.id"
              :d="dep.path"
              fill="none"
              stroke="#6366f1"
              stroke-width="2"
              marker-end="url(#arrowhead)"
            />
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
              </marker>
            </defs>
          </svg>

          <div
            v-for="task in tasks"
            :key="task.id"
            class="task-bar-row"
            :style="{ height: rowHeight + 'px' }"
          >
            <div
              class="task-bar"
              :class="{
                'is-milestone': task.type === 'milestone',
                'is-selected': ganttStore.selectedTaskId === task.id,
                'is-dragging': draggingTask === task.id
              }"
              :style="getTaskBarStyle(task)"
              @click="handleSelectTask(task.id)"
              @dblclick="handleEditTask(task)"
              @mousedown.stop="handleDragStart($event, task)"
            >
              <!-- 拖拽手柄 -->
              <div
                v-if="task.type !== 'milestone'"
                class="drag-handle drag-handle-left"
                @mousedown.stop="handleResizeStart($event, task, 'left')"
              ></div>
              <div
                v-if="task.type !== 'milestone'"
                class="drag-handle drag-handle-right"
                @mousedown.stop="handleResizeStart($event, task, 'right')"
              ></div>
              <!-- 进度条 -->
              <div
                v-if="ganttStore.config.showProgress && task.progress && task.type !== 'milestone'"
                class="task-progress"
                :class="{ 'is-dragging': draggingProgress === task.id }"
                :style="{ width: task.progress + '%' }"
                @mousedown.stop="handleProgressDragStart($event, task)"
              >
                <div class="progress-handle"></div>
              </div>
              <span class="task-label">{{ task.title }}</span>
              <!-- 进度百分比显示 -->
              <span v-if="ganttStore.config.showProgress && task.type !== 'milestone'" class="task-progress-text">
                {{ task.progress }}%
              </span>
            </div>
          </div>

          <!-- 拖拽预览线 -->
          <div
            v-if="dragPreview.visible"
            class="drag-preview-line"
            :style="{ left: dragPreview.x + 'px' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 任务编辑对话框 -->
    <div v-if="editingTask" class="dialog-overlay" @click="handleCancelEdit">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>{{ isNewTask ? '新建任务' : '编辑任务' }}</h3>
          <button class="close-btn" @click="handleCancelEdit">✕</button>
        </div>
        <form @submit.prevent="handleSaveTask" class="dialog-form">
          <div class="form-group">
            <label>任务名称 *</label>
            <input v-model="editForm.title" type="text" required placeholder="输入任务名称" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="editForm.description" rows="3" placeholder="输入任务描述"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开始日期 *</label>
              <input v-model="editForm.startDate" type="date" required />
            </div>
            <div class="form-group">
              <label>结束日期 *</label>
              <input v-model="editForm.endDate" type="date" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>任务类型</label>
              <select v-model="editForm.type">
                <option value="task">普通任务</option>
                <option value="milestone">里程碑</option>
                <option value="summary">摘要任务</option>
              </select>
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="editForm.status">
                <option value="planned">📋 未开始</option>
                <option value="in_progress">🔄 进行中</option>
                <option value="completed">✅ 已完成</option>
                <option value="delayed">⚠️ 已延期</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" v-if="editForm.type === 'task'">
              <label>进度 (%)</label>
              <input v-model.number="editForm.progress" type="number" min="0" max="100" />
            </div>
            <div class="form-group">
              <label>优先级</label>
              <select v-model="editForm.priority">
                <option value="low">🟢 低</option>
                <option value="medium">🟡 中</option>
                <option value="high">🟠 高</option>
                <option value="critical">🔴 紧急</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>颜色</label>
            <div class="color-picker">
              <div
                v-for="color in presetColors"
                :key="color"
                class="color-option"
                :class="{ active: editForm.color === color }"
                :style="{ backgroundColor: color }"
                @click="editForm.color = color"
              />
            </div>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn-secondary" @click="handleCancelEdit">
              取消
            </button>
            <button type="submit" class="btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGanttStore } from '@/stores/gantt'
import { usePlanningStore } from '@/stores/planning'
import { calculateTaskPosition, calculateDependencyPath } from '@/utils/ganttHelpers'
import { taskApi, projectApi } from '@/services/api'
import type { PlanningItem } from '@/types/planning'
import dayjs from 'dayjs'

const ganttStore = useGanttStore()
const planningStore = usePlanningStore()

const timelineRef = ref<HTMLElement>()
const editingTask = ref<PlanningItem | null>(null)
const currentProjectId = ref<string>()
const rowHeight = 50
const presetColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

// 状态选项
const statusOptions = [
  { value: 'planned', label: '未开始', icon: '📋', color: '#6b7280' },
  { value: 'in_progress', label: '进行中', icon: '🔄', color: '#3b82f6' },
  { value: 'completed', label: '已完成', icon: '✅', color: '#10b981' },
  { value: 'delayed', label: '已延期', icon: '⚠️', color: '#ef4444' }
]

// 拖拽状态
const draggingTask = ref<string | null>(null)
const draggingProgress = ref<string | null>(null)
const dragMode = ref<'move' | 'resize-left' | 'resize-right' | null>(null)
const dragStartPos = ref({ x: 0, y: 0 })
const dragStartDate = ref<Date | null>(null)
const dragEndDate = ref<Date | null>(null)
const dragPreview = ref({ visible: false, x: 0 })

const editForm = ref({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  type: 'task',
  status: 'planned',
  progress: 0,
  priority: 'medium',
  color: '#3b82f6'
})

// 获取选中的任务
const selectedTask = computed(() => {
  return tasks.value.find(t => t.id === ganttStore.selectedTaskId) || null
})

// 是否是新任务
const isNewTask = computed(() => {
  return editingTask.value?.id.startsWith('new-')
})

// 获取状态图标
function getStatusIcon(status: string): string {
  const option = statusOptions.find(s => s.value === status)
  return option?.icon || '📋'
}

// 获取状态颜色
function getStatusColor(status: string): string {
  const option = statusOptions.find(s => s.value === status)
  return option?.color || '#6b7280'
}

// 获取或创建默认项目
async function getOrCreateProject() {
  try {
    const projects = await projectApi.getAll()
    if (projects.length > 0) {
      return projects[0].id
    }
    const project = await projectApi.create({
      name: '默认项目',
      description: '系统自动创建的项目'
    })
    return project.id
  } catch (error) {
    console.error('获取项目失败:', error)
    throw new Error('无法获取或创建项目')
  }
}

// 时间范围
const timelineStartDate = computed(() => {
  if (planningStore.items.length === 0) return dayjs().subtract(7, 'day').toDate()
  const minDate = new Date(Math.min(...planningStore.items.map(t => t.startDate.getTime())))
  return dayjs(minDate).subtract(7, 'day').toDate()
})

const timelineEndDate = computed(() => {
  if (planningStore.items.length === 0) return dayjs().add(30, 'day').toDate()
  const maxDate = new Date(Math.max(...planningStore.items.map(t => t.endDate.getTime())))
  return dayjs(maxDate).add(30, 'day').toDate()
})

// 时间刻度
const timeScale = computed(() => {
  const zoomLevel = ganttStore.config.zoomLevel
  const startDate = dayjs(timelineStartDate.value)
  const endDate = dayjs(timelineEndDate.value)
  const dates: Date[] = []

  if (zoomLevel === 'day') {
    const days = endDate.diff(startDate, 'day')
    for (let i = 0; i <= days; i++) {
      dates.push(startDate.add(i, 'day').toDate())
    }
  } else if (zoomLevel === 'week') {
    const weeks = Math.ceil(endDate.diff(startDate, 'day') / 7)
    for (let i = 0; i <= weeks; i++) {
      dates.push(startDate.add(i, 'week').toDate())
    }
  } else {
    const months = endDate.diff(startDate, 'month')
    for (let i = 0; i <= months; i++) {
      dates.push(startDate.add(i, 'month').toDate())
    }
  }

  return dates
})

const cellWidth = computed(() => {
  const zoomLevel = ganttStore.config.zoomLevel
  if (zoomLevel === 'day') return 40
  if (zoomLevel === 'week') return 120
  return 200
})

// 今天标记线位置
const todayMarkerPosition = computed(() => {
  if (!timelineRef.value) return -1

  const today = dayjs().startOf('day')
  const startDate = dayjs(timelineStartDate.value).startOf('day')
  const endDate = dayjs(timelineEndDate.value).startOf('day')

  // 如果今天不在时间范围内，返回 -1
  if (today.isBefore(startDate) || today.isAfter(endDate)) {
    return -1
  }

  const timelineWidth = timelineRef.value.clientWidth
  const totalDays = endDate.diff(startDate, 'day')
  const daysFromStart = today.diff(startDate, 'day')

  return (daysFromStart / totalDays) * timelineWidth
})

// 任务列表（扁平化，按结束时间降序排序）
const tasks = computed(() => {
  return planningStore.items
    .map((item, index) => ({
      ...item,
      level: item.level,
      rowIndex: index
    }))
    .sort((a, b) => {
      // 按结束时间降序排序（2034年在上面，2024年在下面）
      const endDateA = dayjs(a.endDate).valueOf()
      const endDateB = dayjs(b.endDate).valueOf()
      return endDateB - endDateA
    })
})

// 依赖关系（带路径）
const dependenciesWithPaths = computed(() => {
  if (!timelineRef.value) return []
  const timelineWidth = timelineRef.value.clientWidth
  const deps: Array<{ id: string; path: string }> = []

  for (const task of tasks.value) {
    if (task.dependencies) {
      for (const depId of task.dependencies) {
        const fromTask = tasks.value.find(t => t.id === depId)
        if (fromTask) {
          const path = calculateDependencyPath(
            fromTask,
            task,
            timelineWidth,
            timelineStartDate.value,
            timelineEndDate.value,
            rowHeight,
            tasks.value.findIndex(t => t.id === fromTask.id),
            tasks.value.findIndex(t => t.id === task.id)
          )
          deps.push({ id: `${depId}-${task.id}`, path })
        }
      }
    }
  }

  return deps
})

// 获取任务条样式
function getTaskBarStyle(task: PlanningItem) {
  if (!timelineRef.value) return {}
  const timelineWidth = timelineRef.value.clientWidth
  const pos = calculateTaskPosition(task, timelineStartDate.value, timelineEndDate.value, timelineWidth)

  return {
    left: pos.left + 'px',
    width: task.type === 'milestone' ? '24px' : pos.width + 'px',
    backgroundColor: task.color || '#3b82f6'
  }
}

// 格式化日期
function formatDate(date: Date): string {
  const zoomLevel = ganttStore.config.zoomLevel
  if (zoomLevel === 'day') return dayjs(date).format('MM/DD')
  if (zoomLevel === 'week') return dayjs(date).format('MM/DD')
  return dayjs(date).format('YYYY-MM')
}

// 选择任务
function handleSelectTask(taskId: string) {
  ganttStore.selectTask(taskId)
}

// 快速状态切换
async function handleQuickStatusChange(status: string) {
  if (!selectedTask.value) return

  try {
    await taskApi.update(selectedTask.value.id, { status })
    await planningStore.loadFromApi()
  } catch (error) {
    console.error('更新状态失败:', error)
    alert('更新状态失败')
  }
}

// 添加任务
async function handleAddTask() {
  if (!currentProjectId.value) {
    currentProjectId.value = await getOrCreateProject()
  }

  const newTask: PlanningItem = {
    id: 'new-' + crypto.randomUUID(),
    title: '新任务',
    startDate: new Date(),
    endDate: dayjs().add(7, 'day').toDate(),
    level: 'year' as any,
    status: 'planned',
    progress: 0,
    type: 'task',
    dependencies: [],
    projectId: currentProjectId.value
  }
  editingTask.value = newTask
  editForm.value = {
    title: newTask.title,
    description: '',
    startDate: dayjs(newTask.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(newTask.endDate).format('YYYY-MM-DD'),
    type: 'task',
    status: 'planned',
    progress: 0,
    priority: 'medium',
    color: '#3b82f6'
  }
}

// 删除任务
async function handleDeleteTask() {
  if (!ganttStore.selectedTaskId) return
  if (!confirm('确定要删除这个任务吗？')) return

  try {
    await taskApi.delete(ganttStore.selectedTaskId)
    await planningStore.loadFromApi()
    ganttStore.selectTask(undefined)
  } catch (error) {
    console.error('删除任务失败:', error)
    alert('删除任务失败')
  }
}

// 编辑任务
function handleEditTask(task: PlanningItem) {
  editingTask.value = task
  editForm.value = {
    title: task.title,
    description: task.description || '',
    startDate: dayjs(task.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(task.endDate).format('YYYY-MM-DD'),
    type: task.type || 'task',
    status: task.status || 'planned',
    progress: task.progress || 0,
    priority: task.priority || 'medium',
    color: task.color || '#3b82f6'
  }
}

// 保存任务
async function handleSaveTask() {
  if (!editingTask.value) return

  try {
    if (!currentProjectId.value) {
      currentProjectId.value = await getOrCreateProject()
    }

    const isNewTask = editingTask.value.id.startsWith('new-')

    const taskData = {
      title: editForm.value.title,
      description: editForm.value.description,
      startDate: new Date(editForm.value.startDate),
      endDate: new Date(editForm.value.endDate),
      level: 'year',
      status: editForm.value.status,
      progress: editForm.value.progress || 0,
      type: editForm.value.type,
      priority: editForm.value.priority,
      color: editForm.value.color,
      dependencies: editingTask.value.dependencies || [],
      projectId: currentProjectId.value
    }

    if (isNewTask) {
      await taskApi.create(taskData as any)
    } else {
      await taskApi.update(editingTask.value.id, taskData)
    }

    await planningStore.loadFromApi()
    handleCancelEdit()
  } catch (error: any) {
    console.error('保存任务失败:', error)
    alert('保存任务失败: ' + (error.response?.data?.error || error.message))
  }
}

// 取消编辑
function handleCancelEdit() {
  editingTask.value = null
}

// ===== 拖拽功能 =====

// 开始拖拽任务
function handleDragStart(event: MouseEvent, task: PlanningItem) {
  if (task.type === 'milestone') return
  draggingTask.value = task.id
  dragMode.value = 'move'
  dragStartPos.value = { x: event.clientX, y: event.clientY }
  dragStartDate.value = new Date(task.startDate)
  dragEndDate.value = new Date(task.endDate)

  document.addEventListener('mousemove', handleDragging)
  document.addEventListener('mouseup', handleDragEnd)
}

// 开始调整大小
function handleResizeStart(event: MouseEvent, task: PlanningItem, side: 'left' | 'right') {
  draggingTask.value = task.id
  dragMode.value = side === 'left' ? 'resize-left' : 'resize-right'
  dragStartPos.value = { x: event.clientX, y: event.clientY }
  dragStartDate.value = new Date(task.startDate)
  dragEndDate.value = new Date(task.endDate)

  document.addEventListener('mousemove', handleDragging)
  document.addEventListener('mouseup', handleDragEnd)
}

// 开始拖拽进度
function handleProgressDragStart(event: MouseEvent, task: PlanningItem) {
  event.stopPropagation()
  draggingProgress.value = task.id
  dragStartPos.value = { x: event.clientX, y: event.clientY }

  document.addEventListener('mousemove', handleProgressDragging)
  document.addEventListener('mouseup', handleProgressDragEnd)
}

// 拖拽中
function handleDragging(event: MouseEvent) {
  if (!draggingTask.value || !timelineRef.value) return

  const deltaX = event.clientX - dragStartPos.value.x
  const taskElement = event.target as HTMLElement
  const rect = taskElement.getBoundingClientRect()
  const timelineRect = timelineRef.value.getBoundingClientRect()
  const pixelsX = rect.left - timelineRect.left + deltaX

  dragPreview.value = { visible: true, x: pixelsX }
}

// 拖拽进度中
async function handleProgressDragging(event: MouseEvent) {
  if (!draggingProgress.value || !timelineRef.value) return

  const task = tasks.value.find(t => t.id === draggingProgress.value)
  if (!task) return

  const taskElement = event.target as HTMLElement
  const rect = taskElement.getBoundingClientRect()
  const newProgress = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))

  try {
    await taskApi.update(task.id, { progress: Math.round(newProgress) })
    await planningStore.loadFromApi()
  } catch (error) {
    console.error('更新进度失败:', error)
  }
}

// 结束拖拽
async function handleDragEnd() {
  if (!draggingTask.value || !dragMode.value) return

  const task = tasks.value.find(t => t.id === draggingTask.value)
  if (!task) {
    resetDragState()
    return
  }

  const timelineWidth = timelineRef.value?.clientWidth || 1
  const deltaX = dragPreview.value.visible
    ? dragPreview.value.x - (taskElementLeft(task) || 0)
    : 0

  const totalDays = dayjs(timelineEndDate.value).diff(dayjs(timelineStartDate.value), 'day')
  const daysDelta = Math.round((deltaX / timelineWidth) * totalDays)

  let newStartDate = new Date(dragStartDate.value!)
  let newEndDate = new Date(dragEndDate.value!)

  if (dragMode.value === 'move') {
    newStartDate = dayjs(dragStartDate.value).add(daysDelta, 'day').toDate()
    newEndDate = dayjs(dragEndDate.value).add(daysDelta, 'day').toDate()
  } else if (dragMode.value === 'resize-left') {
    newStartDate = dayjs(dragStartDate.value).add(daysDelta, 'day').toDate()
    if (newStartDate >= newEndDate) {
      newStartDate = dayjs(newEndDate).subtract(1, 'day').toDate()
    }
  } else if (dragMode.value === 'resize-right') {
    newEndDate = dayjs(dragEndDate.value).add(daysDelta, 'day').toDate()
    if (newEndDate <= newStartDate) {
      newEndDate = dayjs(newStartDate).add(1, 'day').toDate()
    }
  }

  try {
    await taskApi.update(task.id, {
      startDate: newStartDate,
      endDate: newEndDate
    })
    await planningStore.loadFromApi()
  } catch (error) {
    console.error('更新任务时间失败:', error)
  }

  resetDragState()
}

// 结束进度拖拽
function handleProgressDragEnd() {
  draggingProgress.value = null
  document.removeEventListener('mousemove', handleProgressDragging)
  document.removeEventListener('mouseup', handleProgressDragEnd)
}

// 获取任务条左边距
function taskElementLeft(task: PlanningItem): number | null {
  if (!timelineRef.value) return null
  const timelineWidth = timelineRef.value.clientWidth
  const pos = calculateTaskPosition(task, timelineStartDate.value, timelineEndDate.value, timelineWidth)
  return pos.left
}

// 处理时间轴鼠标移动
function handleTimelineMouseMove(event: MouseEvent) {
  if (!draggingTask.value || !timelineRef.value) return

  const rect = timelineRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  dragPreview.value = { visible: true, x }
}

// 重置拖拽状态
function resetDragState() {
  draggingTask.value = null
  draggingProgress.value = null
  dragMode.value = null
  dragStartDate.value = null
  dragEndDate.value = null
  dragPreview.value = { visible: false, x: 0 }
  document.removeEventListener('mousemove', handleDragging)
  document.removeEventListener('mouseup', handleDragEnd)
}

onMounted(async () => {
  currentProjectId.value = await getOrCreateProject()
  await planningStore.loadFromApi()
})
</script>

<style scoped>
.gantt-chart {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.gantt-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.toolbar-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.toolbar-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.toolbar-btn.status-btn {
  min-width: 40px;
  padding: 0.5rem 0.75rem;
  border-width: 2px;
  background: white;
}

.toolbar-btn.status-btn.active {
  background: currentColor;
  border-color: currentColor;
}

.toolbar-btn.primary {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.toolbar-btn.danger {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #d1d5db;
}

.toolbar-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.gantt-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.gantt-task-list {
  width: 300px;
  min-width: 250px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

.task-list-header {
  padding: 1rem;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
  background: #f3f4f6;
}

.task-list-rows {
  flex: 1;
  overflow-y: auto;
}

.task-list-row {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-list-row:hover {
  background: #f3f4f6;
}

.task-list-row.selected {
  background: #dbeafe;
}

.task-status-icon {
  font-size: 1rem;
}

.task-name {
  flex: 1;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.milestone-badge {
  color: #fbbf24;
}

.gantt-timeline {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.timeline-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.timeline-cell {
  padding: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-right: 1px solid #f3f4f6;
  text-align: center;
}

.timeline-body {
  flex: 1;
  position: relative;
  overflow-y: auto;
  overflow-x: auto;
}

.dependencies-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.task-bar-row {
  position: relative;
  border-bottom: 1px solid #f3f4f6;
}

.task-bar {
  position: absolute;
  top: 7px;
  height: 36px;
  border-radius: 6px;
  cursor: move;
  transition: box-shadow 0.2s;
  user-select: none;
}

.task-bar:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.task-bar.is-selected {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.task-bar.is-dragging {
  opacity: 0.8;
  cursor: grabbing;
}

.task-bar.is-milestone {
  width: 24px !important;
  height: 24px;
  top: 13px;
  border-radius: 50%;
  background: #fbbf24 !important;
  border: 3px solid #f59e0b;
  cursor: pointer;
}

/* 拖拽手柄 */
.drag-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  opacity: 0;
  transition: opacity 0.2s;
}

.task-bar:hover .drag-handle {
  opacity: 1;
}

.drag-handle-left {
  left: 0;
  border-radius: 6px 0 0 6px;
}

.drag-handle-right {
  right: 0;
  border-radius: 0 6px 6px 0;
}

.drag-handle:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 进度条 */
.task-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px 0 0 6px;
  cursor: col-resize;
  transition: background 0.2s;
}

.task-progress.is-dragging {
  background: rgba(0, 0, 0, 0.3);
}

.progress-handle {
  position: absolute;
  right: -3px;
  top: 0;
  bottom: 0;
  width: 6px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0 6px 6px 0;
  cursor: col-resize;
}

.task-label {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 60px);
  pointer-events: none;
}

.task-progress-text {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  pointer-events: none;
}

/* 拖拽预览线 */
.drag-preview-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #3b82f6;
  z-index: 100;
  pointer-events: none;
}

/* 今天标记线 */
.today-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ef4444;
  z-index: 10;
  pointer-events: none;
}

.today-marker::before {
  content: '';
  position: absolute;
  top: 0;
  left: -4px;
  width: 10px;
  height: 10px;
  background: #ef4444;
  border-radius: 50%;
}

.today-label {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: #ef4444;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.today-label::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #ef4444;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
}

.dialog-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.color-picker {
  display: flex;
  gap: 0.5rem;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #111827;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-secondary {
  background: white;
  border: 1px solid #d1d5db;
}
</style>
