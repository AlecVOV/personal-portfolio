<template>
  <header 
    ref="header" 
    class="fixed w-full z-50 transition-all duration-300 fade-in"
    :class="{ 'bg-white/90 dark:bg-primary-900/90 backdrop-blur-md shadow-md': isScrolled }"
  >
    <div class="container-custom py-4 md:py-6">
      <div class="flex items-center justify-between">
        <NuxtLink 
          to="/" 
          class="text-2xl font-serif tracking-wider transition-colors duration-300"
        >
          LENS<span class="text-accent-600">CRAFT</span>
        </NuxtLink>
        
        <div class="hidden md:flex items-center space-x-8">
          <nav class="flex items-center space-x-6">
            <NuxtLink 
              v-for="(item, index) in menuItems" 
              :key="index" 
              :to="item.path"
              class="nav-underline hover:text-accent-600 transition-colors duration-300 text-sm tracking-wide uppercase"
              active-class="text-accent-600"
            >
              {{ item.name }}
            </NuxtLink>
          </nav>
          <button 
            @click="toggleDarkMode" 
            class="p-3 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-full transition-all duration-200 ease-out cursor-pointer hover:scale-105"
          >
            <span v-if="isDarkMode" class="sr-only">Light mode</span>
            <span v-else class="sr-only">Dark mode</span>
            <Transition name="fade" mode="out-in">
              <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transform transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transform transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </Transition>
          </button>
        </div>
        
        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen" 
          class="md:hidden p-2 transition-all duration-200 ease-out hover:scale-105"
        >
          <span class="sr-only">Toggle menu</span>
          <Transition name="fade" mode="out-in">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transform transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Transition>
        </button>
      </div>
    </div>
    
    <!-- Mobile menu with enhanced animations -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform -translate-y-2"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform -translate-y-2"
    >
      <div 
        v-show="isMobileMenuOpen" 
        class="md:hidden absolute top-full left-0 w-full bg-white dark:bg-primary-900 shadow-md"
      >
        <nav class="container-custom py-6">
          <div class="space-y-4">
            <NuxtLink 
              v-for="(item, index) in menuItems" 
              :key="index" 
              :to="item.path"
              class="block hover:text-accent-600 transition-colors duration-300 text-lg py-2"
              active-class="text-accent-600"
              @click="isMobileMenuOpen = false"
            >
              {{ item.name }}
            </NuxtLink>
            <button 
              @click="toggleDarkMode" 
              class="flex items-center space-x-3 w-full py-2 hover:text-accent-600 transition-all duration-200 ease-out hover:scale-105"
            >
              <span>{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
              <Transition name="fade" mode="out-in">
                <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </Transition>
            </button>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useColorMode } from '@vueuse/core';

const header = ref(null);
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

// Replace the useDark with more direct color mode control
const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value === 'dark');

function toggleDarkMode() {
  colorMode.value = isDarkMode.value ? 'light' : 'dark';
}

const menuItems = [
  { name: 'Home', path: '/' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'About', path: '/about' },
  { name: 'Blog', path: '/blog' },
  { name: 'FAQ', path: '/faq' }
];

const checkScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// Add scroll event listener
onMounted(() => {
  window.addEventListener('scroll', checkScroll);
  checkScroll();
});

// Clean up event listener on unmount
onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll);
});
</script>