<template>
  <section class="section bg-primary-100 dark:bg-primary-900">
    <div class="container-custom">
      <h2 
        class="section-title text-center"
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 800 } }"
      >
        What Clients Say
      </h2>

      <!-- Loading State -->
      <div v-if="!testimonials || testimonials.length === 0" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">No testimonials available yet.</p>
      </div>

      <!-- Testimonials Carousel -->
      <div v-else class="max-w-4xl mx-auto">
        <div class="relative">
          <!-- Testimonial Card -->
          <div 
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.id"
            v-show="index === currentTestimonial"
            class="bg-white dark:bg-primary-800 rounded-lg shadow-xl p-8 md:p-12"
            v-motion
            :initial="{ opacity: 0, scale: 0.95 }"
            :visibleOnce="{ opacity: 1, scale: 1, transition: { duration: 600 } }"
          >
            <!-- Quote Icon -->
            <div class="text-accent-600 mb-6">
              <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            <!-- Testimonial Text -->
            <blockquote class="text-lg md:text-xl text-primary-700 dark:text-primary-200 mb-8 italic">
              "{{ testimonial.quote }}"
            </blockquote>

            <!-- Client Info -->
            <div class="flex items-center">
              <img 
                :src="testimonial.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(testimonial.name) + '&background=random'" 
                :alt="testimonial.name"
                class="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <h4 class="font-semibold text-lg text-gray-900 dark:text-white">
                  {{ testimonial.name }}
                </h4>
                <p class="text-gray-600 dark:text-gray-400">{{ testimonial.role }}</p>
                
                <!-- Star Rating -->
                <div class="flex items-center mt-1">
                  <svg
                    v-for="star in 5"
                    :key="star"
                    class="w-4 h-4"
                    :class="star <= (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Dots -->
          <div class="flex justify-center mt-8 space-x-2">
            <button
              v-for="(testimonial, index) in testimonials"
              :key="index"
              @click="currentTestimonial = index"
              :class="[
                'w-3 h-3 rounded-full transition-all duration-300',
                index === currentTestimonial
                  ? 'bg-accent-600 w-8'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-accent-400'
              ]"
            ></button>
          </div>

          <!-- Navigation Arrows -->
          <button
            v-if="testimonials.length > 1"
            @click="previousTestimonial"
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white dark:bg-primary-700 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-primary-600 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            v-if="testimonials.length > 1"
            @click="nextTestimonial"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white dark:bg-primary-700 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-primary-600 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const currentTestimonial = ref(0);
let testimonialInterval;

// Fetch testimonials from API
const { data: testimonials } = await useFetch('/api/testimonials', {
  transform: (data) => {
    return data.filter(t => t.status === 'published')
  }
})

const nextTestimonial = () => {
  if (!testimonials.value || testimonials.value.length === 0) return
  currentTestimonial.value = (currentTestimonial.value + 1) % testimonials.value.length
}

const previousTestimonial = () => {
  if (!testimonials.value || testimonials.value.length === 0) return
  currentTestimonial.value = currentTestimonial.value === 0 
    ? testimonials.value.length - 1 
    : currentTestimonial.value - 1
}

const startTestimonialRotation = () => {
  if (!testimonials.value || testimonials.value.length === 0) return
  
  testimonialInterval = setInterval(() => {
    nextTestimonial()
  }, 8000);
};

onMounted(() => {
  startTestimonialRotation();
});

onBeforeUnmount(() => {
  if (testimonialInterval) {
    clearInterval(testimonialInterval);
  }
});
</script>