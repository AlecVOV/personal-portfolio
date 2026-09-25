<template>
  <div class="mobile-animation-test p-8 space-y-8">
    <div class="bg-white dark:bg-primary-800 rounded-lg p-6 shadow-lg">
      <h2 class="text-2xl font-bold mb-4">Mobile Animation Test</h2>
      
      <!-- Device Info -->
      <div class="mb-6 p-4 bg-gray-100 dark:bg-primary-700 rounded">
        <h3 class="font-semibold mb-2">Device Information</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>Mobile: {{ isMobile ? 'Yes' : 'No' }}</div>
          <div>Tablet: {{ isTablet ? 'Yes' : 'No' }}</div>
          <div>Touch Device: {{ isTouchDevice ? 'Yes' : 'No' }}</div>
          <div>Complexity: {{ animationComplexity }}</div>
        </div>
      </div>

      <!-- Animation Test Buttons -->
      <div class="space-y-4">
        <h3 class="font-semibold">Touch-Optimized Buttons</h3>
        <div class="flex flex-wrap gap-4">
          <button
            ref="mobileButton"
            class="px-4 py-2 bg-blue-500 text-white rounded"
            @click="testMobileButton"
          >
            Mobile Button
          </button>
          
          <button
            ref="desktopButton"
            class="px-4 py-2 bg-green-500 text-white rounded"
            @click="testDesktopButton"
          >
            Desktop Button
          </button>
          
          <button
            ref="navButton"
            class="px-4 py-2 border border-gray-400 rounded"
            @click="testNavButton"
          >
            Nav Button
          </button>
        </div>
      </div>

      <!-- Animation Test Elements -->
      <div class="space-y-4 mt-6">
        <h3 class="font-semibold">Entrance Animations</h3>
        <div class="flex flex-wrap gap-4">
          <div
            ref="fadeElement"
            class="w-20 h-20 bg-red-400 rounded opacity-0"
          >
            Fade
          </div>
          
          <div
            ref="slideElement"
            class="w-20 h-20 bg-blue-400 rounded opacity-0"
          >
            Slide
          </div>
        </div>
        
        <button
          class="px-4 py-2 bg-purple-500 text-white rounded"
          @click="testEntranceAnimations"
        >
          Test Entrance Animations
        </button>
      </div>

      <!-- Staggered Animation Test -->
      <div class="space-y-4 mt-6">
        <h3 class="font-semibold">Staggered Animations</h3>
        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="i in 8"
            :key="i"
            :ref="el => staggerElements[i-1] = el"
            class="h-16 bg-yellow-400 rounded opacity-0 flex items-center justify-center text-sm"
          >
            {{ i }}
          </div>
        </div>
        
        <button
          class="px-4 py-2 bg-orange-500 text-white rounded"
          @click="testStaggeredAnimations"
        >
          Test Staggered Animations
        </button>
      </div>

      <!-- Performance Stats -->
      <div class="mt-6 p-4 bg-gray-100 dark:bg-primary-700 rounded">
        <h3 class="font-semibold mb-2">Performance Stats</h3>
        <div class="text-sm space-y-1">
          <div>Active Animations: {{ performanceStats.activeAnimations }}</div>
          <div>Max Concurrent: {{ performanceStats.maxConcurrent }}</div>
          <div>Can Animate: {{ performanceStats.canAnimate ? 'Yes' : 'No' }}</div>
          <div>Touch Duration: {{ touchDuration }}ms</div>
        </div>
        
        <button
          class="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-sm"
          @click="updateStats"
        >
          Refresh Stats
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useMobileAnimations } from '~/composables/useMobileAnimations';
import { AnimationUtils } from '~/utils/animations';

// Mobile animations composable
const {
  isMobile,
  isTablet,
  isTouchDevice,
  animationComplexity,
  touchDuration,
  applyMobileEntranceAnimation,
  applyMobileHoverEffect,
  applyMobileStaggeredAnimation,
  optimizeForDevice,
} = useMobileAnimations();

// Template refs
const mobileButton = ref<HTMLElement>();
const desktopButton = ref<HTMLElement>();
const navButton = ref<HTMLElement>();
const fadeElement = ref<HTMLElement>();
const slideElement = ref<HTMLElement>();
const staggerElements = ref<HTMLElement[]>([]);

// Performance stats
const performanceStats = ref(AnimationUtils.getPerformanceStats());

// Test methods
const testMobileButton = () => {
  console.log('Mobile button clicked');
};

const testDesktopButton = () => {
  console.log('Desktop button clicked');
};

const testNavButton = () => {
  console.log('Nav button clicked');
};

const testEntranceAnimations = async () => {
  // Reset elements
  if (fadeElement.value) {
    fadeElement.value.style.opacity = '0';
    fadeElement.value.style.transform = '';
    fadeElement.value.className = fadeElement.value.className.replace(/mobile-fade-in|fade-in/g, '');
  }
  
  if (slideElement.value) {
    slideElement.value.style.opacity = '0';
    slideElement.value.style.transform = '';
    slideElement.value.className = slideElement.value.className.replace(/mobile-slide-up|slide-up/g, '');
  }

  await nextTick();

  // Apply animations
  if (fadeElement.value) {
    applyMobileEntranceAnimation(fadeElement.value, 'fade');
  }
  
  if (slideElement.value) {
    applyMobileEntranceAnimation(slideElement.value, 'slide-up', 200);
  }
  
  updateStats();
};

const testStaggeredAnimations = async () => {
  // Reset elements
  staggerElements.value.forEach(el => {
    if (el) {
      el.style.opacity = '0';
      el.style.transform = '';
      el.className = el.className.replace(/mobile-fade-in|fade-in|mobile-slide-up|slide-up/g, '');
    }
  });

  await nextTick();

  // Apply staggered animation
  applyMobileStaggeredAnimation(staggerElements.value, 'slide-up');
  updateStats();
};

const updateStats = () => {
  performanceStats.value = optimizeForDevice();
};

// Setup animations on mount
onMounted(async () => {
  await nextTick();
  
  // Apply hover effects to buttons
  if (mobileButton.value) {
    applyMobileHoverEffect(mobileButton.value, 'button');
  }
  
  if (desktopButton.value) {
    AnimationUtils.applyButtonHover(desktopButton.value);
  }
  
  if (navButton.value) {
    applyMobileHoverEffect(navButton.value, 'nav');
  }
  
  updateStats();
});
</script>

<style scoped>
.mobile-animation-test {
  min-height: 100vh;
}

/* Ensure test elements are visible */
.mobile-animation-test div[class*="bg-"] {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}
</style>