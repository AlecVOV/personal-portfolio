/**
 * Mobile-Optimized Animation Composable
 * Provides touch-friendly animations with performance optimizations
 */

import { ref, readonly, onMounted, onUnmounted } from 'vue';
import { AnimationUtils, ANIMATION_CLASSES, ANIMATION_CONFIG } from '~/utils/animations';

export function useMobileAnimations() {
  const isMobile = ref(false);
  const isTablet = ref(false);
  const isTouchDevice = ref(false);
  const animationComplexity = ref<'minimal' | 'reduced' | 'full'>('full');

  // Touch interaction state
  const touchStartTime = ref(0);
  const touchEndTime = ref(0);
  const touchDuration = ref(0);

  /**
   * Update device detection values
   */
  const updateDeviceInfo = () => {
    isMobile.value = AnimationUtils.isMobile();
    isTablet.value = AnimationUtils.isTablet();
    isTouchDevice.value = AnimationUtils.isTouchDevice();
    animationComplexity.value = AnimationUtils.getAnimationComplexity();
  };

  /**
   * Handle touch start for interaction timing
   */
  const handleTouchStart = (event: TouchEvent) => {
    touchStartTime.value = Date.now();
    
    // Add touch feedback class for immediate visual response
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('mobile-scale-hover')) {
      target.style.transform = `scale(${AnimationUtils.getOptimizedScale(1.03)})`;
    }
  };

  /**
   * Handle touch end for interaction completion
   */
  const handleTouchEnd = (event: TouchEvent) => {
    touchEndTime.value = Date.now();
    touchDuration.value = touchEndTime.value - touchStartTime.value;
    
    // Remove touch feedback
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('mobile-scale-hover')) {
      target.style.transform = '';
    }
  };

  /**
   * Apply mobile-optimized entrance animation
   */
  const applyMobileEntranceAnimation = (
    element: HTMLElement,
    animationType: 'fade' | 'slide-up' = 'fade',
    delay = 0
  ) => {
    if (animationComplexity.value === 'minimal') {
      element.style.opacity = '1';
      element.style.transform = 'none';
      return;
    }

    const mobileClass = animationType === 'fade' ? 
      ANIMATION_CLASSES.MOBILE_FADE_IN : 
      ANIMATION_CLASSES.MOBILE_SLIDE_UP;

    const optimizedClass = AnimationUtils.getOptimizedAnimationClass(
      animationType === 'fade' ? 'FADE_IN' : 'SLIDE_UP',
      animationType === 'fade' ? 'MOBILE_FADE_IN' : 'MOBILE_SLIDE_UP'
    );

    if (optimizedClass) {
      element.classList.add(optimizedClass);
      
      if (delay > 0) {
        const optimizedDelay = AnimationUtils.getOptimizedDuration(delay);
        element.style.animationDelay = `${optimizedDelay}ms`;
      }
    }
  };

  /**
   * Apply mobile-optimized hover effects
   */
  const applyMobileHoverEffect = (
    element: HTMLElement,
    effectType: 'scale' | 'button' | 'nav' = 'scale'
  ) => {
    if (animationComplexity.value === 'minimal') return;

    const classMap = {
      scale: ANIMATION_CLASSES.MOBILE_SCALE_HOVER,
      button: ANIMATION_CLASSES.MOBILE_BTN_HOVER,
      nav: ANIMATION_CLASSES.MOBILE_NAV_UNDERLINE,
    };

    element.classList.add(classMap[effectType]);

    // Add touch event listeners for better touch feedback
    if (isTouchDevice.value) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  };

  /**
   * Create touch-optimized staggered animations
   */
  const applyMobileStaggeredAnimation = (
    elements: HTMLElement[],
    animationType: 'fade' | 'slide-up' = 'fade',
    baseDelay = 50 // Reduced delay for mobile
  ) => {
    if (animationComplexity.value === 'minimal') {
      elements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Limit stagger count on mobile for performance
    const maxStagger = isMobile.value ? 6 : elements.length;
    const elementsToAnimate = elements.slice(0, maxStagger);

    elementsToAnimate.forEach((element, index) => {
      const delay = index * baseDelay;
      applyMobileEntranceAnimation(element, animationType, delay);
    });

    // Show remaining elements immediately if any
    if (elements.length > maxStagger) {
      elements.slice(maxStagger).forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  };

  /**
   * Optimize animations for current device
   */
  const optimizeForDevice = () => {
    const stats = AnimationUtils.getPerformanceStats();
    
    // Log performance info for debugging
    if (process.dev) {
      console.log('Mobile Animation Stats:', {
        deviceType: stats.deviceType,
        complexity: stats.animationComplexity,
        touchDevice: stats.isTouchDevice,
        activeAnimations: stats.activeAnimations,
        maxConcurrent: stats.maxConcurrent,
      });
    }

    return stats;
  };

  /**
   * Handle resize events to update device detection
   */
  const handleResize = () => {
    updateDeviceInfo();
  };

  /**
   * Clean up touch event listeners
   */
  const cleanupTouchListeners = (element: HTMLElement) => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
  };

  // Lifecycle hooks
  onMounted(() => {
    updateDeviceInfo();
    window.addEventListener('resize', handleResize, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    // Reactive state
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isTouchDevice: readonly(isTouchDevice),
    animationComplexity: readonly(animationComplexity),
    touchDuration: readonly(touchDuration),

    // Methods
    applyMobileEntranceAnimation,
    applyMobileHoverEffect,
    applyMobileStaggeredAnimation,
    optimizeForDevice,
    cleanupTouchListeners,
    updateDeviceInfo,

    // Touch event handlers
    handleTouchStart,
    handleTouchEnd,
  };
}

/**
 * Global mobile animation utilities
 */
export const MobileAnimationUtils = {
  /**
   * Check if element should use mobile animations
   */
  shouldUseMobileAnimations(element?: HTMLElement): boolean {
    return AnimationUtils.isMobile() || AnimationUtils.isTouchDevice();
  },

  /**
   * Apply appropriate animation class based on device
   */
  applyResponsiveAnimation(
    element: HTMLElement,
    desktopClass: string,
    mobileClass: string
  ) {
    const classToUse = this.shouldUseMobileAnimations(element) ? mobileClass : desktopClass;
    element.classList.add(classToUse);
  },

  /**
   * Get touch-optimized timing values
   */
  getTouchOptimizedTiming() {
    const isMobile = AnimationUtils.isMobile();
    
    return {
      duration: isMobile ? ANIMATION_CONFIG.MOBILE_NORMAL : ANIMATION_CONFIG.NORMAL,
      delay: isMobile ? 50 : 100,
      stagger: isMobile ? 50 : 100,
    };
  },

  /**
   * Create touch-friendly button animation
   */
  createTouchButton(element: HTMLElement) {
    if (!element) return;

    const isTouchDevice = AnimationUtils.isTouchDevice();
    
    if (isTouchDevice) {
      element.classList.add(ANIMATION_CLASSES.MOBILE_BTN_HOVER);
      
      // Add touch feedback
      element.addEventListener('touchstart', (e) => {
        element.style.transform = `scale(${AnimationUtils.getOptimizedScale(1.03)})`;
      }, { passive: true });
      
      element.addEventListener('touchend', (e) => {
        setTimeout(() => {
          element.style.transform = '';
        }, 150);
      }, { passive: true });
    } else {
      element.classList.add(ANIMATION_CLASSES.BTN_HOVER);
    }
  },
};