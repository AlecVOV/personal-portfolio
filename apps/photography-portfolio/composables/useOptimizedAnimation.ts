/**
 * Optimized Animation Utility
 * 
 * This composable provides a simplified interface for registering and managing
 * animations with automatic performance monitoring and optimization.
 * 
 * Requirements: 2.1, 2.2
 */

import { ref, onUnmounted, nextTick } from 'vue'
import { getGlobalAnimationMonitor } from './useAnimationMonitor'

interface AnimationOptions {
  type?: 'essential' | 'enhancement' | 'decorative'
  duration?: number
  properties?: string[]
  delay?: number
  easing?: string
}

export const useOptimizedAnimation = () => {
  const monitor = getGlobalAnimationMonitor()
  const registeredAnimations = new Set<string>()

  // Generate unique animation ID
  const generateAnimationId = (prefix: string = 'anim'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Register and execute an animation
  const animate = async (
    element: HTMLElement | null,
    animationName: string,
    options: AnimationOptions = {}
  ): Promise<boolean> => {
    if (!element) {
      console.warn('Cannot animate null element')
      return false
    }

    const {
      type = 'enhancement',
      duration = 300,
      properties = ['transform', 'opacity'],
      delay = 0,
      easing = 'ease-out'
    } = options

    const animationId = generateAnimationId(animationName)

    // Check if animation should be registered
    const canAnimate = monitor.registerAnimation(
      animationId,
      element,
      type,
      duration,
      properties
    )

    if (!canAnimate) {
      // Animation was blocked due to performance constraints
      return false
    }

    registeredAnimations.add(animationId)

    try {
      // Apply delay if specified
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Apply animation styles
      element.style.transition = `${properties.join(', ')} ${duration}ms ${easing}`
      
      // Add animation class if it exists
      const animationClass = `animate-${animationName}`
      if (element.classList) {
        element.classList.add(animationClass)
      }

      // Wait for animation to complete
      await new Promise<void>((resolve) => {
        const cleanup = () => {
          element.removeEventListener('transitionend', onTransitionEnd)
          element.removeEventListener('animationend', onAnimationEnd)
          resolve()
        }

        const onTransitionEnd = (event: TransitionEvent) => {
          if (event.target === element) {
            cleanup()
          }
        }

        const onAnimationEnd = (event: AnimationEvent) => {
          if (event.target === element) {
            cleanup()
          }
        }

        element.addEventListener('transitionend', onTransitionEnd)
        element.addEventListener('animationend', onAnimationEnd)

        // Fallback timeout
        setTimeout(cleanup, duration + 100)
      })

      return true
    } catch (error) {
      console.error(`Animation ${animationId} failed:`, error)
      return false
    } finally {
      // Cleanup
      monitor.unregisterAnimation(animationId)
      registeredAnimations.delete(animationId)
    }
  }

  // Animate element entrance
  const animateIn = (
    element: HTMLElement | null,
    type: 'fade' | 'slide' | 'scale' = 'fade',
    options: AnimationOptions = {}
  ) => {
    if (!element) return Promise.resolve(false)

    const animationOptions: AnimationOptions = {
      type: 'enhancement',
      ...options
    }

    switch (type) {
      case 'fade':
        element.style.opacity = '0'
        nextTick(() => {
          element.style.opacity = '1'
        })
        return animate(element, 'fade-in', animationOptions)

      case 'slide':
        element.style.transform = 'translateY(20px)'
        element.style.opacity = '0'
        nextTick(() => {
          element.style.transform = 'translateY(0)'
          element.style.opacity = '1'
        })
        return animate(element, 'slide-in', animationOptions)

      case 'scale':
        element.style.transform = 'scale(0.9)'
        element.style.opacity = '0'
        nextTick(() => {
          element.style.transform = 'scale(1)'
          element.style.opacity = '1'
        })
        return animate(element, 'scale-in', animationOptions)

      default:
        return Promise.resolve(false)
    }
  }

  // Animate element exit
  const animateOut = (
    element: HTMLElement | null,
    type: 'fade' | 'slide' | 'scale' = 'fade',
    options: AnimationOptions = {}
  ) => {
    if (!element) return Promise.resolve(false)

    const animationOptions: AnimationOptions = {
      type: 'enhancement',
      ...options
    }

    switch (type) {
      case 'fade':
        element.style.opacity = '0'
        return animate(element, 'fade-out', animationOptions)

      case 'slide':
        element.style.transform = 'translateY(-20px)'
        element.style.opacity = '0'
        return animate(element, 'slide-out', animationOptions)

      case 'scale':
        element.style.transform = 'scale(0.9)'
        element.style.opacity = '0'
        return animate(element, 'scale-out', animationOptions)

      default:
        return Promise.resolve(false)
    }
  }

  // Animate hover effect
  const animateHover = (
    element: HTMLElement | null,
    isHovering: boolean,
    options: AnimationOptions = {}
  ) => {
    if (!element) return Promise.resolve(false)

    const animationName = isHovering ? 'hover-in' : 'hover-out'
    const scale = isHovering ? 'scale(1.05)' : 'scale(1)'
    
    element.style.transform = scale
    
    return animate(element, animationName, {
      duration: 200,
      properties: ['transform'],
      ...options
    })
  }

  // Batch animate multiple elements with stagger
  const animateStagger = async (
    elements: HTMLElement[],
    animationType: 'fade' | 'slide' | 'scale' = 'fade',
    staggerDelay: number = 100,
    options: AnimationOptions = {}
  ): Promise<boolean[]> => {
    const promises = elements.map((element, index) => {
      return animateIn(element, animationType, {
        ...options,
        delay: index * staggerDelay
      })
    })

    return Promise.all(promises)
  }

  // Check if animations should be simplified
  const shouldSimplifyAnimations = () => {
    return monitor.shouldLimitAnimations()
  }

  // Get current performance metrics
  const getPerformanceMetrics = () => {
    return monitor.metrics
  }

  // Cleanup all registered animations
  const cleanup = () => {
    registeredAnimations.forEach(id => {
      monitor.unregisterAnimation(id)
    })
    registeredAnimations.clear()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    // Animation methods
    animate,
    animateIn,
    animateOut,
    animateHover,
    animateStagger,
    
    // Utility methods
    shouldSimplifyAnimations,
    getPerformanceMetrics,
    cleanup,
    
    // State
    registeredAnimations: readonly(registeredAnimations)
  }
}