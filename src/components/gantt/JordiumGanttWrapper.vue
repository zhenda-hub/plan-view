<template>
  <div class="jordium-gantt-wrapper">
    <GanttChart
      :tasks="jordiumTasks"
      :show-toolbar="showToolbar"
      :allow-drag-and-resize="allowDragAndResize"
      :use-default-drawer="useDefaultDrawer"
      :time-scale="timeScale"
      :locale="locale"
      :theme="theme"
      :task-bar-config="taskBarConfig"
      :auto-sort-by-start-date="autoSortByStartDate"
      :assignee-options="assigneeOptions"
      @task-added="handleTaskAdded"
      @task-updated="handleTaskUpdated"
      @task-deleted="handleTaskDeleted"
      @taskbar-drag-end="handleTaskDragEnd"
      @taskbar-resize-end="handleTaskResizeEnd"
      @task-click="handleTaskClick"
      @task-double-click="handleTaskDoubleClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { GanttChart } from 'jordium-gantt-vue3'
import type { Task } from 'jordium-gantt-vue3'
import 'jordium-gantt-vue3/dist/assets/jordium-gantt-vue3.css'
import type { PlanningItem } from '@/types/planning'
import { toJordiumTask, fromJordiumTask, type JordiumTask } from './taskAdapter'

// Props
interface Props {
  items: PlanningItem[]
  showToolbar?: boolean
  allowDragAndResize?: boolean
  useDefaultDrawer?: boolean
  timeScale?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
  locale?: 'zh-CN' | 'en-US'
  theme?: 'light' | 'dark'
  autoSortByStartDate?: boolean
  assigneeOptions?: Array<{ value: string | number; label: string }>
}

const props = withDefaults(defineProps<Props>(), {
  showToolbar: true,
  allowDragAndResize: true,
  useDefaultDrawer: true,
  timeScale: 'week',
  locale: 'zh-CN',
  theme: 'light',
  autoSortByStartDate: false,
  assigneeOptions: () => []
})

// Emits
interface Emits {
  (e: 'update:item', item: PlanningItem): void
  (e: 'add:item', item: PlanningItem): void
  (e: 'delete:item', item: PlanningItem): void
  (e: 'click:item', item: PlanningItem): void
  (e: 'dblclick:item', item: PlanningItem): void
}

const emit = defineEmits<Emits>()

// 状态
const itemsMap = ref(new Map<string, PlanningItem>())

// 监听 items 变化，更新映射
watch(() => props.items, (newItems) => {
  itemsMap.value.clear()
  for (const item of newItems) {
    itemsMap.value.set(item.id, item)
  }
}, { immediate: true, deep: true })

// 转换为 Jordium Task 格式
const jordiumTasks = computed<JordiumTask[]>(() => {
  return props.items.map(toJordiumTask)
})

// 任务条配置
const taskBarConfig = {
  showAvatar: false,
  showTitle: true,
  showProgress: true
}

// 处理任务添加
function handleTaskAdded(event: { task: Task }) {
  const newItem = fromJordiumTask(event.task as JordiumTask)
  emit('add:item', newItem)
}

// 处理任务更新
function handleTaskUpdated(event: { task: Task }) {
  const originalItem = itemsMap.value.get((event.task as any)._originalId)
  const updatedItem = fromJordiumTask(event.task as JordiumTask, originalItem)
  emit('update:item', updatedItem)
}

// 处理任务删除
function handleTaskDeleted(event: { task: Task }) {
  const originalItem = itemsMap.value.get((event.task as any)._originalId)
  if (originalItem) {
    emit('delete:item', originalItem)
  }
}

// 处理拖拽结束
function handleTaskDragEnd(task: Task) {
  const originalItem = itemsMap.value.get((task as any)._originalId)
  const updatedItem = fromJordiumTask(task as JordiumTask, originalItem)
  emit('update:item', updatedItem)
}

// 处理调整大小结束
function handleTaskResizeEnd(task: Task) {
  const originalItem = itemsMap.value.get((task as any)._originalId)
  const updatedItem = fromJordiumTask(task as JordiumTask, originalItem)
  emit('update:item', updatedItem)
}

// 处理任务点击
function handleTaskClick(task: Task, _event: MouseEvent) {
  const originalItem = itemsMap.value.get((task as any)._originalId)
  if (originalItem) {
    emit('click:item', originalItem)
  }
}

// 处理任务双击
function handleTaskDoubleClick(task: Task) {
  const originalItem = itemsMap.value.get((task as any)._originalId)
  if (originalItem) {
    emit('dblclick:item', originalItem)
  }
}
</script>

<style scoped>
.jordium-gantt-wrapper {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

/* 与现有主题保持一致 */
:deep(.gantt-container) {
  --primary-color: #3b82f6;
  --today-line-color: #ef4444;
}

/* 确保组件正确渲染 */
:deep(.gantt-chart) {
  height: 100%;
}
</style>
