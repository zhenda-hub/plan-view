import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface GanttViewState {
  showDependencies: boolean
  showProgress: boolean
  showResources: boolean
  criticalPathOnly: boolean
  zoomLevel: 'day' | 'week' | 'month'
}

export const useGanttStore = defineStore('gantt', () => {
  // 视图配置
  const config = ref<GanttViewState>({
    showDependencies: true,
    showProgress: true,
    showResources: false,
    criticalPathOnly: false,
    zoomLevel: 'week'
  })

  // UI 状态
  const selectedTaskId = ref<string | undefined>(undefined)
  const editingTaskId = ref<string | undefined>(undefined)
  const draggingTaskId = ref<string | undefined>(undefined)
  const connectingFromTaskId = ref<string | undefined>(undefined)

  // 操作
  function toggleDependencies() {
    config.value.showDependencies = !config.value.showDependencies
  }

  function toggleProgress() {
    config.value.showProgress = !config.value.showProgress
  }

  function toggleResources() {
    config.value.showResources = !config.value.showResources
  }

  function setZoomLevel(level: 'day' | 'week' | 'month') {
    config.value.zoomLevel = level
  }

  function selectTask(taskId: string | undefined) {
    selectedTaskId.value = taskId
  }

  function startEdit(taskId: string) {
    editingTaskId.value = taskId
  }

  function endEdit() {
    editingTaskId.value = undefined
  }

  function startDrag(taskId: string) {
    draggingTaskId.value = taskId
  }

  function endDrag() {
    draggingTaskId.value = undefined
  }

  function startConnection(taskId: string) {
    connectingFromTaskId.value = taskId
  }

  function cancelConnection() {
    connectingFromTaskId.value = undefined
  }

  return {
    config,
    selectedTaskId,
    editingTaskId,
    draggingTaskId,
    connectingFromTaskId,
    toggleDependencies,
    toggleProgress,
    toggleResources,
    setZoomLevel,
    selectTask,
    startEdit,
    endEdit,
    startDrag,
    endDrag,
    startConnection,
    cancelConnection
  }
})
