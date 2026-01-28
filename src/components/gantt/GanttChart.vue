<template>
  <div class="gantt-chart">
    <!-- 工具栏 -->
    <div class="gantt-toolbar">
      <button class="toolbar-btn primary" @click="handleAddTask">
        ➕ 新建任务
      </button>
      <button
        class="toolbar-btn danger"
        :disabled="!ganttStore.selectedTaskId"
        @click="handleDeleteTask"
      >
        🗑️ 删除
      </button>
      <div class="toolbar-divider"></div>
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
        <div class="timeline-body">
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
                'is-selected': ganttStore.selectedTaskId === task.id
              }"
              :style="getTaskBarStyle(task)"
              @click="handleSelectTask(task.id)"
              @dblclick="handleEditTask(task)"
            >
              <div
                v-if="ganttStore.config.showProgress && task.progress && task.type !== 'milestone'"
                class="task-progress"
                :style="{ width: task.progress + '%' }"
              />
              <span class="task-label">{{ task.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务编辑对话框 -->
    <div v-if="editingTask" class="dialog-overlay" @click="handleCancelEdit">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>编辑任务</h3>
          <button class="close-btn" @click="handleCancelEdit">✕</button>
        </div>
        <form @submit.prevent="handleSaveTask" class="dialog-form">
          <div class="form-group">
            <label>任务名称 *</label>
            <input v-model="editForm.title" type="text" required />
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
              </select>
            </div>
            <div class="form-group" v-if="editForm.type === 'task'">
              <label>进度 (%)</label>
              <input v-model.number="editForm.progress" type="number" min="0" max="100" />
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

const editForm = ref({
  title: '',
  startDate: '',
  endDate: '',
  type: 'task',
  progress: 0,
  color: '#3b82f6'
})

// 获取或创建默认项目
async function getOrCreateProject() {
  try {
    const projects = await projectApi.getAll()
    if (projects.length > 0) {
      return projects[0].id
    }

    // 如果没有项目，创建一个默认项目
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

// 任务列表（扁平化）
const tasks = computed(() => {
  return planningStore.items.map((item) => ({
    ...item,
    level: item.level,
    rowIndex: 0 // 简化处理，实际需要计算层级
  }))
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

// 添加任务
async function handleAddTask() {
  // 确保有项目 ID
  if (!currentProjectId.value) {
    currentProjectId.value = await getOrCreateProject()
  }

  const newTask: PlanningItem = {
    id: 'new-' + crypto.randomUUID(), // 使用 'new-' 前缀标识新任务
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
    startDate: dayjs(newTask.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(newTask.endDate).format('YYYY-MM-DD'),
    type: 'task',
    progress: 0,
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
    startDate: dayjs(task.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(task.endDate).format('YYYY-MM-DD'),
    type: task.type || 'task',
    progress: task.progress || 0,
    color: task.color || '#3b82f6'
  }
}

// 保存任务
async function handleSaveTask() {
  if (!editingTask.value) return

  try {
    // 确保有项目 ID
    if (!currentProjectId.value) {
      currentProjectId.value = await getOrCreateProject()
    }

    const isNewTask = editingTask.value.id.startsWith('new-')

    const taskData = {
      title: editForm.value.title,
      description: '',
      startDate: new Date(editForm.value.startDate),
      endDate: new Date(editForm.value.endDate),
      level: 'year',
      status: 'planned',
      progress: editForm.value.progress || 0,
      type: editForm.value.type,
      color: editForm.value.color,
      dependencies: editingTask.value.dependencies || [],
      projectId: currentProjectId.value
    }

    console.log('保存任务:', { isNewTask, editingTaskId: editingTask.value.id, taskData })

    if (isNewTask) {
      const result = await taskApi.create(taskData as any)
      console.log('创建成功:', result)
    } else {
      const result = await taskApi.update(editingTask.value.id, taskData)
      console.log('更新成功:', result)
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

onMounted(async () => {
  // 初始化项目 ID
  currentProjectId.value = await getOrCreateProject()
  // 加载任务数据
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
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.task-bar:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.task-bar.is-selected {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

.task-bar.is-milestone {
  width: 24px !important;
  height: 24px;
  top: 13px;
  border-radius: 50%;
  background: #fbbf24 !important;
  border: 3px solid #f59e0b;
}

.task-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px 0 0 6px;
  pointer-events: none;
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
  max-width: calc(100% - 16px);
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
  max-width: 500px;
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
.form-group select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
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
