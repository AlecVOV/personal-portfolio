<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="container-custom">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-center mb-8">Image Lightbox Test</h1>
        
        <div class="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 class="text-xl font-semibold mb-4">Features:</h2>
          <ul class="space-y-2 text-sm">
            <li>✅ <strong>Zoom In/Out:</strong> Use zoom buttons or mouse wheel</li>
            <li>✅ <strong>Pan:</strong> Click and drag when zoomed in</li>
            <li>✅ <strong>Touch Support:</strong> Pinch to zoom, drag to pan on mobile</li>
            <li>✅ <strong>Keyboard Navigation:</strong> Arrow keys, +/- for zoom, Esc to close</li>
            <li>✅ <strong>Responsive:</strong> Works perfectly on all screen sizes</li>
            <li>✅ <strong>Performance Optimized:</strong> Smooth animations with monitoring</li>
          </ul>
        </div>
        
        <!-- Test Gallery -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(image, index) in testImages" 
            :key="image.id"
            class="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300"
            @click="openLightbox(index)"
          >
            <img 
              :src="image.image" 
              :alt="image.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
        
        <!-- Instructions -->
        <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 class="font-semibold mb-2">How to test:</h3>
          <ol class="text-sm space-y-1">
            <li>1. Click any image to open the lightbox</li>
            <li>2. Use zoom controls or mouse wheel to zoom in/out</li>
            <li>3. When zoomed in, click and drag to pan around the image</li>
            <li>4. Use arrow keys to navigate between images</li>
            <li>5. Press Esc or click the X to close</li>
          </ol>
        </div>
      </div>
    </div>
    
    <!-- Lightbox Component -->
    <ImageLightbox
      :images="testImages"
      :initial-index="currentIndex"
      :is-open="isLightboxOpen"
      @close="closeLightbox"
      @index-change="handleIndexChange"
    />
    
    <!-- Performance Monitor for Testing -->
    <AnimationPerformanceMonitor :enabled="true" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ImageLightbox from '~/components/ImageLightbox.vue'
import AnimationPerformanceMonitor from '~/components/AnimationPerformanceMonitor.vue'

// Test data
const testImages = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=2',
    title: 'Wedding Photography',
    category: 'Wedding'
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=2',
    title: 'Portrait Photography',
    category: 'Portrait'
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=2',
    title: 'Landscape Photography',
    category: 'Landscape'
  },
  {
    id: 4,
    image: 'https://images.pexels.com/photos/4041188/pexels-photo-4041188.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=2',
    title: 'Commercial Photography',
    category: 'Commercial'
  },
  {
    id: 5,
    image: 'https://images.pexels.com/photos/1553454/pexels-photo-1553454.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=2',
    title: 'Nature Photography',
    category: 'Nature'
  },
  {
    id: 6,
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=2',
    title: 'Creative Portrait',
    category: 'Portrait'
  }
]

// State
const isLightboxOpen = ref(false)
const currentIndex = ref(0)

// Methods
const openLightbox = (index: number) => {
  currentIndex.value = index
  isLightboxOpen.value = true
}

const closeLightbox = () => {
  isLightboxOpen.value = false
}

const handleIndexChange = (newIndex: number) => {
  currentIndex.value = newIndex
}

// Page meta
definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Image Lightbox Test - Photography Portfolio',
  meta: [
    { name: 'description', content: 'Test page for the improved image lightbox with zoom, pan, and touch support.' }
  ]
})
</script>