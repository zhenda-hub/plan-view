<template>
  <div class="monthly-view">
    <h2>{{ monthData.label }} 月度计划</h2>
    <div class="days-grid">
      <div
        v-for="(day, dIndex) in monthData.days"
        :key="dIndex"
        class="day-cell"
        :class="{
          'has-events': hasEventsInDay(day),
          'is-weekend': day.dayOfWeek === 0 || day.dayOfWeek === 6,
          'is-today': isToday(day)
        }"
      >
        <div class="day-label">{{ day.label }}</div>
        <div class="day-events">
          <div
            v-for="event in getEventsForDay(day)"
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
import { ref, computed, watch } from 'vue'
import { generateMonthlyPattern } from '@/utils/patternGenerators'
import { usePlanningStore } from '@/stores/planning'
import { useViewStore } from '@/stores/view'
import { getPeriodStart } from '@/utils/dateHelpers'
import { TimeLevel } from '@/types/planning'
import dayjs from 'dayjs'

const planningStore = usePlanningStore()
const viewStore = useViewStore()

const periodStart = computed(() => getPeriodStart(viewStore.currentDate, TimeLevel.MONTHLY))

const monthData = ref(generateMonthlyPattern(periodStart.value))

// 重新生成月度数据
watch(() => viewStore.currentDate, () => {
  monthData.value = generateMonthlyPattern(periodStart.value)
})

const items = computed(() => planningStore.getItemsByLevel(TimeLevel.MONTHLY))

function hasEventsInDay(day: any): boolean {
  return getEventsForDay(day).length > 0
}

function getEventsForDay(day: any) {
  return items.value.filter(item => {
    const start = new Date(item.startDate)
    const end = new Date(item.endDate)
    return start <= day.end && end >= day.start
  })
}

function isToday(day: any): boolean {
  return dayjs(day.start).isSame(dayjs(), 'day')
}
</script>

<style scoped>
.monthly-view {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.monthly-view h2 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  padding: 1rem;
}

.day-cell {
  min-height: 100px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  transition: all 0.2s;
}

.day-cell.has-events {
  background: #fefce8;
  border-color: #fbbf24;
}

.day-cell.is-weekend {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.day-cell.is-today {
  background: #dbeafe;
  border-color: #3b82f6;
  border-width: 2px;
}

.day-cell:hover {
  border-color: #ec4899;
  background: #fdf2f8;
}

.day-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
  text-align: center;
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
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .days-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 480px) {
  .days-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .day-cell {
    min-height: 80px;
  }
}
</style>
