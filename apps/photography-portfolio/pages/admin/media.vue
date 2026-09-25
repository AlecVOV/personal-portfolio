<template>
  <div>
    <div class="px-4 sm:px-0 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-serif font-bold text-gray-900 dark:text-white">Media Library</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Images are resized in your browser (max 2560px) and stored on AWS S3
        </p>
      </div>
      <button
        :disabled="uploading"
        class="btn-primary disabled:opacity-50"
        @click="fileInput?.click()"
      >
        {{ uploading ? `Uploading ${progress}…` : 'Upload Images' }}
      </button>
      <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFiles" />
    </div>

    <!-- Filter and Search -->
    <div class="mt-6 flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search images..."
        class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent-500 focus:border-accent-500 dark:bg-gray-700 dark:text-white"
      />
      <button
        @click="fetchImages"
        class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        Refresh
      </button>
    </div>

    <p v-if="uploadError" class="mt-4 text-sm text-red-600">{{ uploadError }}</p>

    <!-- Loading State -->
    <div v-if="loading" class="mt-8 text-center">
      <p class="text-gray-500 dark:text-gray-400">Loading images...</p>
    </div>

    <!-- Images Grid -->
    <div v-else class="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="image in filteredImages"
        :key="image.key"
        class="relative group bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
      >
        <!-- Image -->
        <div class="aspect-square relative overflow-hidden">
          <img
            :src="image.thumbUrl"
            :alt="image.name"
            loading="lazy"
            class="w-full h-full object-cover"
          />

          <!-- Overlay on Hover -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
              <button
                @click="copyImageUrl(image.url)"
                class="p-2 bg-white rounded-full hover:bg-gray-100"
                title="Copy URL"
              >
                <svg class="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                @click="selectedImage = image"
                class="p-2 bg-white rounded-full hover:bg-gray-100"
                title="View Details"
              >
                <svg class="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                @click="deleteImage(image)"
                class="p-2 bg-red-500 rounded-full hover:bg-red-600"
                title="Delete"
              >
                <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Image Info -->
        <div class="p-3">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ image.name }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ formatFileSize(image.bytes) }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && images.length === 0" class="mt-8 text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="mt-2 text-gray-500 dark:text-gray-400">No images found</p>
    </div>

    <!-- Image Detail Modal -->
    <div
      v-if="selectedImage"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
      @click="selectedImage = null"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto" @click.stop>
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Image Details</h3>
            <button
              @click="selectedImage = null"
              class="text-gray-400 hover:text-gray-500"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <img
            :src="selectedImage.url"
            :alt="selectedImage.name"
            class="w-full rounded-lg mb-4"
          />

          <div class="space-y-2 text-sm">
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Key:</span>
              <span class="ml-2 text-gray-600 dark:text-gray-400 break-all">{{ selectedImage.key }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">URL:</span>
              <div class="flex items-center gap-2 mt-1">
                <input
                  :value="selectedImage.url"
                  readonly
                  class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm"
                />
                <button
                  @click="copyImageUrl(selectedImage.url)"
                  class="px-3 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Size:</span>
              <span class="ml-2 text-gray-600 dark:text-gray-400">{{ formatFileSize(selectedImage.bytes) }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Format:</span>
              <span class="ml-2 text-gray-600 dark:text-gray-400">{{ selectedImage.name.split('.').pop() }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Uploaded:</span>
              <span class="ml-2 text-gray-600 dark:text-gray-400">{{ formatDate(selectedImage.lastModified) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const images = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedImage = ref(null)
const fileInput = ref(null)
const progress = ref('')
const uploadError = ref('')
const { upload, uploading } = useImageUpload()

const filteredImages = computed(() => {
  if (!searchQuery.value) return images.value
  return images.value.filter(img =>
    img.key.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const fetchImages = async () => {
  loading.value = true
  try {
    images.value = await $fetch('/api/media')
  } catch (error) {
    console.error('Failed to fetch images:', error)
    alert('Failed to fetch images')
  } finally {
    loading.value = false
  }
}

const onFiles = async (event) => {
  const files = [...(event.target.files || [])]
  event.target.value = ''
  uploadError.value = ''
  const failed = []
  for (const [i, file] of files.entries()) {
    progress.value = `${i + 1}/${files.length}`
    try {
      await upload(file)
    } catch (error) {
      failed.push(`${file.name}: ${error?.data?.message || error?.message || 'failed'}`)
    }
  }
  progress.value = ''
  if (failed.length) uploadError.value = failed.join(' · ')
  await fetchImages()
}

const copyImageUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('URL copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const deleteImage = async (image) => {
  if (!confirm(`Delete ${image.name}? Pages still using this URL will show a broken image.`)) return

  try {
    await $fetch('/api/media', {
      method: 'DELETE',
      body: { key: image.key }
    })
    await fetchImages()
  } catch (error) {
    console.error('Failed to delete:', error)
    alert('Failed to delete image')
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(fetchImages)
</script>
