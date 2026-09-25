<template>
  <div class="min-h-screen bg-gray-50 dark:bg-primary-900">
    <div class="container-custom py-8">
      <h1 class="text-3xl font-bold mb-8 text-center">Mobile Animation Testing</h1>
      
      <div class="max-w-4xl mx-auto">
        <MobileAnimationTest />
        
        <!-- Additional Mobile-Specific Tests -->
        <div class="mt-12 bg-white dark:bg-primary-800 rounded-lg p-6 shadow-lg">
          <h2 class="text-2xl font-bold mb-6">Real-World Component Tests</h2>
          
          <!-- Navigation Test -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold mb-4">Navigation Links</h3>
            <nav class="flex flex-wrap gap-4">
              <a
                v-for="link in navLinks"
                :key="link.name"
                href="#"
                class="nav-link px-4 py-2 text-primary-700 dark:text-primary-300"
                @click.prevent
              >
                {{ link.name }}
              </a>
            </nav>
          </div>
          
          <!-- Button Grid Test -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold mb-4">Button Variations</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button class="btn btn-primary">Primary</button>
              <button class="btn btn-outline">Outline</button>
              <button class="btn btn-primary">Action</button>
              <button class="btn btn-outline">Secondary</button>
            </div>
          </div>
          
          <!-- Card Grid Test -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold mb-4">Card Hover Effects</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                v-for="card in testCards"
                :key="card.id"
                class="card bg-white dark:bg-primary-700 p-6 rounded-lg hover-scale cursor-pointer"
              >
                <h4 class="font-semibold mb-2">{{ card.title }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ card.description }}</p>
              </div>
            </div>
          </div>
          
          <!-- Touch Interaction Test -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold mb-4">Touch Interaction Test</h3>
            <div class="space-y-4">
              <div
                ref="touchTestElement"
                class="w-full h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer"
                @touchstart="handleTouchStart"
                @touchend="handleTouchEnd"
                @click="handleClick"
              >
                {{ touchMessage }}
              </div>
              
              <div class="text-sm text-gray-600 dark:text-gray-400">
                <p>Touch Duration: {{ lastTouchDuration }}ms</p>
                <p>Interaction Count: {{ interactionCount }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useMobileAnimations } from '~/composables/useMobileAnimations';
import { AnimationUtils } from '~/utils/animations';

// Page metadata
definePageMeta({
  title: 'Mobile Animation Testing',
  description: 'Test page for mobile-optimized animations and touch interactions'
});

// Mobile animations composable
const { isMobile, isTouchDevice, applyMobileHoverEffect } = useMobileAnimations();

// Test data
const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

const testCards = [
  {
    id: 1,
    title: 'Wedding Photography',
    description: 'Capturing your special moments with artistic flair and professional quality.'
  },
  {
    id: 2,
    title: 'Portrait Sessions',
    description: 'Professional portraits that showcase your personality and style.'
  },
  {
    id: 3,
    title: 'Event Coverage',
    description: 'Comprehensive event photography for all your important occasions.'
  },
];

// Touch interaction state
const touchTestElement = ref<HTMLElement>();
const touchMessage = ref('Touch or Click Me!');
const lastTouchDuration = ref(0);
const interactionCount = ref(0);
const touchStartTime = ref(0);

// Touch interaction handlers
const handleTouchStart = (event: TouchEvent) => {
  touchStartTime.value = Date.now();
  touchMessage.value = 'Touching...';
  
  if (touchTestElement.value) {
    const scale = AnimationUtils.getOptimizedScale(1.05);
    touchTestElement.value.style.transform = `scale(${scale})`;
  }
};

const handleTouchEnd = (event: TouchEvent) => {
  const touchEndTime = Date.now();
  lastTouchDuration.value = touchEndTime - touchStartTime.value;
  interactionCount.value++;
  touchMessage.value = `Touch Complete! (${lastTouchDuration.value}ms)`;
  
  if (touchTestElement.value) {
    setTimeout(() => {
      if (touchTestElement.value) {
        touchTestElement.value.style.transform = '';
      }
      touchMessage.value = 'Touch or Click Me!';
    }, 1000);
  }
};

const handleClick = (event: MouseEvent) => {
  if (!isTouchDevice.value) {
    interactionCount.value++;
    touchMessage.value = 'Clicked!';
    
    setTimeout(() => {
      touchMessage.value = 'Touch or Click Me!';
    }, 1000);
  }
};

// Setup animations on mount
onMounted(async () => {
  await nextTick();
  
  // Apply mobile-optimized hover effects to navigation links
  const navElements = document.querySelectorAll('.nav-link');
  navElements.forEach(el => {
    AnimationUtils.applyNavUnderline(el as HTMLElement);
  });
  
  // Apply hover effects to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(el => {
    AnimationUtils.applyButtonHover(el as HTMLElement);
  });
  
  // Apply hover effects to cards
  const cards = document.querySelectorAll('.hover-scale');
  cards.forEach(el => {
    AnimationUtils.applyHoverAnimation(el as HTMLElement);
  });
  
  // Apply mobile hover effect to touch test element
  if (touchTestElement.value) {
    applyMobileHoverEffect(touchTestElement.value, 'scale');
  }
});
</script>

<style scoped>
/* Additional styles for testing */
.nav-link {
  transition: all 200ms ease-out;
}

.card {
  transition: all 200ms ease-out;
}

/* Ensure touch test element is properly styled */
.touch-test-element {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
</style>