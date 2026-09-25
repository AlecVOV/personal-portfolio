<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 class="text-xl font-serif font-bold text-gray-900 dark:text-white">
          {{ isEdit ? 'Edit Testimonial' : 'Add Testimonial' }}
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
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client Name *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter client name"
            />
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role/Title *
            </label>
            <input
              v-model="form.role"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Wedding Client, Business Owner"
            />
          </div>

          <!-- Avatar URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Avatar URL
            </label>
            <input
              v-model="form.avatar"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/avatar.jpg"
            />
            <!-- Avatar Preview -->
            <div v-if="form.avatar" class="mt-2">
              <img :src="form.avatar" alt="Avatar preview" class="w-16 h-16 rounded-full object-cover" />
            </div>
          </div>

          <!-- Rating -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating *
            </label>
            <div class="flex items-center space-x-2">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="form.rating = star"
                class="focus:outline-none"
              >
                <svg
                  class="w-8 h-8 transition-colors"
                  :class="star <= form.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
              <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {{ form.rating }} / 5
              </span>
            </div>
          </div>

          <!-- Quote -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Testimonial Quote *
            </label>
            <textarea
              v-model="form.quote"
              rows="5"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter the testimonial text..."
            ></textarea>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ form.quote.length }} characters
            </p>
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
            {{ saving ? 'Saving...' : (isEdit ? 'Update Testimonial' : 'Create Testimonial') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  testimonial: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.testimonial)
const saving = ref(false)

const form = reactive({
  name: '',
  role: '',
  avatar: '',
  rating: 5,
  quote: '',
  status: 'published'
})

// Load testimonial data if editing
watch(() => props.testimonial, (newTestimonial) => {
  if (newTestimonial) {
    form.name = newTestimonial.name || ''
    form.role = newTestimonial.role || ''
    form.avatar = newTestimonial.avatar || ''
    form.rating = newTestimonial.rating || 5
    form.quote = newTestimonial.quote || ''
    form.status = newTestimonial.status || 'published'
  }
}, { immediate: true })

const handleSubmit = async () => {
  saving.value = true

  try {
    if (isEdit.value) {
      await $fetch(`/api/testimonials/${props.testimonial.id}`, {
        method: 'PUT',
        body: form
      })
    } else {
      await $fetch('/api/testimonials', {
        method: 'POST',
        body: form
      })
    }

    emit('save')
  } catch (error) {
    console.error('Error saving testimonial:', error)
    alert('Error saving testimonial. Please try again.')
  } finally {
    saving.value = false
  }
}
</script>