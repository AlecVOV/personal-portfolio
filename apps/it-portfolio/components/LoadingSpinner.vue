<template>
  <div class="flex items-center justify-center py-12">
    <div class="text-center">
      <!-- Spinner -->
      <div class="inline-block w-8 h-8 border-4 border-orange-yellow border-t-transparent rounded-full animate-spin mb-4"></div>
      
      <!-- Loading text -->
      <p v-if="message" class="text-gray-400 text-lg">{{ message }}</p>
      
      <!-- Loading skeleton for specific content types -->
      <div v-if="type === 'content'" class="space-y-4 mt-8 max-w-2xl">
        <div class="animate-pulse">
          <div class="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
      
      <div v-if="type === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div v-for="i in 6" :key="i" class="animate-pulse">
          <div class="h-48 bg-gray-700 rounded-lg mb-4"></div>
          <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
  type?: 'spinner' | 'content' | 'grid'
}

withDefaults(defineProps<Props>(), {
  message: 'Loading...',
  type: 'spinner'
})
</script>
