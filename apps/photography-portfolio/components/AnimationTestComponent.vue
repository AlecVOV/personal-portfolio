<template>
  <div class="p-8 space-y-4">
    <h2 class="text-2xl font-bold mb-4">Animation Performance Test</h2>
    
    <!-- Test buttons -->
    <div class="flex gap-4 flex-wrap">
      <button
        @click="testSingleAnimation"
        class="btn btn-primary"
      >
        Test Single Animation
      </button>
      
      <button
        @click="testMultipleAnimations"
        class="btn btn-outline"
      >
        Test Multiple Animations
      </button>
      
      <button
        @click="testStaggeredAnimations"
        class="btn btn-outline"
      >
        Test Staggered Animations
      </button>
      
      <button
        @click="stressTest"
        class="btn btn-outline"
      >
        Stress Test
      </button>
    </div>
    
    <!-- Test elements -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <div
        v-for="(item, index) in testItems"
        :key="index"
        ref="testElements"
        class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg text-center"
        :class="{ 'opacity-0': !item.visible }"
      >
        <div class="text-lg font-semibold mb-2">Test Item {{ index + 1 }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Status: {{ item.status }}
        </div>
      </div>
    </div>
    
    <!-- Performance metrics display -->
    <div class="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Performance Metrics</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="font-medium">FPS:</span>
          <span :class="fpsColor" class="ml-1">{{ metrics.currentFPS }}</span>
        </div>
        <div>
          <span class="font-medium">Active:</span>
          <span class="ml-1">{{ metrics.activeAnimationCount }}</span>
        </div>
        <div>
          <span class="font-medium">Score:</span>
          <span :class="scoreColor" class="ml-1">{{ metrics.performanceScore }}%</span>
        </div>
        <div>
          <span class="font-medium">Mode:</span>
          <span class="ml-1">{{ config.performanceMode }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOptimizedAnimation } from '~/composables/useOptimizedAnimation'
import { getGlobalAnimationMonitor } from '~/composables/useAnimationMonitor'

// Animation utilities
const { animateIn, animateStagger, getPerformanceMetrics } = useOptimizedAnimation()
const monitor = getGlobalAnimationMonitor()

// Reactive state
const testElements = ref<HTMLElement[]>([])
const testItems = ref(
  Array.from({ length: 6 }, (_, index) => ({
    visible: true,
    status: 'Ready'
  }))
)

// Performance metrics
const { config, metrics } = monitor

const fpsColor = computed(() => {
  const fps = metrics.currentFPS
  if (fps >= 55) return 'text-green-600'
  if (fps >= 45) return 'text-yellow-600'
  return 'text-red-600'
})

const scoreColor = computed(() => {
  const score = metrics.performanceScore
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
})

// Test methods
const testSingleAnimation = async () => {
  const element = testElements.value[0]
  if (!element) return

  testItems.value[0].status = 'Animating...'
  
  try {
    await animateIn(element, 'scale', {
      duration: 500,
      type: 'enhancement'
    })
    testItems.value[0].status = 'Complete'
  } catch (error) {
    testItems.value[0].status = 'Failed'
  }
  
  setTimeout(() => {
    testItems.value[0].status = 'Ready'
  }, 2000)
}

const testMultipleAnimations = async () => {
  const elements = testElements.value.slice(0, 3)
  
  elements.forEach((_, index) => {
    testItems.value[index].status = 'Animating...'
  })
  
  try {
    const promises = elements.map((element, index) => 
      animateIn(element, 'fade', {
        duration: 400,
        type: 'enhancement',
        delay: index * 100
      })
    )
    
    await Promise.all(promises)
    
    elements.forEach((_, index) => {
      testItems.value[index].status = 'Complete'
    })
  } catch (error) {
    elements.forEach((_, index) => {
      testItems.value[index].status = 'Failed'
    })
  }
  
  setTimeout(() => {
    elements.forEach((_, index) => {
      testItems.value[index].status = 'Ready'
    })
  }, 2000)
}

const testStaggeredAnimations = async () => {
  const elements = testElements.value
  
  elements.forEach((_, index) => {
    testItems.value[index].status = 'Animating...'
  })
  
  try {
    await animateStagger(elements, 'slide', 150, {
      duration: 300,
      type: 'enhancement'
    })
    
    elements.forEach((_, index) => {
      testItems.value[index].status = 'Complete'
    })
  } catch (error) {
    elements.forEach((_, index) => {
      testItems.value[index].status = 'Failed'
    })
  }
  
  setTimeout(() => {
    elements.forEach((_, index) => {
      testItems.value[index].status = 'Ready'
    })
  }, 2000)
}

const stressTest = async () => {
  // Create many rapid animations to test performance limiting
  const elements = testElements.value
  
  elements.forEach((_, index) => {
    testItems.value[index].status = 'Stress Testing...'
  })
  
  // Rapid fire animations
  for (let i = 0; i < 10; i++) {
    elements.forEach((element, index) => {
      animateIn(element, 'scale', {
        duration: 200,
        type: 'decorative',
        delay: i * 50
      })
    })
  }
  
  setTimeout(() => {
    elements.forEach((_, index) => {
      testItems.value[index].status = 'Ready'
    })
  }, 3000)
}

onMounted(() => {
  // Ensure elements are properly referenced
  setTimeout(() => {
    console.log('Test elements:', testElements.value.length)
  }, 100)
})
</script>