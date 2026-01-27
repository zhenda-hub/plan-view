<template>
  <div class="year-view">
    <h2>{{ periodRange.start.getFullYear() }} 年度计划</h2>
    <div class="months-grid">
      <div
        v-for="(month, index) in months"
        :key="index"
        class="month-cell"
        :class="{ 'has-events': hasEventsInMonth(index) }"
      >
        <div class="month-label">{{ month }}</div>
        <div class="month-events">
          <div
            v-for="event in getEventsForMonth(index)"
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
  start: getPeriodStart(viewStore.currentDate, TimeLevel.YEAR),
  end: getPeriodEnd(viewStore.currentDate, TimeLevel.YEAR)
}))

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const items = computed(() => planningStore.getItemsByLevel(TimeLevel.YEAR))

function hasEventsInMonth(monthIndex: number): boolean {
  const year = periodRange.value.start.getFullYear()
  return items.value.some(item => {
    const startYear = item.startDate.getFullYear()
    const endYear = item.endDate.getFullYear()
    const startMonth = item.startDate.getMonth()
    const endMonth = item.endDate.getMonth()

    if (year >= startYear && year <= endYear) {
      if (startYear === endYear) {
        return monthIndex >= startMonth && monthIndex <= endMonth
      } else if (year === startYear) {
        return monthIndex >= startMonth
      } else if (year === endYear) {
        return monthIndex <= endMonth
      } else {
        return true
      }
    }
    return false
  })
}

function getEventsForMonth(monthIndex: number) {
  const year = periodRange.value.start.getFullYear()
  return items.value.filter(item => {
    const startYear = item.startDate.getFullYear()
    const endYear = item.endDate.getFullYear()
    const startMonth = item.startDate.getMonth()
    const endMonth = item.endDate.getMonth()

    if (year >= startYear && year <= endYear) {
      if (startYear === endYear) {
        return monthIndex >= startMonth && monthIndex <= endMonth
      } else if (year === startYear) {
        return monthIndex >= startMonth
      } else if (year === endYear) {
        return monthIndex <= endMonth
      } else {
        return true
      }
    }
    return false
  })
}
</script>

<style scoped>
.year-view {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.year-view h2 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.month-cell {
  min-height: 100px;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
}

.month-cell.has-events {
  border-color: #f59e0b;
  background: #fffbeb;
}

.month-label {
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
