<template>
  <div>
    <HomeHeroSlider />
    
    <HomeFeaturedWork />
    <section class="section bg-primary-50 dark:bg-primary-900">
      <div class="container-custom">
        <div class="max-w-3xl mx-auto text-center">
          <div 
            class="text-center md:text-center"
            v-motion
            :initial="{ opacity: 0, x: -60 }"
            :visibleOnce="{ 
              opacity: 1, 
              x: 0,
              transition: { 
                duration: 1000,
                ease: 'easeOut',
                delay: 200
              } 
            }"
          >
            <h2 class="section-title">Capturing Life's Beautiful Moments</h2>
            <p class="text-lg mb-8">
              Life so short, every moment we have been though will be precious and priceless, deep dive with me in my world and see my point of view and feeing via images. My passion is creating timeless images that tell your unique story.
            </p>
            
            <!-- Enhanced button animations with stagger effect -->
            <div class="flex justify-center">
              <NuxtLink 
                to="/about" 
                class="btn btn-primary hover-scale-sm"
                v-motion
                :initial="{ opacity: 0, y: 30 }"
                :visibleOnce="{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    duration: 800,
                    ease: 'backOut',
                    delay: 800
                  } 
                }"
              >
                Learn about my approach
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <HomeTestimonials />
    
    <section class="section bg-primary-50 dark:bg-primary-800">
      <div class="container-custom">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div 
            class="text-center md:text-left"
            v-motion
            :initial="{ opacity: 0, x: -60 }"
            :visibleOnce="{ 
              opacity: 1, 
              x: 0,
              transition: { 
                duration: 1000,
                ease: 'easeOut',
                delay: 200
              } 
            }"
          >
            <h2 class="section-title">Ready to discover your beauty though my lens?</h2>
            <p class="text-lg mb-8">
              Let's work together to capture your special moments. Whether you're planning for a small concepts, street photos or family pictures, I'm here to bring your vision to life.
            </p>
            
            <!-- Enhanced button animations with stagger effect -->
            <div class="flex flex-col sm:flex-row gap-4">
              <NuxtLink 
                to="/about" 
                class="btn btn-primary hover-scale-sm"
                v-motion
                :initial="{ opacity: 0, y: 30 }"
                :visibleOnce="{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    duration: 800,
                    ease: 'backOut',
                    delay: 800
                  } 
                }"
              >
                Get in Touch
              </NuxtLink>
              
              <NuxtLink 
                to="/portfolio" 
                class="btn btn-primary hover-scale-sm"
                v-motion
                :initial="{ opacity: 0, y: 30 }"
                :visibleOnce="{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    duration: 800,
                    ease: 'backOut',
                    delay: 1000
                  } 
                }"
              >
                Browse Portfolio
              </NuxtLink>
            </div>
          </div>
          
          <div
            v-motion
            :initial="{ opacity: 0, x: 50 }"
            :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 800 } }"
          >
            <img 
              src="https://res.cloudinary.com/dqved9nx9/image/upload/v1754670215/IMG_20250201_011838_741_qvmd1d.webp" 
              alt="My portrait" 
              class="w-full h-auto rounded-sm shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
});

useHead({
  title: 'LensCraft Photography - Capturing Life\'s Beautiful Moments',
  meta: [
    { name: 'description', content: 'Professional photography services specializing in weddings, portraits, and landscapes. Creating timeless images that tell your unique story.' }
  ]
});
</script>