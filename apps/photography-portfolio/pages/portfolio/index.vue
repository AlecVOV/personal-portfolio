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
          <h1 class="font-serif text-4xl md:text-5xl mb-6">Portfolio Gallery</h1>
          <p class="text-lg mb-8">
            A curated collection of my finest work across various photography genres, 
            showcasing my unique style and artistic vision.
          </p>
        </div>
      </div>
    </section>
    
    <section class="section">
      <div class="container-custom">
        <!-- Loading State -->
        <div v-if="pending" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Loading portfolio...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-500">Error loading portfolio: {{ error.message }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!portfolioItems || portfolioItems.length === 0" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">No portfolio items yet. Check back soon!</p>
        </div>

        <!-- Portfolio Content -->
        <template v-else>
          <PortfolioCategoryList 
            :categories="categories" 
            :active-category="activeCategory"
            @filter-change="handleFilterChange"
          />
          
          <PortfolioGrid 
            :photos="filteredPhotos" 
            :category="activeCategory"
          />
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

definePageMeta({
  layout: 'default'
});

useHead({
  title: 'Portfolio Gallery - LensCraft Photography',
  meta: [
    { name: 'description', content: 'Browse our photography portfolio showcasing weddings, portraits, landscapes, and commercial photography work.' }
  ]
});

const activeCategory = ref('all');

// Fetch portfolio items from API
const { data: portfolioItems, pending, error } = await useFetch('/api/portfolio', {
  // Only get published items for public view
  transform: (data) => {
    return data.filter(item => item.status === 'published')
  }
})

// Fetch categories from API
const { data: categoriesData } = await useFetch('/api/categories')

// Transform categories to match the component's expected format
const categories = computed(() => {
  if (!categoriesData.value) return []
  
  return [
    { id: 'all', name: 'All', slug: 'all' },
    ...categoriesData.value.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug
    }))
  ]
})

// Filter photos based on active category
const filteredPhotos = computed(() => {
  if (!portfolioItems.value) return []
  
  if (activeCategory.value === 'all') {
    return portfolioItems.value
  }
  
  return portfolioItems.value.filter(item => 
    item.category_id === activeCategory.value
  )
})

const handleFilterChange = (category) => {
  activeCategory.value = category;
};
</script>