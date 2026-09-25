export const usePerformance = () => {
  // Image optimization
  const optimizeImageUrl = (url: string, width = 400, height = 300, format = 'webp') => {
    // For external images, return as-is
    if (url.startsWith('http')) return url
    
    // For local images, you could integrate with a service like Cloudinary
    // or use Nuxt Image module
    return url
  }

  // Lazy loading with Intersection Observer
  const useLazyLoading = (threshold = 0.1) => {
    const observer = ref<IntersectionObserver | null>(null)
    const lazyElements = ref<Set<Element>>(new Set())

    const observe = (element: Element) => {
      if (observer.value) {
        observer.value.observe(element)
        lazyElements.value.add(element)
      }
    }

    const unobserve = (element: Element) => {
      if (observer.value) {
        observer.value.unobserve(element)
        lazyElements.value.delete(element)
      }
    }

    const initObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
      if (process.client && 'IntersectionObserver' in window) {
        observer.value = new IntersectionObserver(callback, {
          threshold,
          rootMargin: '50px'
        })
      }
    }

    const cleanup = () => {
      if (observer.value) {
        lazyElements.value.forEach(element => {
          observer.value?.unobserve(element)
        })
        observer.value.disconnect()
        lazyElements.value.clear()
      }
    }

    onUnmounted(() => {
      cleanup()
    })

    return {
      observe,
      unobserve,
      initObserver,
      cleanup
    }
  }

  // Debounce function for performance
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null
    
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Throttle function for performance
  const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let lastFunc: NodeJS.Timeout | null = null
    let lastRan: number | null = null
    
    return (...args: Parameters<T>) => {
      if (lastRan === null) {
        func(...args)
        lastRan = Date.now()
      } else {
        if (lastFunc) clearTimeout(lastFunc)
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan! >= limit) {
            func(...args)
            lastRan = Date.now()
          }
        }, limit - (Date.now() - lastRan))
      }
    }
  }

  // Preload critical images
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
      img.src = src
    })
  }

  const preloadImages = async (urls: string[]): Promise<void> => {
    const promises = urls.map(url => preloadImage(url))
    await Promise.allSettled(promises)
  }

  // Image error handling with fallback
  const handleImageError = (event: Event, fallbackUrl = '/images/placeholder.svg') => {
    const target = event.target as HTMLImageElement
    if (target.src !== fallbackUrl) {
      target.src = fallbackUrl
      target.alt = 'Image not available'
    }
  }

  return {
    optimizeImageUrl,
    useLazyLoading,
    debounce,
    throttle,
    preloadImage,
    preloadImages,
    handleImageError
  }
}
