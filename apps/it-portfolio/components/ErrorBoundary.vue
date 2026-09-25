<template>
  <div v-if="error" class="error-boundary mb-8">
    <div class="p-4 bg-red-900/20 border border-red-600 rounded-lg">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold mb-2 text-red-400">
            {{ error.code ? `${error.code}: ` : '' }}Something went wrong
          </h3>
          <p class="mb-4 text-red-300">{{ error.message }}</p>
          <div v-if="error.details" class="mb-4">
            <details class="text-sm text-red-400">
              <summary class="cursor-pointer hover:text-red-300">View details</summary>
              <pre class="mt-2 p-2 bg-red-950/50 rounded text-xs overflow-auto">{{ JSON.stringify(error.details, null, 2) }}</pre>
            </details>
          </div>
          <div class="flex gap-2">
            <button 
              @click="$emit('clear')" 
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Dismiss
            </button>
            <button 
              v-if="showRetry"
              @click="$emit('retry')" 
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AppError } from '~/types/portfolio'

interface Props {
  error: AppError | null
  showRetry?: boolean
}

defineProps<Props>()
defineEmits<{
  clear: []
  retry: []
}>()
</script>
