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
          <h1 class="font-serif text-4xl md:text-5xl mb-6">Photography Blog</h1>
          <p class="text-lg mb-8">
            Insights, stories, and behind-the-scenes glimpses from recent photoshoots and adventures.
          </p>
        </div>
      </div>
    </section>
    
    <section class="section">
      <div class="container-custom">
        <!-- Loading State -->
        <div v-if="pending" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Loading posts...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-500">Error loading posts: {{ error.message }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!blogPosts || blogPosts.length === 0" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">No blog posts yet. Check back soon!</p>
        </div>

        <!-- Blog Posts Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="(post, index) in blogPosts" 
            :key="post.id"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { delay: 100 * (index % 6), duration: 600 } }"
          >
            <BlogCard :post="post" />
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
  title: 'Photography Blog - LensCraft Photography',
  meta: [
    { name: 'description', content: 'Read our latest photography blog posts, featuring behind-the-scenes stories, photography tips, and recent work.' }
  ]
});

// Fetch blog posts from API
const { data: blogPosts, pending, error, refresh } = await useFetch('/api/blog', {
  // Only get published posts for public view
  transform: (data) => {
    return data.filter(post => post.status === 'published' && !post.deleted_at)
  }
})
</script>