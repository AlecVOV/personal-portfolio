/**
 * Animation Monitor Plugin
 * 
 * Automatically initializes the global animation monitoring system
 * and provides performance optimization features.
 * 
 * Requirements: 2.1, 2.2
 */

import { getGlobalAnimationMonitor } from '~/composables/useAnimationMonitor'

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.client) {
    const monitor = getGlobalAnimationMonitor()
    
    // Initialize monitoring
    monitor.startMonitoring()
    
    // Set up automatic performance optimization
    const checkPerformance = () => {
      const metrics = monitor.metrics
      
      // Auto-optimize if performance drops significantly
      if (metrics.performanceScore < 60 && monitor.config.enableAutoOptimization) {
        monitor.optimizePerformance()
      }
    }
    
    // Check performance every 5 seconds
    const performanceInterval = setInterval(checkPerformance, 5000)
    
    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        clearInterval(performanceInterval)
        monitor.stopMonitoring()
      })
    }
    
    // Provide global access for debugging
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore
      window.__animationMonitor = monitor
      console.log('Animation monitor initialized. Access via window.__animationMonitor')
    }
  }
})