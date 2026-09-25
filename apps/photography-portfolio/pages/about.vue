<template>
  <div>
    <section class="pt-32 pb-12 bg-primary-50 dark:bg-primary-800">
      <div class="container-custom">
        <div 
          class="max-w-3xl mx-auto text-center"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 800 } }"
        >
          <h1 class="font-serif text-4xl md:text-5xl mb-6">About Me</h1>
          <p class="text-lg mb-8">
            Learn more about the photographer behind the lens and my unique approach to capturing special moments.
          </p>
        </div>
      </div>
    </section>
    
    <section class="section">
      <div class="container-custom">
        <AboutSection />
      </div>
    </section>
    
    <section class="section bg-primary-50 dark:bg-primary-800">
      <div class="container-custom">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 800 } }"
          >
            <h2 class="section-title">My Approach</h2>
            <div class="space-y-4 text-primary-700 dark:text-primary-300">
              <p>
                My photography style can be described as a blend of documentary and fine art approaches. I believe in capturing authentic moments as they unfold naturally, while also creating deliberately composed artistic images that stand the test of time.
              </p>
              <p>
                For every session, I take time to understand your vision and preferences, allowing me to tailor my approach to your unique story. I focus on genuine emotion and meaningful connections.
              </p>
              <p>
                I use the natural light available to create images with depth, dimension, and mood. My post-processing workflow enhances each image while maintaining natural skin tones and authentic colors.
              </p>
            </div>
          </div>
          
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 800, delay: 300 } }"
          >
            <h2 class="section-title">Get In Touch</h2>
            <p class="mb-6 text-primary-700 dark:text-primary-300">
              Interested in working together? Fill out the form below and I'll get back to you as soon as possible.
            </p>
            <AboutContactForm />
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
  title: 'About Me - LensCraft Photography',
  meta: [
    { name: 'description', content: 'Learn about the photographer behind LensCraft Photography, their story, approach, and photography philosophy.' }
  ]
});
</script>