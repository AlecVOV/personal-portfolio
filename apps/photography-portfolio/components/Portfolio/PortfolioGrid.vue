<template>
  <div class="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    <div
      v-for="(photo, index) in photos"
      :key="photo.id"
      class="group cursor-pointer"
      @click="openLightbox(index)"
      v-motion
      :initial="{ opacity: 0, y: 30 }"
      :visibleOnce="{ 
        opacity: 1, 
        y: 0, 
        transition: { 
          delay: 100 * (index % 6), 
          duration: 600 
        } 
      }"
    >
      <div class="relative overflow-hidden rounded-sm shadow-lg aspect-[3/4]">
        <img
          :src="photo.image"
          :alt="photo.title"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 class="text-xl font-serif mb-2">{{ photo.title }}</h3>
            <p class="text-sm opacity-90" v-if="photo.categories">{{ photo.categories.name }}</p>
            <p class="text-sm opacity-90 mt-2" v-if="photo.description">{{ photo.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <ImageLightbox
      v-if="isLightboxOpen"
      :images="photos"
      :current-index="currentImageIndex"
      @close="closeLightbox"
      @index-change="updateIndex"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  },
  category: {
    type: String,
    default: 'all'
  }
})

const isLightboxOpen = ref(false)
const currentImageIndex = ref(0)

const openLightbox = (index) => {
  currentImageIndex.value = index
  isLightboxOpen.value = true
}

const closeLightbox = () => {
  isLightboxOpen.value = false
}

const updateIndex = (newIndex) => {
  currentImageIndex.value = newIndex
}
</script>