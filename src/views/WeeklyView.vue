<template>
  <div class="weekly-view">
    <h2>{{ weekData.label }} 周计划</h2>
    <div class="days-container">
      <div
        v-for="(day, dIndex) in weekData.days"
        :key="dIndex"
        class="day-cell"
        :class="{
          'has-events': hasEventsInDay(day),
          'is-today': isToday(day),
          'is-weekend': dIndex >= 5
        }"
      >
        <div class="day-header">
          <div class="day-label">{{ day.label }}</div>
          <div class="day-date">{{ formatDayDate(day) }}</div>
        </div>
        <div class="day-events">
          <div
            v-for="event in getEventsForDay(day)"
            :key="event.id"
            class="event"
            :style="{ backgroundColor: event.color }"
            :title="event.description"
          >
            <div class="event-title">{{ event.title }}</div>
            <div class="event-time">{{ formatEventTime(event) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { generateWeeklyPattern } from '@/utils/patternGenerators'
import { usePlanningStore } from '@/stores/planning'
import { useViewStore } from '@/stores/view'
import { getPeriodStart } from '@/utils/dateHelpers'
import { TimeLevel } from '@/types/planning'
import dayjs from 'dayjs'

const planningStore = usePlanningStore()
const viewStore = useViewStore()

const periodStart = computed(() => getPeriodStart(viewStore.currentDate, TimeLevel.WEEKLY))

const weekData = ref(generateWeeklyPattern(periodStart.value))

// 重新生成周数据
watch(() => viewStore.currentDate, () => {
  weekData.value = generateWeeklyPattern(periodStart.value)
})

const items = computed(() => planningStore.getItemsByLevel(TimeLevel.WEEKLY))

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

function formatDayDate(day: any): string {
  return dayjs(day.start).format('MM/DD')
}

function formatEventTime(event: any): string {
  const start = dayjs(event.startDate).format('HH:mm')
  const end = dayjs(event.endDate).format('HH:mm')
  return `${start} - ${end}`
}

function isToday(day: any): boolean {
  return dayjs(day.start).isSame(dayjs(), 'day')
}
</script>

<style scoped>
.weekly-view {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.weekly-view h2 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.days-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
  padding: 1rem;
}

.day-cell {
  min-height: 200px;
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
}

.day-cell.has-events {
  background: #fefce8;
  border-color: #fbbf24;
}

.day-cell.is-today {
  background: #dbeafe;
  border-color: #3b82f6;
  border-width: 3px;
}

.day-cell.is-weekend {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.day-cell:hover {
  border-color: #22c55e;
  background: #f0fdf4;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.day-header {
  text-align: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.day-label {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.day-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event {
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.event:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.event-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.event-time {
  font-size: 0.625rem;
  opacity: 0.9;
}

@media (max-width: 1024px) {
  .days-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 640px) {
  .days-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .day-cell {
    min-height: 150px;
  }
}

@media (max-width: 480px) {
  .days-container {
    grid-template-columns: 1fr;
  }
}
</style>
