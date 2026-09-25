/**
 * Intersection Observer Animation Utility
 * 
 * Provides performance-optimized animations that only trigger when elements
 * are visible in the viewport, reducing unnecessary animation overhead.
 * 
 * Requirements: 2.1, 2.2
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useOptimizedAnimation } from './useOptimizedAnimation'

interface IntersectionAnimationOptions {
  threshold?: number
  rootMargin?: string
  animationType?: 'fade' | 'slide' | 'scale'
  animationOptions?: {
    duration?: number
    delay?: number
    type?: 'essential' | 'enhancement' | 'decorative'
  }
  once?: boolean
}

export const useIntersectionAnimation = (
  options: IntersectionAnimationOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    animationType = 'fade',
    animationOptions = {},
    once = true
  } = options

  const { animateIn, shouldSimplifyAnimations } = useOptimizedAnimation()
  
  const observedElements = new Map<Element, boolean>()
  let observer: IntersectionObserver | null = null

  // Initialize intersection observer
  const initializeObserver = () => {
    if (typeof window === 'undefined' || observer) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement
          const hasAnimated = observedElements.get(element)

          if (entry.isIntersecting && (!hasAnimated || !once)) {
            // Element is visible, trigger animation
            animateElement(element)
            
            if (once) {
              observedElements.set(element, true)
            }
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )
  }

  // Animate element when it becomes visible
  const animateElement = async (element: HTMLElement) => {
    // Skip animation if performance is poor and this is not essential
    if (shouldSimplifyAnimations() && animationOptions.type !== 'essential') {
      // Just make element visible without animation
      element.style.opacity = '1'
      element.style.transform = 'none'
      return
    }

    try {
      await animateIn(element, animationType, animationOptions)
    } catch (error) {
      console.warn('Intersection animation failed:', error)
      // Fallback: just make element visible
      element.style.opacity = '1'
      element.style.transform = 'none'
    }
  }

  // Observe an element for intersection-based animation
  const observe = (element: HTMLElement | null) => {
    if (!element || !observer) return

    // Set initial state for animation
    switch (animationType) {
      case 'fade':
        element.style.opacity = '0'
        break
      case 'slide':
        element.style.opacity = '0'
        element.style.transform = 'translateY(20px)'
        break
      case 'scale':
        element.style.opacity = '0'
        element.style.transform = 'scale(0.9)'
        break
    }

    // Start observing
    observer.observe(element)
    observedElements.set(element, false)
  }

  // Stop observing an element
  const unobserve = (element: HTMLElement | null) => {
    if (!element || !observer) return

    observer.unobserve(element)
    observedElements.delete(element)
  }

  // Observe multiple elements with stagger effect
  const observeMultiple = (
    elements: HTMLElement[],
    staggerDelay: number = 100
  ) => {
    elements.forEach((element, index) => {
      // Add stagger delay to animation options
      const staggeredOptions = {
        ...animationOptions,
        delay: (animationOptions.delay || 0) + (index * staggerDelay)
      }

      // Create a new intersection animation for each element
      const elementObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement
              animateIn(el, animationType, staggeredOptions)
              
              if (once) {
                elementObserver.unobserve(el)
              }
            }
          })
        },
        { threshold, rootMargin }
      )

      // Set initial state
      switch (animationType) {
        case 'fade':
          element.style.opacity = '0'
          break
        case 'slide':
          element.style.opacity = '0'
          element.style.transform = 'translateY(20px)'
          break
        case 'scale':
          element.style.opacity = '0'
          element.style.transform = 'scale(0.9)'
          break
      }

      elementObserver.observe(element)
    })
  }

  // Cleanup observer
  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    observedElements.clear()
  }

  // Initialize on mount
  onMounted(() => {
    initializeObserver()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    observe,
    unobserve,
    observeMultiple,
    cleanup,
    isObserving: (element: HTMLElement) => observedElements.has(element)
  }
}

// Composable for simple fade-in on scroll
export const useFadeInOnScroll = (options: IntersectionAnimationOptions = {}) => {
  return useIntersectionAnimation({
    ...options,
    animationType: 'fade'
  })
}

// Composable for slide-in on scroll
export const useSlideInOnScroll = (options: IntersectionAnimationOptions = {}) => {
  return useIntersectionAnimation({
    ...options,
    animationType: 'slide'
  })
}

// Composable for scale-in on scroll
export const useScaleInOnScroll = (options: IntersectionAnimationOptions = {}) => {
  return useIntersectionAnimation({
    ...options,
    animationType: 'scale'
  })
}