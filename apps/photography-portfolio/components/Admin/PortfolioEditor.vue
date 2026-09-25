<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 class="text-xl font-serif font-bold text-gray-900 dark:text-white">
          {{ isEdit ? 'Edit Portfolio Item' : 'Add Portfolio Item' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto">
        <div class="px-6 py-4 space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter item title"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              v-model="form.category_id"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Image URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image URL *
            </label>
            <input
              v-model="form.image"
              type="url"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/image.jpg"
            />
            <!-- Image Preview -->
            <div v-if="form.image" class="mt-2">
              <img :src="form.image" alt="Preview" class="w-full h-48 object-cover rounded-md" />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
              placeholder="Brief description of the photo"
            ></textarea>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 bg-accent-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? 'Saving...' : (isEdit ? 'Update Item' : 'Create Item') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.item)
const saving = ref(false)

const form = reactive({
  title: '',
  category_id: '',
  image: '',
  description: '',
  status: 'published'
})

// Load item data if editing
watch(() => props.item, (newItem) => {
  if (newItem) {
    form.title = newItem.title || ''
    form.category_id = newItem.category_id || ''
    form.image = newItem.image || ''
    form.description = newItem.description || ''
    form.status = newItem.status || 'published'
  }
}, { immediate: true })

const handleSubmit = async () => {
  saving.value = true

  try {
    if (isEdit.value) {
      await $fetch(`/api/portfolio/${props.item.id}`, {
        method: 'PUT',
        body: form
      })
    } else {
      await $fetch('/api/portfolio', {
        method: 'POST',
        body: form
      })
    }

    emit('save')
  } catch (error) {
    console.error('Error saving portfolio item:', error)
    alert('Error saving portfolio item. Please try again.')
  } finally {
    saving.value = false
  }
}
</script>