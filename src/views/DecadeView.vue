<template>
  <div class="decade-view">
    <h2>{{ periodRange.start.getFullYear() }} - {{ periodRange.end.getFullYear() }} 十年规划</h2>
    <div class="years-grid">
      <div
        v-for="year in years"
        :key="year"
        class="year-cell"
        :class="{ 'has-events': hasEventsInYear(year) }"
      >
        <div class="year-label">{{ year }}年</div>
        <div class="year-events">
          <div
            v-for="event in getEventsForYear(year)"
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlanningStore } from '@/stores/planning'
import { useViewStore } from '@/stores/view'
import { getPeriodStart, getPeriodEnd } from '@/utils/dateHelpers'
import { TimeLevel } from '@/types/planning'

const planningStore = usePlanningStore()
const viewStore = useViewStore()

const periodRange = computed(() => ({
  start: getPeriodStart(viewStore.currentDate, TimeLevel.DECADE),
  end: getPeriodEnd(viewStore.currentDate, TimeLevel.DECADE)
}))

const years = computed(() => {
  const startYear = periodRange.value.start.getFullYear()
  return Array.from({ length: 10 }, (_, i) => startYear + i)
})

const items = computed(() => planningStore.getItemsByLevel(TimeLevel.DECADE))

function hasEventsInYear(year: number): boolean {
  return items.value.some(item => {
    const startYear = item.startDate.getFullYear()
    const endYear = item.endDate.getFullYear()
    return year >= startYear && year <= endYear
  })
}

function getEventsForYear(year: number) {
  return items.value.filter(item => {
    const startYear = item.startDate.getFullYear()
    const endYear = item.endDate.getFullYear()
    return year >= startYear && year <= endYear
  })
}
</script>

<style scoped>
.decade-view {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.decade-view h2 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.years-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.year-cell {
  min-height: 100px;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
}

.year-cell.has-events {
  border-color: #3b82f6;
  background: #eff6ff;
}

.year-label {
  font-weight: 600;
  font-size: 1rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.event {
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.event:hover {
  opacity: 0.9;
  transform: scale(1.02);
}
</style>
