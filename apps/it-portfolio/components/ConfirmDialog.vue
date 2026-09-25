<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
      @click.self="$emit('cancel')">
      <div class="bg-gradient-jet rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-600">
        <h3 class="text-lg font-semibold text-white mb-2">{{ title }}</h3>
        <p class="text-gray-300 text-sm mb-6">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button @click="$emit('cancel')"
            class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm">
            Cancel
          </button>
          <button @click="$emit('confirm')"
            class="px-4 py-2 rounded-lg transition-colors text-sm text-white"
            :class="variant === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-yellow hover:bg-orange-600'">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  variant?: 'primary' | 'danger'
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
