<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 class="text-xl font-serif font-bold text-gray-900 dark:text-white">
          {{ isEdit ? 'Edit Post' : 'Create New Post' }}
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
              placeholder="Enter post title"
            />
          </div>

          <!-- Slug (auto-generated) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slug (URL)
            </label>
            <input
              v-model="form.slug"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
              :placeholder="form.slug || 'auto-generated-from-title'"
            />
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Leave empty to auto-generate from title</p>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              v-model="form.category_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
            >
              <option :value="null">Select a category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Featured Image URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Image URL
            </label>
            <input
              v-model="form.featured_image"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <!-- Excerpt -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              v-model="form.excerpt"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
              placeholder="Short description of the post"
            ></textarea>
          </div>

          <!-- Markdown Content -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content (Markdown) *
            </label>
            <ClientOnly>
              <div v-if="editorReady" class="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <div ref="editorContainer"></div>
              </div>
              <div v-else class="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <div class="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                  <p class="text-gray-500 dark:text-gray-400">Loading editor...</p>
                </div>
              </div>
              <template #fallback>
                <div class="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                  <div class="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                    <p class="text-gray-500 dark:text-gray-400">Loading editor...</p>
                  </div>
                </div>
              </template>
            </ClientOnly>
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
            {{ saving ? 'Saving...' : (isEdit ? 'Update Post' : 'Create Post') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  post: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.post)
const saving = ref(false)
const editorContainer = ref(null)
const editorReady = ref(false)
let editorInstance = null

const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image: '',
  category_id: null,
  status: 'published'
})

// Initialize editor on client side only
onMounted(async () => {
  if (process.client) {
    try {
      // Wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Dynamically import the editor
      const { default: Editor } = await import('@toast-ui/editor')
      
      editorReady.value = true
      
      // Wait for next tick after setting editorReady
      await new Promise(resolve => setTimeout(resolve, 50))
      
      if (editorContainer.value) {
        editorInstance = new Editor({
          el: editorContainer.value,
          height: '400px',
          initialEditType: 'markdown',
          previewStyle: 'vertical',
          initialValue: form.content || '# Write your content here\n\nStart typing in markdown...',
          usageStatistics: false,
          toolbarItems: [
            ['heading', 'bold', 'italic', 'strike'],
            ['hr', 'quote'],
            ['ul', 'ol', 'task', 'indent', 'outdent'],
            ['table', 'link', 'image'],
            ['code', 'codeblock']
          ]
        })

        // Update form when editor content changes
        editorInstance.on('change', () => {
          form.content = editorInstance.getMarkdown()
        })
        
        console.log('Editor initialized successfully')
      }
    } catch (error) {
      console.error('Error initializing editor:', error)
      alert('Failed to load editor. Please refresh the page.')
    }
  }
})

// Cleanup editor on unmount
onBeforeUnmount(() => {
  if (editorInstance) {
    try {
      editorInstance.destroy()
    } catch (error) {
      console.error('Error destroying editor:', error)
    }
  }
})

// Load post data if editing
watch(() => props.post, (newPost) => {
  if (newPost) {
    form.title = newPost.title || ''
    form.slug = newPost.slug || ''
    form.excerpt = newPost.excerpt || ''
    form.content = newPost.content || ''
    form.featured_image = newPost.featured_image || ''
    form.category_id = newPost.category_id || null
    form.status = newPost.status || 'published'
    
    // Update editor content if editor is initialized
    if (editorInstance) {
      editorInstance.setMarkdown(form.content || '')
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  saving.value = true

  try {
    // Get latest content from editor
    if (editorInstance) {
      form.content = editorInstance.getMarkdown()
    }

    if (isEdit.value) {
      // Update existing post
      await $fetch(`/api/blog/${props.post.id}`, {
        method: 'PUT',
        body: form
      })
    } else {
      // Create new post
      await $fetch('/api/blog', {
        method: 'POST',
        body: form
      })
    }

    emit('save')
  } catch (error) {
    console.error('Error saving post:', error)
    alert('Error saving post. Please try again.')
  } finally {
    saving.value = false
  }
}
</script>