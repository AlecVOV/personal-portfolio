<template>
  <article 
    class="card bg-white dark:bg-primary-800 rounded-sm overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg group cursor-pointer"
    v-motion
    :initial="{ opacity: 0, y: 30, scale: 0.95 }"
    :visibleOnce="{ 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 600,
        ease: 'easeOut'
      } 
    }"
  >
    <div class="aspect-[16/9] overflow-hidden relative">
      <img 
        :src="post.featured_image || 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'" 
        :alt="post.title" 
        class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <!-- Category Badge -->
      <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <span class="bg-accent-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {{ post.categories?.name || 'Uncategorized' }}
        </span>
      </div>
    </div>
    <div class="p-6">
      <div class="flex items-center mb-4 text-sm text-primary-500 dark:text-primary-400">
        <span class="transition-colors duration-300 group-hover:text-accent-600">{{ formatDate(post.created_at) }}</span>
        <span class="mx-2">•</span>
        <span class="transition-colors duration-300 group-hover:text-accent-600">5 min read</span>
      </div>
      <h3 
        class="font-serif text-xl mb-3 group-hover:text-accent-600 transition-all duration-300 transform group-hover:translate-x-1"
      >
        {{ post.title }}
      </h3>
      <p 
        class="text-primary-600 dark:text-primary-300 mb-4 line-clamp-3 transition-colors duration-300 group-hover:text-primary-700 dark:group-hover:text-primary-200"
      >
        {{ post.excerpt || 'Click to read more...' }}
      </p>
      <NuxtLink 
        :to="`/blog/${post.slug}`" 
        class="text-accent-600 hover:text-accent-700 font-medium inline-flex items-center transition-all duration-300 transform hover:translate-x-1"
      >
        Read More
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>
    
    <!-- Animated border effect -->
    <div class="absolute inset-0 border-2 border-transparent group-hover:border-accent-600/20 transition-all duration-300 rounded-sm pointer-events-none"></div>
  </article>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date'
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>