<template>
  <div
    v-if="showMonitor"
    class="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm font-mono z-50 max-w-xs"
  >
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-bold">Animation Monitor</h3>
      <button
        @click="toggleMonitor"
        class="text-gray-300 hover:text-white"
        aria-label="Close monitor"
      >
        ×
      </button>
    </div>
    
    <!-- Performance Metrics -->
    <div class="space-y-1">
      <div class="flex justify-between">
        <span>FPS:</span>
        <span :class="fpsColor">{{ metrics.currentFPS }}</span>
      </div>
      
      <div class="flex justify-between">
        <span>Avg FPS:</span>
        <span :class="avgFpsColor">{{ metrics.averageFPS }}</span>
      </div>
      
      <div class="flex justify-between">
        <span>Active:</span>
        <span>{{ metrics.activeAnimationCount }}</span>
      </div>
      
      <div class="flex justify-between">
        <span>Score:</span>
        <span :class="scoreColor">{{ metrics.performanceScore }}%</span>
      </div>
      
      <div class="flex justify-between">
        <span>Mode:</span>
        <span>{{ config.performanceMode }}</span>
      </div>
    </div>
    
    <!-- Performance Warning -->
    <div
      v-if="shouldShowPerformanceWarning"
      class="mt-2 p-2 bg-red-600/20 border border-red-500/30 rounded text-xs"
    >
      ⚠️ Performance issues detected
    </div>
    
    <!-- Animation Breakdown -->
    <div v-if="metrics.activeAnimationCount > 0" class="mt-2 pt-2 border-t border-gray-600">
      <div class="text-xs text-gray-300 mb-1">Active Animations:</div>
      <div class="text-xs space-y-1">
        <div v-if="animationsByType.essential > 0">
          Essential: {{ animationsByType.essential }}
        </div>
        <div v-if="animationsByType.enhancement > 0">
          Enhancement: {{ animationsByType.enhancement }}
        </div>
        <div v-if="animationsByType.decorative > 0">
          Decorative: {{ animationsByType.decorative }}
        </div>
      </div>
    </div>
    
    <!-- Recommendations -->
    <div v-if="recommendations.length > 0" class="mt-2 pt-2 border-t border-gray-600">
      <div class="text-xs text-gray-300 mb-1">Recommendations:</div>
      <ul class="text-xs space-y-1">
        <li v-for="rec in recommendations" :key="rec" class="text-yellow-300">
          • {{ rec }}
        </li>
      </ul>
    </div>
  </div>
  
  <!-- Toggle Button (when monitor is hidden) -->
  <button
    v-else
    @click="toggleMonitor"
    class="fixed bottom-4 right-4 bg-black/60 text-white p-2 rounded-full z-50 hover:bg-black/80 transition-colors"
    aria-label="Show animation monitor"
  >
    📊
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getGlobalAnimationMonitor } from '~/composables/useAnimationMonitor'

// Props
interface Props {
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true
})

// Animation monitor instance
const monitor = getGlobalAnimationMonitor()

// Local state
const showMonitor = ref(false)

// Computed properties
const { config, metrics, shouldShowPerformanceWarning, animationsByType } = monitor

const fpsColor = computed(() => {
  const fps = metrics.currentFPS
  if (fps >= 55) return 'text-green-400'
  if (fps >= 45) return 'text-yellow-400'
  return 'text-red-400'
})

const avgFpsColor = computed(() => {
  const fps = metrics.averageFPS
  if (fps >= 55) return 'text-green-400'
  if (fps >= 45) return 'text-yellow-400'
  return 'text-red-400'
})

const scoreColor = computed(() => {
  const score = metrics.performanceScore
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
})

const recommendations = computed(() => {
  return monitor.getPerformanceRecommendations()
})

// Methods
const toggleMonitor = () => {
  showMonitor.value = !showMonitor.value
}

// Only show in development or when explicitly enabled
const isDevelopment = process.env.NODE_ENV === 'development'
const shouldShowComponent = computed(() => props.enabled && isDevelopment)
</script>

<style scoped>
/* Component-specific styles */
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>