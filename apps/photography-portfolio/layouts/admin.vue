<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-serif font-bold text-gray-900 dark:text-white">
                LensCraft Admin
              </h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink
                to="/admin"
                class="border-transparent hover:border-accent-500 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                activeClass="!border-accent-500 !text-gray-900 dark:!text-white"
              >
                Dashboard
              </NuxtLink>
              <NuxtLink
                to="/admin/blog"
                class="border-transparent hover:border-accent-500 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                activeClass="!border-accent-500 !text-gray-900 dark:!text-white"
              >
                Blog Posts
              </NuxtLink>
              <NuxtLink
                to="/admin/portfolio"
                class="border-transparent hover:border-accent-500 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                activeClass="!border-accent-500 !text-gray-900 dark:!text-white"
              >
                Portfolio
              </NuxtLink>
              <NuxtLink
                to="/admin/testimonials"
                class="border-transparent hover:border-accent-500 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                activeClass="!border-accent-500 !text-gray-900 dark:!text-white"
              >
                Testimonials
              </NuxtLink>
              <NuxtLink
                to="/admin/media"
                class="border-transparent hover:border-accent-500 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                activeClass="!border-accent-500 !text-gray-900 dark:!text-white"
              >
                Media
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Dark Mode Toggle Button -->
            <button 
              @click="toggleDarkMode" 
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
              :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
              <Transition name="fade" mode="out-in">
                <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </Transition>
            </button>

            <NuxtLink
              to="/"
              target="_blank"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            >
              View Site
            </NuxtLink>
            <button
              @click="handleSignOut"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'

const { signOut } = useAuth()

// Dark mode functionality
const colorMode = useColorMode()
const isDarkMode = computed(() => colorMode.value === 'dark')

const toggleDarkMode = () => {
  colorMode.value = isDarkMode.value ? 'light' : 'dark'
}

const handleSignOut = async () => {
  await signOut()
}
</script>

<style scoped>
/* Fade transition for icon swap */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>