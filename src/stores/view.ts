import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TimeLevel } from '@/types/planning'

export const useViewStore = defineStore('view', () => {
  // State
  const currentLevel = ref<TimeLevel>(TimeLevel.DECADE)
  const currentDate = ref<Date>(new Date())
  const selectedItemId = ref<string | undefined>(undefined)

  // Actions
  function setCurrentLevel(level: TimeLevel) {
    currentLevel.value = level
  }

  function setCurrentDate(date: Date) {
    currentDate.value = date
  }

  function selectItem(itemId: string | undefined) {
    selectedItemId.value = itemId
  }

  function resetView() {
    currentLevel.value = TimeLevel.DECADE
    currentDate.value = new Date()
    selectedItemId.value = undefined
  }

  return {
    currentLevel,
    currentDate,
    selectedItemId,
    setCurrentLevel,
    setCurrentDate,
    selectItem,
    resetView
  }
})
