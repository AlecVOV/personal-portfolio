<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}{{ required ? ' *' : '' }}
    </label>
    <div class="flex gap-2">
      <input
        :value="modelValue"
        type="url"
        :required="required"
        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        :disabled="uploading"
        class="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
        @click="fileInput?.click()"
      >
        {{ uploading ? 'Uploading…' : 'Upload' }}
      </button>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile" />
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <div v-if="modelValue" class="mt-2">
      <img :src="modelValue" alt="Preview" :class="previewClass" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string
  label: string
  required?: boolean
  placeholder?: string
  previewClass?: string
}>(), {
  modelValue: '',
  placeholder: 'https://… or click Upload',
  previewClass: 'w-full h-48 object-cover rounded-md',
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { upload, uploading } = useImageUpload()
const fileInput = ref<HTMLInputElement>()
const error = ref('')

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  error.value = ''
  try {
    emit('update:modelValue', (await upload(file)).url)
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Upload failed'
  }
}
</script>
