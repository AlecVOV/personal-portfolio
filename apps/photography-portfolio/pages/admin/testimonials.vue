<template>
  <div>
    <div class="px-4 sm:px-0 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-serif font-bold text-gray-900 dark:text-white">Testimonials</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage client testimonials and reviews
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="btn-primary"
      >
        New Testimonial
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="mt-6 border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            activeTab === tab.value
              ? 'border-accent-500 text-accent-600 dark:text-accent-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Testimonials List -->
    <div class="mt-6 space-y-4">
      <div
        v-for="testimonial in filteredTestimonials"
        :key="testimonial.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-4 flex-1">
            <!-- Avatar -->
            <img
              :src="testimonial.avatar || 'https://via.placeholder.com/64'"
              :alt="testimonial.name"
              class="w-16 h-16 rounded-full object-cover"
            />
            
            <!-- Content -->
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ testimonial.name }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ testimonial.role }}</p>
                </div>
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    testimonial.status === 'published' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  ]"
                >
                  {{ testimonial.status }}
                </span>
              </div>
              
              <!-- Rating -->
              <div class="flex items-center mt-2">
                <svg
                  v-for="star in 5"
                  :key="star"
                  class="w-5 h-5"
                  :class="star <= (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              
              <!-- Quote -->
              <p class="mt-3 text-gray-700 dark:text-gray-300 italic">
                "{{ testimonial.quote }}"
              </p>
              
              <!-- Actions -->
              <div class="mt-4 flex items-center space-x-4">
                <button
                  @click="editTestimonial(testimonial)"
                  class="text-sm text-accent-600 hover:text-accent-700 dark:text-accent-400 font-medium"
                >
                  Edit
                </button>
                <button
                  @click="toggleStatus(testimonial.id, testimonial.status === 'published' ? 'hidden' : 'published')"
                  class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                >
                  {{ testimonial.status === 'published' ? 'Hide' : 'Publish' }}
                </button>
                <button
                  @click="deleteTestimonial(testimonial.id)"
                  class="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredTestimonials.length === 0"
      class="mt-12 text-center"
    >
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No testimonials</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new testimonial.</p>
    </div>

    <!-- Editor Modal -->
    <AdminTestimonialEditor
      v-if="showEditor"
      :testimonial="selectedTestimonial"
      @close="closeEditor"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const showEditor = ref(false)
const selectedTestimonial = ref(null)
const activeTab = ref('all')
const testimonials = ref([])

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Hidden', value: 'hidden' }
]

const filteredTestimonials = computed(() => {
  if (activeTab.value === 'all') return testimonials.value
  return testimonials.value.filter(t => t.status === activeTab.value)
})

const fetchTestimonials = async () => {
  const data = await $fetch('/api/testimonials')
  testimonials.value = data
}

const openCreateModal = () => {
  selectedTestimonial.value = null
  showEditor.value = true
}

const editTestimonial = (testimonial) => {
  selectedTestimonial.value = testimonial
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
  selectedTestimonial.value = null
}

const handleSave = async () => {
  await fetchTestimonials()
  closeEditor()
}

const toggleStatus = async (id, status) => {
  await $fetch(`/api/testimonials/${id}`, {
    method: 'PUT',
    body: { status }
  })
  await fetchTestimonials()
}

const deleteTestimonial = async (id) => {
  if (confirm('Are you sure you want to delete this testimonial?')) {
    await $fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
    await fetchTestimonials()
  }
}

onMounted(() => {
  fetchTestimonials()
})
</script>