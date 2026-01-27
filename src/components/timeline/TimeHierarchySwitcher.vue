<template>
  <div class="hierarchy-switcher">
    <div class="switcher-label">时间层级:</div>
    <div class="switcher-buttons">
      <button
        v-for="level in TIME_LEVELS"
        :key="level"
        :class="['switcher-button', { active: currentLevel === level }]"
        @click="switchLevel(level)"
      >
        {{ LEVEL_LABELS[level] }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TIME_LEVELS, LEVEL_LABELS } from '@/constants/timeLevels'
import { useViewStore } from '@/stores/view'
import { TimeLevel } from '@/types/planning'

const viewStore = useViewStore()

const currentLevel = computed(() => viewStore.currentLevel)

function switchLevel(level: TimeLevel) {
  viewStore.setCurrentLevel(level)
}
</script>

<style scoped>
.hierarchy-switcher {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.switcher-label {
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.switcher-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.switcher-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.switcher-button:hover {
  background: #f3f4f6;
}

.switcher-button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

@media (max-width: 768px) {
  .hierarchy-switcher {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
