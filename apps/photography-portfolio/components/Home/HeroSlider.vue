<template>
  <div class="relative h-screen overflow-hidden">
    <div class="absolute inset-0 bg-black/40 z-10"></div>
    
    <!-- Simplified crossfade transition -->
    <Transition name="crossfade" mode="out-in">
      <div 
        :key="currentSlide"
        class="absolute inset-0"
      >
        <img 
          :src="slides[currentSlide].image"
          :alt="slides[currentSlide].alt"
          class="w-full h-full object-cover"
        />
      </div>
    </Transition>
    
    <div class="absolute inset-0 flex flex-col items-center justify-center z-20 text-white text-center px-4">
      <!-- Simplified fade-in for title - no stagger -->
      <h1 
        class="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 tracking-wider fade-in"
      >
        CAPTURING LIFE'S<br />PRECIOUS MOMENTS
      </h1>
      <!-- Simplified fade-in for subtitle - no stagger -->
      <p 
        class="max-w-2xl text-lg md:text-xl opacity-90 mb-8 fade-in"
      >
        Through the lens of artistry and emotion, we create timeless memories that will last forever.
      </p>
      <!-- Simplified buttons with no pulse effects -->
      <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 fade-in">
        <NuxtLink to="/portfolio" class="btn btn-primary hover-scale-sm">
          View Portfolio
        </NuxtLink>
        <NuxtLink to="/about" class="btn btn-primary hover-scale-sm">
          About Me
        </NuxtLink>
      </div>
    </div>
    
    <!-- Simplified navigation dots -->
    <div class="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-30">
      <button 
        v-for="(slide, index) in slides" 
        :key="slide.id"
        @click="currentSlide = index"
        class="w-3 h-3 rounded-full transition-all duration-200 ease-out hover:scale-105"
        :class="currentSlide === index ? 'bg-white' : 'bg-white/50 hover:bg-white/80'"
        aria-label="Go to slide"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const slides = [
  {
    id: 1,
    image: 'https://res.cloudinary.com/dqved9nx9/image/upload/v1754670236/20250430_213049_lvsf7j.jpg',
    alt: 'Independence Palace at night for the 50th anniversary of National Reunification Day (April 30th)'
  },
  {
    id: 2,
    image: 'https://res.cloudinary.com/dqved9nx9/image/upload/v1754670220/20250318_182230_onfyvq.jpg',
    alt: 'Swinburne Afterglow'
  },
  {
    id: 3,
    image: 'https://res.cloudinary.com/dqved9nx9/image/upload/v1754670272/DSC06525_adepzy.jpg',
    alt: 'A Mentro Corner in the noon'
  }
];

const currentSlide = ref(0);
let slideInterval;

const startSlideshow = () => {
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length;
  }, 6000);
};

onMounted(() => {
  startSlideshow();
});

onBeforeUnmount(() => {
  clearInterval(slideInterval);
});
</script>