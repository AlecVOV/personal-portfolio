/**
 * Simplified Animation Utility System
 * Performance-optimized animation utilities with consistent timing and easing
 */

// Animation configuration constants
export const ANIMATION_CONFIG = {
  // Duration constants (in milliseconds)
  FAST: 200,
  NORMAL: 400,
  SLOW: 500,
  
  // Mobile-optimized durations
  MOBILE_FAST: 150,
  MOBILE_NORMAL: 250,
  MOBILE_SLOW: 300,
  
  // Easing functions
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  
  // Performance limits
  MAX_CONCURRENT_ANIMATIONS: 3,
  MOBILE_MAX_CONCURRENT: 2,
  MOBILE_DURATION_MULTIPLIER: 0.6,
  MOBILE_SCALE_MULTIPLIER: 0.6, // Smaller scale effects on mobile
  
  // Device detection thresholds
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  TOUCH_DEVICE_THRESHOLD: 'coarse', // pointer: coarse indicates touch device
} as const;

// Animation class definitions
export const ANIMATION_CLASSES = {
  // Entrance animations
  FADE_IN: 'fade-in',
  SLIDE_UP: 'slide-up',
  SLIDE_DOWN: 'slide-down',
  SLIDE_LEFT: 'slide-left',
  SLIDE_RIGHT: 'slide-right',
  
  // Mobile-optimized entrance animations
  MOBILE_FADE_IN: 'mobile-fade-in',
  MOBILE_SLIDE_UP: 'mobile-slide-up',
  
  // Hover effects
  HOVER_SCALE: 'hover-scale',
  HOVER_SCALE_SM: 'hover-scale-sm',
  HOVER_SCALE_LG: 'hover-scale-lg',
  
  // Mobile-optimized hover effects
  MOBILE_SCALE_HOVER: 'mobile-scale-hover',
  MOBILE_BTN_HOVER: 'mobile-btn-hover',
  MOBILE_NAV_UNDERLINE: 'mobile-nav-underline',
  
  // Navigation
  NAV_UNDERLINE: 'nav-underline',
  
  // Buttons
  BTN_HOVER: 'btn-hover',
  
  // Loading
  PULSE_SIMPLE: 'pulse-simple',
  SPINNER: 'spinner',
  
  // Page transitions
  PAGE_FADE: 'page-fade',
  PAGE_SLIDE: 'page-slide',
  
  // Performance utilities
  GPU_ACCELERATED: 'gpu-accelerated',
  ANIMATION_COMPLETE: 'animation-complete',
} as const;

// Animation delay classes
export const DELAY_CLASSES = {
  DELAY_100: 'delay-100',
  DELAY_200: 'delay-200',
  DELAY_300: 'delay-300',
  DELAY_400: 'delay-400',
  DELAY_500: 'delay-500',
} as const;

// Animation registry for performance tracking
class AnimationRegistry {
  private activeAnimations = new Set<string>();
  private animationCount = 0;

  /**
   * Get maximum concurrent animations based on device
   */
  private getMaxConcurrent(): number {
    const isMobile = window.innerWidth <= ANIMATION_CONFIG.MOBILE_BREAKPOINT;
    return isMobile ? ANIMATION_CONFIG.MOBILE_MAX_CONCURRENT : ANIMATION_CONFIG.MAX_CONCURRENT_ANIMATIONS;
  }

  /**
   * Register a new animation
   */
  register(elementId: string): boolean {
    const maxConcurrent = this.getMaxConcurrent();
    
    if (this.activeAnimations.size >= maxConcurrent) {
      console.warn(`Maximum concurrent animations reached (${maxConcurrent}). Animation queued.`);
      return false;
    }
    
    this.activeAnimations.add(elementId);
    this.animationCount++;
    return true;
  }

  /**
   * Unregister an animation when complete
   */
  unregister(elementId: string): void {
    this.activeAnimations.delete(elementId);
  }

  /**
   * Get current active animation count
   */
  getActiveCount(): number {
    return this.activeAnimations.size;
  }

  /**
   * Check if we can start a new animation
   */
  canAnimate(): boolean {
    return this.activeAnimations.size < this.getMaxConcurrent();
  }

  /**
   * Clear all registered animations
   */
  clear(): void {
    this.activeAnimations.clear();
  }
}

// Global animation registry instance
export const animationRegistry = new AnimationRegistry();

/**
 * Utility functions for animation management
 */
export const AnimationUtils = {
  /**
   * Apply entrance animation to an element with mobile optimization
   */
  applyEntranceAnimation(
    element: HTMLElement,
    animationType: keyof typeof ANIMATION_CLASSES = 'FADE_IN',
    delay = 0
  ): void {
    const elementId = element.id || `anim-${Date.now()}-${Math.random()}`;
    const complexity = this.getAnimationComplexity();
    
    if (complexity === 'minimal') {
      element.style.opacity = '1';
      element.style.transform = 'none';
      return;
    }
    
    if (!animationRegistry.register(elementId)) {
      // Animation queued, apply without animation
      element.style.opacity = '1';
      element.style.transform = 'none';
      return;
    }

    // Get optimized animation class based on device
    const deviceType = this.getDeviceType();
    let animationClass = '';
    
    // Use mobile-specific classes when available
    if (deviceType === 'mobile') {
      if (animationType === 'FADE_IN') {
        animationClass = ANIMATION_CLASSES.MOBILE_FADE_IN;
      } else if (animationType === 'SLIDE_UP') {
        animationClass = ANIMATION_CLASSES.MOBILE_SLIDE_UP;
      } else {
        animationClass = ANIMATION_CLASSES[animationType];
      }
    } else {
      animationClass = ANIMATION_CLASSES[animationType];
    }
    
    if (!animationClass) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      animationRegistry.unregister(elementId);
      return;
    }

    // Add GPU acceleration for performance
    element.classList.add(ANIMATION_CLASSES.GPU_ACCELERATED);
    
    // Apply optimized delay
    if (delay > 0) {
      const optimizedDelay = this.getOptimizedDuration(delay);
      element.style.animationDelay = `${optimizedDelay}ms`;
    }
    
    // Apply animation class
    element.classList.add(animationClass);
    
    // Clean up after animation completes
    const cleanup = () => {
      element.classList.remove(ANIMATION_CLASSES.GPU_ACCELERATED);
      element.classList.add(ANIMATION_CLASSES.ANIMATION_COMPLETE);
      animationRegistry.unregister(elementId);
      element.removeEventListener('animationend', cleanup);
    };
    
    element.addEventListener('animationend', cleanup, { once: true });
  },

  /**
   * Apply hover animation to an element with device optimization
   */
  applyHoverAnimation(
    element: HTMLElement,
    hoverType: 'HOVER_SCALE' | 'HOVER_SCALE_SM' | 'HOVER_SCALE_LG' = 'HOVER_SCALE'
  ): void {
    const deviceType = this.getDeviceType();
    const complexity = this.getAnimationComplexity();
    
    if (complexity === 'minimal') return;
    
    // Use mobile-optimized classes on mobile devices
    if (deviceType === 'mobile' || this.isTouchDevice()) {
      element.classList.add(ANIMATION_CLASSES.MOBILE_SCALE_HOVER);
      
      // Add touch event listeners for better feedback
      this.addTouchFeedback(element);
    } else {
      element.classList.add(ANIMATION_CLASSES[hoverType]);
    }
  },

  /**
   * Add touch feedback to an element
   */
  addTouchFeedback(element: HTMLElement): void {
    if (!this.isTouchDevice()) return;
    
    const handleTouchStart = () => {
      const scale = this.getOptimizedScale(1.03);
      element.style.transform = `scale(${scale})`;
    };
    
    const handleTouchEnd = () => {
      setTimeout(() => {
        element.style.transform = '';
      }, 150);
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Store cleanup function on element for later removal
    (element as any)._touchCleanup = () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  },

  /**
   * Apply navigation underline effect with mobile optimization
   */
  applyNavUnderline(element: HTMLElement): void {
    const deviceType = this.getDeviceType();
    const complexity = this.getAnimationComplexity();
    
    if (complexity === 'minimal') return;
    
    if (deviceType === 'mobile' || this.isTouchDevice()) {
      element.classList.add(ANIMATION_CLASSES.MOBILE_NAV_UNDERLINE);
    } else {
      element.classList.add(ANIMATION_CLASSES.NAV_UNDERLINE);
    }
  },

  /**
   * Apply button hover effect with mobile optimization
   */
  applyButtonHover(element: HTMLElement): void {
    const deviceType = this.getDeviceType();
    const complexity = this.getAnimationComplexity();
    
    if (complexity === 'minimal') return;
    
    if (deviceType === 'mobile' || this.isTouchDevice()) {
      element.classList.add(ANIMATION_CLASSES.MOBILE_BTN_HOVER);
      this.addTouchFeedback(element);
    } else {
      element.classList.add(ANIMATION_CLASSES.BTN_HOVER);
    }
  },

  /**
   * Check if reduced motion is preferred
   */
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Check if device is mobile
   */
  isMobile(): boolean {
    return window.innerWidth <= ANIMATION_CONFIG.MOBILE_BREAKPOINT;
  },

  /**
   * Check if device is tablet
   */
  isTablet(): boolean {
    return window.innerWidth > ANIMATION_CONFIG.MOBILE_BREAKPOINT && 
           window.innerWidth <= ANIMATION_CONFIG.TABLET_BREAKPOINT;
  },

  /**
   * Check if device has touch capabilities
   */
  isTouchDevice(): boolean {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 ||
           window.matchMedia('(pointer: coarse)').matches;
  },

  /**
   * Get device type for animation optimization
   */
  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    return 'desktop';
  },

  /**
   * Check if device has low performance indicators
   */
  isLowPerformanceDevice(): boolean {
    // Check for indicators of low-performance devices
    const connection = (navigator as any).connection;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    return (
      hardwareConcurrency <= 2 || // Low CPU cores
      (connection && connection.saveData) || // Data saver mode
      (connection && connection.effectiveType && 
       ['slow-2g', '2g', '3g'].includes(connection.effectiveType)) // Slow connection
    );
  },

  /**
   * Get animation complexity level based on device capabilities
   */
  getAnimationComplexity(): 'minimal' | 'reduced' | 'full' {
    if (this.prefersReducedMotion()) return 'minimal';
    if (this.isLowPerformanceDevice()) return 'reduced';
    if (this.isMobile()) return 'reduced';
    return 'full';
  },

  /**
   * Get optimized duration based on device and preferences
   */
  getOptimizedDuration(baseDuration: number): number {
    if (this.prefersReducedMotion()) {
      return 1; // Minimal duration for reduced motion
    }
    
    const deviceType = this.getDeviceType();
    const complexity = this.getAnimationComplexity();
    
    if (complexity === 'minimal') return 1;
    if (complexity === 'reduced') {
      return Math.round(baseDuration * ANIMATION_CONFIG.MOBILE_DURATION_MULTIPLIER);
    }
    
    // Device-specific optimizations
    switch (deviceType) {
      case 'mobile':
        return Math.round(baseDuration * ANIMATION_CONFIG.MOBILE_DURATION_MULTIPLIER);
      case 'tablet':
        return Math.round(baseDuration * 0.85);
      default:
        return baseDuration;
    }
  },

  /**
   * Get optimized scale value for hover effects
   */
  getOptimizedScale(baseScale: number = 1.05): number {
    const deviceType = this.getDeviceType();
    const complexity = this.getAnimationComplexity();
    
    if (complexity === 'minimal') return 1;
    
    if (deviceType === 'mobile' || this.isTouchDevice()) {
      return 1 + ((baseScale - 1) * ANIMATION_CONFIG.MOBILE_SCALE_MULTIPLIER);
    }
    
    return baseScale;
  },

  /**
   * Get appropriate animation class based on device
   */
  getOptimizedAnimationClass(
    baseClass: keyof typeof ANIMATION_CLASSES,
    mobileClass?: keyof typeof ANIMATION_CLASSES
  ): string {
    const deviceType = this.getDeviceType();
    const complexity = this.getAnimationComplexity();
    
    if (complexity === 'minimal') return '';
    
    // Use mobile-specific class if available and on mobile
    if (deviceType === 'mobile' && mobileClass && ANIMATION_CLASSES[mobileClass]) {
      return ANIMATION_CLASSES[mobileClass];
    }
    
    // Fallback to base class
    if (ANIMATION_CLASSES[baseClass]) {
      return ANIMATION_CLASSES[baseClass];
    }
    
    return '';
  },

  /**
   * Create staggered entrance animations with mobile optimization
   */
  applyStaggeredAnimation(
    elements: HTMLElement[],
    animationType: keyof typeof ANIMATION_CLASSES = 'FADE_IN',
    staggerDelay = 100
  ): void {
    const deviceType = this.getDeviceType();
    const complexity = this.getAnimationComplexity();
    
    if (complexity === 'minimal') {
      elements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }
    
    // Limit stagger count on mobile for performance
    const maxStagger = deviceType === 'mobile' ? 6 : elements.length;
    const optimizedDelay = this.getOptimizedDuration(staggerDelay);
    const elementsToAnimate = elements.slice(0, maxStagger);

    elementsToAnimate.forEach((element, index) => {
      const delay = index * optimizedDelay;
      this.applyEntranceAnimation(element, animationType, delay);
    });

    // Show remaining elements immediately if any
    if (elements.length > maxStagger) {
      elements.slice(maxStagger).forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  },

  /**
   * Remove all animation classes from an element
   */
  clearAnimations(element: HTMLElement): void {
    Object.values(ANIMATION_CLASSES).forEach(className => {
      element.classList.remove(className);
    });
    
    Object.values(DELAY_CLASSES).forEach(className => {
      element.classList.remove(className);
    });
    
    element.style.animationDelay = '';
    element.style.transform = '';
    
    // Clean up touch listeners if they exist
    if ((element as any)._touchCleanup) {
      (element as any)._touchCleanup();
      delete (element as any)._touchCleanup;
    }
  },

  /**
   * Get current animation performance stats
   */
  getPerformanceStats() {
    const deviceType = this.getDeviceType();
    const complexity = this.getAnimationComplexity();
    
    return {
      activeAnimations: animationRegistry.getActiveCount(),
      maxConcurrent: deviceType === 'mobile' ? 
        ANIMATION_CONFIG.MOBILE_MAX_CONCURRENT : 
        ANIMATION_CONFIG.MAX_CONCURRENT_ANIMATIONS,
      canAnimate: animationRegistry.canAnimate(),
      prefersReducedMotion: this.prefersReducedMotion(),
      deviceType,
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      isTouchDevice: this.isTouchDevice(),
      isLowPerformance: this.isLowPerformanceDevice(),
      animationComplexity: complexity,
    };
  },
};

/**
 * Vue composable for animation utilities
 */
export function useSimplifiedAnimations() {
  return {
    ANIMATION_CLASSES,
    DELAY_CLASSES,
    ANIMATION_CONFIG,
    AnimationUtils,
    animationRegistry,
  };
}