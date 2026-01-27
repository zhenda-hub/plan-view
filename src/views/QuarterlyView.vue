<template>
  <div class="quarterly-view">
    <h2>{{ periodRange.start.getFullYear() }} 年 季度计划</h2>
    <div class="quarters-container">
      <div
        v-for="(quarter, qIndex) in quarters"
        :key="qIndex"
        class="quarter"
      >
        <div class="quarter-header">{{ quarter.label }}</div>
        <div class="months-grid">
          <div
            v-for="(month, mIndex) in quarter.months"
            :key="mIndex"
            class="month-cell"
            :class="{ 'has-events': hasEventsInMonth(month) }"
          >
            <div class="month-label">{{ month.label }}</div>
            <div class="month-events">
              <div
                v-for="event in getEventsForMonth(month)"
                :key="event.id"
                class="event"
                :style="{ backgroundColor: event.color }"
                :title="event.description"
              >
                {{ event.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { generateQuarterlyPattern } from '@/utils/patternGenerators'
import { usePlanningStore } from '@/stores/planning'
import { useViewStore } from '@/stores/view'
import { getPeriodStart } from '@/utils/dateHelpers'
import { TimeLevel } from '@/types/planning'

const planningStore = usePlanningStore()
const viewStore = useViewStore()

const periodRange = computed(() => ({
  start: getPeriodStart(viewStore.currentDate, TimeLevel.QUARTERLY),
  end: new Date()
}))

const quarters = ref(generateQuarterlyPattern(periodRange.value.start))

// 重新生成季度数据
watch(() => viewStore.currentDate, () => {
  quarters.value = generateQuarterlyPattern(periodRange.value.start)
})

const items = computed(() => planningStore.getItemsByLevel(TimeLevel.QUARTERLY))

function hasEventsInMonth(month: any): boolean {
  return getEventsForMonth(month).length > 0
}

function getEventsForMonth(month: any) {
  return items.value.filter(item => {
    const start = new Date(item.startDate)
    const end = new Date(item.endDate)
    return start <= month.end && end >= month.start
  })
}
</script>

<style scoped>
.quarterly-view {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.quarterly-view h2 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.quarters-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.quarter {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.quarter-header {
  background: #dbeafe;
  padding: 0.75rem;
  font-weight: 600;
  text-align: center;
  border-bottom: 2px solid #3b82f6;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.5rem;
  padding: 0.75rem;
}

.month-cell {
  min-height: 80px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  transition: all 0.2s;
}

.month-cell.has-events {
  background: #fefce8;
  border-color: #fbbf24;
}

.month-cell:hover {
  background: #eff6ff;
  border-color: #3b82f6;
}

.month-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.event {
  padding: 0.25rem 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
  cursor: pointer;
}

.event:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

@media (max-width: 1024px) {
  .quarters-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .quarters-container {
    grid-template-columns: 1fr;
  }
}
</style>
