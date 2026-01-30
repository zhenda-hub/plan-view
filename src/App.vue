<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <h1>Plan View - 战略规划展示</h1>
      </div>
    </header>

    <main class="app-main gantt-view">
      <!-- 甘特图视图 -->
      <JordiumGanttWrapper
        :items="planningStore.items"
        @update:item="handleUpdateItem"
        @add:item="handleAddItem"
        @delete:item="handleDeleteItem"
      />
    </main>

    <footer class="app-footer">
      <p>Plan View - 战略规划可视化工具 | 甘特图</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePlanningStore } from '@/stores/planning'
import JordiumGanttWrapper from '@/components/gantt/JordiumGanttWrapper.vue'
import { PlanningItem } from '@/types/planning'

const planningStore = usePlanningStore()

// 甘特图事件处理
function handleUpdateItem(item: PlanningItem) {
  planningStore.updateItem(item.id, item)
  // TODO: 调用 API 保存到后端
}

function handleAddItem(item: PlanningItem) {
  planningStore.addItem(item)
  // TODO: 调用 API 保存到后端
}

function handleDeleteItem(item: PlanningItem) {
  planningStore.deleteItem(item.id)
  // TODO: 调用 API 删除后端数据
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
  margin: 0;
  font-size: 1.5rem;
  color: #111827;
}

.app-main {
  flex: 1;
  padding: 1rem;
  overflow: hidden;
  width: 100%;
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
    padding: 0.5rem;
  }

  .header-content {
    padding: 1rem;
  }

  .app-header h1 {
    font-size: 1.25rem;
  }
}
</style>
