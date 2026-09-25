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
          <h1 class="font-serif text-4xl md:text-5xl mb-6 capitalize">{{ category }} Photography</h1>
          <p class="text-lg mb-8">
            {{ getCategoryDescription(category) }}
          </p>
          <NuxtLink to="/portfolio" class="btn btn-outline">
            View All Categories
          </NuxtLink>
        </div>
      </div>
    </section>
    
    <section class="section">
      <div class="container-custom">
        <PortfolioGrid 
          :photos="filteredPhotos" 
          :category="category"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

definePageMeta({
  layout: 'default'
});

const route = useRoute();
const category = computed(() => route.params.category);

useHead({
  title: computed(() => `${category.value.charAt(0).toUpperCase() + category.value.slice(1)} Photography - LensCraft Photography`),
  meta: [
    { 
      name: 'description', 
      content: computed(() => `Browse our ${category.value} photography portfolio showcasing our finest work.`)
    }
  ]
});

const photos = [
  {
    id: 1,
    title: 'Sunlife A Morning',
    category: 'landscape',
    image: 'https://res.cloudinary.com/dqved9nx9/image/upload/v1754670870/IMGP7520_jkgeof.jpg',
    description: 'Capturing the Sunlife pantroma during a serene morning.'
  },
];

const filteredPhotos = computed(() => {
  return photos.filter(photo => photo.category === category.value);
});

const getCategoryDescription = (category) => {
  const descriptions = {
    documentary: 'Capturing real-life events and stories through candid and authentic photography.',
    landscape: 'Showcasing the breathtaking beauty of natural environments through carefully composed and atmospheric landscape photography.',
    portrait: 'Creating compelling portraits that reveal personality and emotion, whether for personal, family, or professional purposes.',
  };
  
  return descriptions[category] || 'This Category is not available.';
};
</script>