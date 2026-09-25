<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isOpen" 
        class="fixed inset-0 bg-black/95 z-50 flex flex-col"
        @click.self="closeLightbox"
        @keydown.esc="closeLightbox"
        tabindex="0"
        ref="lightboxContainer"
      >
        <!-- Header with controls -->
        <div class="flex items-center justify-between p-4 text-white bg-black/50 backdrop-blur-sm">
          <div class="flex items-center space-x-4">
            <!-- Image counter -->
            <span class="text-sm font-medium">
              {{ currentIndex + 1 }} / {{ images.length }}
            </span>
            
            <!-- Zoom controls -->
            <div class="flex items-center space-x-2">
              <button
                @click="zoomOut"
                :disabled="scale <= minScale"
                class="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
                </svg>
              </button>
              
              <span class="text-sm min-w-[3rem] text-center">{{ Math.round(scale * 100) }}%</span>
              
              <button
                @click="zoomIn"
                :disabled="scale >= maxScale"
                class="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                </svg>
              </button>
              
              <button
                @click="resetZoom"
                class="p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Reset Zoom"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Close button -->
          <button 
            @click="closeLightbox" 
            class="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Close (Esc)"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Main image area -->
        <div class="flex-1 relative overflow-hidden">
          <!-- Navigation buttons -->
          <button 
            v-if="images.length > 1"
            @click="previousImage" 
            class="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white hover:text-accent-400 transition-all duration-200 rounded-full hover:bg-white/10 transform hover:scale-105"
            title="Previous Image (←)"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          
          <button 
            v-if="images.length > 1"
            @click="nextImage" 
            class="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white hover:text-accent-400 transition-all duration-200 rounded-full hover:bg-white/10 transform hover:scale-105"
            title="Next Image (→)"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
          
          <!-- Image container with pan and zoom -->
          <div 
            ref="imageContainer"
            class="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            @mousedown="startPan"
            @mousemove="handlePan"
            @mouseup="endPan"
            @mouseleave="endPan"
            @wheel="handleWheel"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <Transition
              name="image-fade"
              mode="out-in"
              enter-active-class="transition-opacity duration-300"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <img 
                :key="currentImage.id"
                :src="currentImage.image" 
                :alt="currentImage.title"
                ref="currentImageEl"
                class="max-w-none select-none"
                :style="imageStyle"
                @load="handleImageLoad"
                @dragstart.prevent
              />
            </Transition>
          </div>
        </div>
        
        <!-- Footer with image info -->
        <div 
          v-if="currentImage.title || currentImage.category"
          class="p-4 text-center text-white bg-black/50 backdrop-blur-sm"
        >
          <h3 v-if="currentImage.title" class="text-xl font-serif mb-1">
            {{ currentImage.title }}
          </h3>
          <p v-if="currentImage.category" class="text-accent-300 text-sm">
            {{ currentImage.category }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

interface LightboxImage {
  id: string | number
  image: string
  title?: string
  category?: string
}

interface Props {
  images: LightboxImage[]
  initialIndex?: number
  isOpen: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0
})

const emit = defineEmits<{
  close: []
  indexChange: [index: number]
}>()

// Refs
const lightboxContainer = ref<HTMLElement>()
const imageContainer = ref<HTMLElement>()
const currentImageEl = ref<HTMLImageElement>()

// State
const currentIndex = ref(props.initialIndex)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const imageLoaded = ref(false)

// Constants
const minScale = 0.5
const maxScale = 5
const zoomStep = 0.25

// Computed
const currentImage = computed(() => props.images[currentIndex.value] || {})

const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transition: isPanning.value ? 'none' : 'transform 0.2s ease-out',
  maxWidth: scale.value === 1 ? '100%' : 'none',
  maxHeight: scale.value === 1 ? '100%' : 'none'
}))

// Methods
const closeLightbox = () => {
  resetZoom()
  emit('close')
}

const resetZoom = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

const zoomIn = () => {
  if (scale.value < maxScale) {
    scale.value = Math.min(maxScale, scale.value + zoomStep)
  }
}

const zoomOut = () => {
  if (scale.value > minScale) {
    scale.value = Math.max(minScale, scale.value - zoomStep)
    // Reset position if zoomed out to fit
    if (scale.value === 1) {
      translateX.value = 0
      translateY.value = 0
    }
  }
}

const previousImage = () => {
  if (props.images.length > 1) {
    currentIndex.value = currentIndex.value > 0 
      ? currentIndex.value - 1 
      : props.images.length - 1
    resetZoom()
    emit('indexChange', currentIndex.value)
  }
}

const nextImage = () => {
  if (props.images.length > 1) {
    currentIndex.value = currentIndex.value < props.images.length - 1 
      ? currentIndex.value + 1 
      : 0
    resetZoom()
    emit('indexChange', currentIndex.value)
  }
}

// Pan functionality
const startPan = (event: MouseEvent) => {
  if (scale.value > 1) {
    isPanning.value = true
    panStart.value = { x: event.clientX - translateX.value, y: event.clientY - translateY.value }
  }
}

const handlePan = (event: MouseEvent) => {
  if (isPanning.value && scale.value > 1) {
    translateX.value = event.clientX - panStart.value.x
    translateY.value = event.clientY - panStart.value.y
  }
}

const endPan = () => {
  isPanning.value = false
}

// Wheel zoom
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  
  if (event.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// Touch support
let touchStartDistance = 0
let touchStartScale = 1

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 2) {
    // Pinch zoom start
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    touchStartDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
    touchStartScale = scale.value
  } else if (event.touches.length === 1 && scale.value > 1) {
    // Pan start
    const touch = event.touches[0]
    isPanning.value = true
    panStart.value = { x: touch.clientX - translateX.value, y: touch.clientY - translateY.value }
  }
}

const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault()
  
  if (event.touches.length === 2) {
    // Pinch zoom
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
    
    const newScale = touchStartScale * (currentDistance / touchStartDistance)
    scale.value = Math.max(minScale, Math.min(maxScale, newScale))
  } else if (event.touches.length === 1 && isPanning.value && scale.value > 1) {
    // Pan
    const touch = event.touches[0]
    translateX.value = touch.clientX - panStart.value.x
    translateY.value = touch.clientY - panStart.value.y
  }
}

const handleTouchEnd = () => {
  isPanning.value = false
  if (scale.value === 1) {
    translateX.value = 0
    translateY.value = 0
  }
}

const handleImageLoad = () => {
  imageLoaded.value = true
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.isOpen) return
  
  switch (event.key) {
    case 'Escape':
      closeLightbox()
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case '0':
      resetZoom()
      break
  }
}

// Watchers
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
    nextTick(() => {
      lightboxContainer.value?.focus()
    })
  } else {
    document.body.style.overflow = ''
    resetZoom()
  }
})

watch(() => props.initialIndex, (newIndex) => {
  currentIndex.value = newIndex
  resetZoom()
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.image-fade-enter-active,
.image-fade-leave-active {
  transition: opacity 0.3s ease;
}

.image-fade-enter-from,
.image-fade-leave-to {
  opacity: 0;
}

/* Prevent text selection during pan */
.cursor-grabbing * {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>