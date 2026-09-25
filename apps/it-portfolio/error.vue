<template>
  <div class="min-h-screen bg-aws-squid-ink flex items-center justify-center p-6">
    <div class="text-center max-w-lg">
      <!-- User image -->
      <img
        src="/Full_IMG_My_Nub_FCJ.png"
        alt="404 Not Found"
        class="w-48 h-48 object-cover rounded-full mx-auto mb-8 border-4 border-aws-orange shadow-lg shadow-aws-orange/20"
      />

      <!-- Error code -->
      <h1 class="text-7xl font-bold text-aws-orange mb-4">
        {{ error?.statusCode || 404 }}
      </h1>

      <!-- Message -->
      <p class="text-xl text-gray-300 mb-2">
        {{ error?.statusCode === 404 ? 'Page Not Found' : 'Something went wrong' }}
      </p>
      <p class="text-gray-400 mb-8">
        {{ error?.statusCode === 404
          ? 'The page you\'re looking for doesn\'t exist or has been moved.'
          : 'An unexpected error occurred. Please try again later.'
        }}
      </p>

      <!-- Actions -->
      <div class="flex gap-4 justify-center">
        <button
          @click="handleError"
          class="px-6 py-3 bg-aws-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Go Home
        </button>
        <button
          v-if="error?.statusCode !== 404"
          @click="handleRetry"
          class="px-6 py-3 bg-aws-lighter-slate text-white rounded-lg hover:bg-opacity-80 transition-colors border border-gray-600"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })
const handleRetry = () => clearError()
</script>
