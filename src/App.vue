<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <h1>Plan View - 战略规划展示</h1>
        <div class="header-controls">
          <button
            class="view-mode-toggle"
            :class="{ active: viewMode === ViewMode.GANTT }"
            @click="toggleViewMode"
          >
            {{ viewMode === ViewMode.GRID ? '📊 切换到甘特图' : '📈 切换到网格视图' }}
          </button>
          <TimeHierarchySwitcher v-if="viewMode === ViewMode.GRID" />
        </div>
      </div>
    </header>

    <main class="app-main">
      <!-- 网格视图 -->
      <component
        v-if="viewMode === ViewMode.GRID"
        :is="currentViewComponent"
      />
      <!-- 甘特图视图 -->
      <GanttChart v-else />
    </main>

    <footer class="app-footer">
      <p>Plan View - 战略规划可视化工具 | 支持 7 个时间层级：10年 → 5年 → 3年 → 1年 → 季度(4,13) → 月度(2,13) → 周度(1,20)</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useViewStore } from '@/stores/view'
import { usePlanningStore } from '@/stores/planning'
import TimeHierarchySwitcher from '@/components/timeline/TimeHierarchySwitcher.vue'
import GanttChart from '@/components/gantt/GanttChart.vue'
import { TimeLevel, ViewMode } from '@/types/planning'

// Dynamic view imports
import DecadeView from '@/views/DecadeView.vue'
import FiveYearView from '@/views/FiveYearView.vue'
import ThreeYearView from '@/views/ThreeYearView.vue'
import YearView from '@/views/YearView.vue'
import QuarterlyView from '@/views/QuarterlyView.vue'
import MonthlyView from '@/views/MonthlyView.vue'
import WeeklyView from '@/views/WeeklyView.vue'

const viewStore = useViewStore()
const planningStore = usePlanningStore()
const viewMode = ref<ViewMode>(ViewMode.GRID)

const viewComponents: Record<string, any> = {
  [TimeLevel.DECADE]: DecadeView,
  [TimeLevel.FIVE_YEAR]: FiveYearView,
  [TimeLevel.THREE_YEAR]: ThreeYearView,
  [TimeLevel.YEAR]: YearView,
  [TimeLevel.QUARTERLY]: QuarterlyView,
  [TimeLevel.MONTHLY]: MonthlyView,
  [TimeLevel.WEEKLY]: WeeklyView
}

const currentViewComponent = computed(() => {
  return viewComponents[viewStore.currentLevel] || DecadeView
})

function toggleViewMode() {
  viewMode.value = viewMode.value === ViewMode.GRID ? ViewMode.GANTT : ViewMode.GRID
}

onMounted(() => {
  // 从 API 加载数据
  planningStore.loadFromApi()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.app-header {
  background: white;
  border-bottom: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}

.app-header h1 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: #111827;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.view-mode-toggle {
  padding: 0.5rem 1rem;
  border: 2px solid #3b82f6;
  background: white;
  color: #3b82f6;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.view-mode-toggle:hover {
  background: #3b82f6;
  color: white;
}

.view-mode-toggle.active {
  background: #3b82f6;
  color: white;
}

.app-main {
  flex: 1;
  padding: 2rem;
  overflow: hidden;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.app-footer {
  background: #f9fafb;
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .app-main {
    padding: 1rem;
  }

  .header-content {
    padding: 1rem;
  }

  .app-header h1 {
    font-size: 1.25rem;
  }

  .header-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
