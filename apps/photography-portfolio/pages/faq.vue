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
          <h1 class="font-serif text-4xl md:text-5xl mb-6">Frequently Asked Questions</h1>
          <p class="text-lg mb-8">
            Find answers to common questions about our photography services, booking process, and what to expect.
          </p>
        </div>
      </div>
    </section>
    
    <section class="section">
      <div class="container-custom">
        <div class="max-w-3xl mx-auto">
          <FaqAccordion :faq-items="faqItems" />
          
          <div class="mt-16 text-center">
            <h3 class="font-serif text-2xl mb-6">Still Have Questions?</h3>
            <p class="mb-8">
              If you couldn't find the answer to your question, feel free to reach out directly.
            </p>
            <NuxtLink 
              to="/about" 
              class="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg pulse-glow transition-colors duration-300 font-medium shadow-md hover:shadow-lg hover:bg-yellow-300 hover:text-black transform hover:scale-105"
            >
              Contact Me
            </NuxtLink>
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
  title: 'FAQ - LensCraft Photography',
  meta: [
    { name: 'description', content: 'Find answers to frequently asked questions about our photography services, booking process, pricing, and what to expect from your photoshoot.' }
  ]
});

const faqItems = [
  {
    question: 'How far in advance should I book my session?',
    answer: 'For portrait sessions, I recommend booking 2-4 weeks in advance to ensure availability. But earlier booking is recommended.'
  },
  {
    question: 'What is your photography style?',
    answer: 'My style blends documentary and fine art approaches. I focus on capturing authentic moments and emotions as they naturally unfold, while also creating deliberately composed artistic images. I use natural light whenever possible, supplemented by professional lighting when needed. My editing style emphasizes natural skin tones, rich but not oversaturated colors, and timeless processing that won\'t look dated in years to come.'
  },
  {
    question: 'How many photos will I receive?',
    answer: 'The number of final images depends on the type and length of your session. Portrait sessions typically yield 30-50 edited images per hour of shooting time. Documentation will be handle all to you as soon as possible. I focus on quality over quantity, carefully selecting the strongest images that tell your story rather than delivering every shot taken.'
  },
  {
    question: 'How long until I receive my photos?',
    answer: 'For documentation are typically delivered within 1 days after with no editing. Portrait often take longer, but usually I only take photos, editing will depend on the client request. I often provide a small preview gallery within a few days after your session so you can share some highlights while waiting for the complete gallery.'
  },
  {
    question: 'Do you provide both color and black & white photos?',
    answer: 'Yes, your gallery will include both color and black & white versions of select images. Some moments simply shine in black & white, while others are best appreciated in full color. If you have specific preferences for certain images, just let me know and I\'m happy to accommodate.'
  },
  {
    question: 'What should we wear for our portrait session?',
    answer: 'For portrait sessions, I recommend wearing outfits that reflect your personal style while coordinating colors and tones among group members. Avoid overly busy patterns or logos that can distract from your faces. Solid colors or subtle patterns in complementary shades work best. I\'m happy to provide more specific wardrobe guidance based on your session location and theme.'
  },
];
</script>