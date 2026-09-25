<template>
  <div>
    <div class="px-4 sm:px-0 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-serif font-bold text-gray-900 dark:text-white">Media Library</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your Cloudinary images
        </p>
      </div>
      <button
        @click="showUploadWidget"
        class="btn-primary"
      >
        Upload Images
      </button>
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

    <!-- Loading State -->
    <div v-if="loading" class="mt-8 text-center">
      <p class="text-gray-500 dark:text-gray-400">Loading images...</p>
    </div>

    <!-- Images Grid -->
    <div v-else class="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="image in filteredImages"
        :key="image.public_id"
        class="relative group bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
      >
        <!-- Image -->
        <div class="aspect-square relative overflow-hidden">
          <img
            :src="image.secure_url"
            :alt="image.public_id"
            class="w-full h-full object-cover"
          />
          
          <!-- Overlay on Hover -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
              <button
                @click="copyImageUrl(image.secure_url)"
                class="p-2 bg-white rounded-full hover:bg-gray-100"
                title="Copy URL"
              >
                <svg class="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                @click="viewImage(image)"
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
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ image.public_id.split('/').pop() }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ formatFileSize(image.bytes) }} • {{ image.width }}x{{ image.height }}
          </p>
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
            :src="selectedImage.secure_url"
            :alt="selectedImage.public_id"
            class="w-full rounded-lg mb-4"
          />
          
          <div class="space-y-2 text-sm">
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Public ID:</span>
              <span class="ml-2 text-gray-600 dark:text-gray-400">{{ selectedImage.public_id }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">URL:</span>
              <div class="flex items-center gap-2 mt-1">
                <input
                  :value="selectedImage.secure_url"
                  readonly
                  class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm"
                />
                <button
                  @click="copyImageUrl(selectedImage.secure_url)"
                  class="px-3 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Dimensions:</span>
              <span class="ml-2 text-gray-600 dark:text-gray-400">{{ selectedImage.width }}x{{ selectedImage.height }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Size:</span>
              <span class="ml-2 text-gray-600 dark:text-gray-400">{{ formatFileSize(selectedImage.bytes) }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Format:</span>
              <span class="ml-2 text-gray-600 dark:text-gray-400">{{ selectedImage.format }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Created:</span>
              <span class="ml-2 text-gray-600 dark:text-gray-400">{{ formatDate(selectedImage.created_at) }}</span>
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

const filteredImages = computed(() => {
  if (!searchQuery.value) return images.value
  return images.value.filter(img => 
    img.public_id.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const fetchImages = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/cloudinary/images')
    images.value = data.resources || []
  } catch (error) {
    console.error('Failed to fetch images:', error)
    alert('Failed to fetch images')
  } finally {
    loading.value = false
  }
}

const showUploadWidget = () => {
  if (!window.cloudinary) {
    console.error('Cloudinary widget not loaded')
    return
  }

  window.cloudinary.openUploadWidget(
    {
      cloudName: useRuntimeConfig().public.cloudinaryCloudName,
      uploadPreset: useRuntimeConfig().public.cloudinaryUploadPreset,
      sources: ['local', 'url', 'camera'],
      multiple: true,
      maxFiles: 10,
      folder: 'portfolio',
      // Add automatic WebP conversion
      // transformation: [
      //   {
      //     fetch_format: 'auto',
      //     quality: 'auto:good'
      //   }
      // ],
      // Or force WebP conversion
      transformation: [
        {
          format: 'webp',
          quality: 'auto:good'
        }
      ],
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'],
      maxFileSize: 10000000, // 10MB
      maxImageWidth: 3000,
      maxImageHeight: 3000
    },
    (error, result) => {
      if (!error && result && result.event === 'success') {
        console.log('Upload successful:', result.info)
        // The image URL will already be in WebP format
        console.log('WebP URL:', result.info.secure_url)
        fetchImages()
      }
    }
  )
}

const copyImageUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('URL copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const viewImage = (image) => {
  selectedImage.value = image
}

const deleteImage = async (image) => {
  if (!confirm(`Delete ${image.public_id}?`)) return

  try {
    await $fetch('/api/cloudinary/delete', {
      method: 'DELETE',
      body: { public_id: image.public_id }
    })
    await fetchImages()
    alert('Image deleted successfully')
  } catch (error) {
    console.error('Failed to delete:', error)
    alert('Failed to delete image')
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
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

onMounted(() => {
  fetchImages()
  
  // Load Cloudinary Upload Widget
  if (!document.getElementById('cloudinary-upload-widget')) {
    const script = document.createElement('script')
    script.id = 'cloudinary-upload-widget'
    script.src = 'https://upload-widget.cloudinary.com/global/all.js'
    script.async = true
    document.head.appendChild(script)
  }
})
</script>