/**
 * Animation Performance Monitoring System
 * 
 * This composable provides comprehensive animation performance monitoring
 * including FPS tracking, animation registry, and automatic performance optimization.
 * 
 * Requirements: 2.1, 2.2
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

// Animation configuration interface
interface AnimationConfig {
  reducedMotion: boolean
  performanceMode: 'high' | 'balanced' | 'minimal'
  concurrentLimit: number
  maxDuration: number
  enableAutoOptimization: boolean
}

// Animation registry entry
interface AnimationEntry {
  id: string
  element: HTMLElement | null
  type: 'essential' | 'enhancement' | 'decorative'
  startTime: number
  duration: number
  properties: string[]
}

// Performance metrics
interface PerformanceMetrics {
  currentFPS: number
  averageFPS: number
  activeAnimationCount: number
  droppedFrames: number
  performanceScore: number
}

// Default configuration
const DEFAULT_CONFIG: AnimationConfig = {
  reducedMotion: false,
  performanceMode: 'balanced',
  concurrentLimit: 3,
  maxDuration: 600,
  enableAutoOptimization: true
}

export const useAnimationMonitor = () => {
  // Reactive state
  const config = reactive<AnimationConfig>({ ...DEFAULT_CONFIG })
  const activeAnimations = reactive(new Map<string, AnimationEntry>())
  const metrics = reactive<PerformanceMetrics>({
    currentFPS: 60,
    averageFPS: 60,
    activeAnimationCount: 0,
    droppedFrames: 0,
    performanceScore: 100
  })

  // Performance tracking variables
  let frameCount = 0
  let lastTime = performance.now()
  let fpsHistory: number[] = []
  let animationFrameId: number | null = null
  let performanceObserver: PerformanceObserver | null = null

  // Check for reduced motion preference
  const checkReducedMotion = () => {
    if (typeof window !== 'undefined') {
      config.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  }

  // FPS monitoring function
  const measureFPS = () => {
    const currentTime = performance.now()
    const deltaTime = currentTime - lastTime
    
    if (deltaTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / deltaTime)
      metrics.currentFPS = fps
      
      // Update FPS history (keep last 10 measurements)
      fpsHistory.push(fps)
      if (fpsHistory.length > 10) {
        fpsHistory.shift()
      }
      
      // Calculate average FPS
      metrics.averageFPS = Math.round(
        fpsHistory.reduce((sum, fps) => sum + fps, 0) / fpsHistory.length
      )
      
      // Track dropped frames
      if (fps < 55) {
        metrics.droppedFrames++
      }
      
      // Calculate performance score (0-100)
      metrics.performanceScore = Math.max(0, Math.min(100, 
        (metrics.averageFPS / 60) * 100
      ))
      
      frameCount = 0
      lastTime = currentTime
    }
    
    frameCount++
    
    if (animationFrameId) {
      animationFrameId = requestAnimationFrame(measureFPS)
    }
  }

  // Start performance monitoring
  const startMonitoring = () => {
    if (typeof window === 'undefined') return
    
    checkReducedMotion()
    
    // Start FPS monitoring
    lastTime = performance.now()
    animationFrameId = requestAnimationFrame(measureFPS)
    
    // Set up performance observer for long tasks
    if ('PerformanceObserver' in window) {
      try {
        performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.duration > 50) { // Long task threshold
              console.warn(`Long task detected: ${entry.duration}ms`)
              // Trigger performance optimization if enabled
              if (config.enableAutoOptimization) {
                optimizePerformance()
              }
            }
          })
        })
        performanceObserver.observe({ entryTypes: ['longtask'] })
      } catch (error) {
        console.warn('Performance Observer not supported:', error)
      }
    }
  }

  // Stop performance monitoring
  const stopMonitoring = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    
    if (performanceObserver) {
      performanceObserver.disconnect()
      performanceObserver = null
    }
  }

  // Register a new animation
  const registerAnimation = (
    id: string,
    element: HTMLElement | null,
    type: 'essential' | 'enhancement' | 'decorative' = 'enhancement',
    duration: number = 300,
    properties: string[] = ['transform', 'opacity']
  ): boolean => {
    // Check if we should limit animations
    if (shouldLimitAnimations() && type !== 'essential') {
      console.warn(`Animation ${id} blocked due to performance constraints`)
      return false
    }
    
    // Check concurrent animation limit
    if (activeAnimations.size >= config.concurrentLimit && type !== 'essential') {
      console.warn(`Animation ${id} queued - concurrent limit reached`)
      return false
    }
    
    const animationEntry: AnimationEntry = {
      id,
      element,
      type,
      startTime: performance.now(),
      duration: Math.min(duration, config.maxDuration),
      properties
    }
    
    activeAnimations.set(id, animationEntry)
    metrics.activeAnimationCount = activeAnimations.size
    
    // Auto-cleanup after duration
    setTimeout(() => {
      unregisterAnimation(id)
    }, animationEntry.duration + 100) // Small buffer for cleanup
    
    return true
  }

  // Unregister an animation
  const unregisterAnimation = (id: string) => {
    if (activeAnimations.has(id)) {
      activeAnimations.delete(id)
      metrics.activeAnimationCount = activeAnimations.size
    }
  }

  // Check if animations should be limited
  const shouldLimitAnimations = (): boolean => {
    if (config.reducedMotion) return true
    if (metrics.currentFPS < 45) return true
    if (config.performanceMode === 'minimal') return true
    if (metrics.performanceScore < 70) return true
    return false
  }

  // Automatic performance optimization
  const optimizePerformance = () => {
    const currentScore = metrics.performanceScore
    
    if (currentScore < 50) {
      // Severe performance issues - switch to minimal mode
      config.performanceMode = 'minimal'
      config.concurrentLimit = 1
      
      // Cancel non-essential animations
      for (const [id, animation] of activeAnimations.entries()) {
        if (animation.type === 'decorative') {
          unregisterAnimation(id)
        }
      }
      
      console.warn('Performance severely degraded - switched to minimal animation mode')
    } else if (currentScore < 70) {
      // Moderate performance issues - switch to balanced mode
      config.performanceMode = 'balanced'
      config.concurrentLimit = 2
      
      console.warn('Performance degraded - switched to balanced animation mode')
    }
  }

  // Get performance recommendations
  const getPerformanceRecommendations = (): string[] => {
    const recommendations: string[] = []
    
    if (metrics.currentFPS < 50) {
      recommendations.push('Consider reducing animation complexity')
    }
    
    if (metrics.activeAnimationCount > config.concurrentLimit) {
      recommendations.push('Too many concurrent animations - consider queuing')
    }
    
    if (metrics.droppedFrames > 5) {
      recommendations.push('Frequent frame drops detected - optimize animations')
    }
    
    if (config.performanceMode === 'high' && metrics.performanceScore < 80) {
      recommendations.push('Consider switching to balanced performance mode')
    }
    
    return recommendations
  }

  // Update configuration
  const updateConfig = (newConfig: Partial<AnimationConfig>) => {
    Object.assign(config, newConfig)
    checkReducedMotion()
  }

  // Computed properties
  const isPerformanceGood = computed(() => metrics.performanceScore >= 80)
  const shouldShowPerformanceWarning = computed(() => metrics.performanceScore < 60)
  const animationsByType = computed(() => {
    const byType = { essential: 0, enhancement: 0, decorative: 0 }
    for (const animation of activeAnimations.values()) {
      byType[animation.type]++
    }
    return byType
  })

  // Lifecycle hooks
  onMounted(() => {
    startMonitoring()
    
    // Listen for reduced motion changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      mediaQuery.addEventListener('change', checkReducedMotion)
    }
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // State
    config: readonly(config),
    metrics: readonly(metrics),
    activeAnimations: readonly(activeAnimations),
    
    // Computed
    isPerformanceGood,
    shouldShowPerformanceWarning,
    animationsByType,
    
    // Methods
    registerAnimation,
    unregisterAnimation,
    updateConfig,
    getPerformanceRecommendations,
    shouldLimitAnimations,
    optimizePerformance,
    startMonitoring,
    stopMonitoring
  }
}

// Global animation monitor instance (singleton pattern)
let globalAnimationMonitor: ReturnType<typeof useAnimationMonitor> | null = null

export const getGlobalAnimationMonitor = () => {
  if (!globalAnimationMonitor) {
    globalAnimationMonitor = useAnimationMonitor()
  }
  return globalAnimationMonitor
}