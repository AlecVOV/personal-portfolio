<template>
  <div class="min-h-screen bg-eerie-black font-poppins text-white">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-4">Blog</h1>
        <p class="text-gray-400">Thoughts on AI, Machine Learning, and Technology</p>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="text-center py-12">
        <p class="text-gray-400">Loading posts...</p>
      </div>

      <!-- Blog Posts Grid -->
      <div v-else-if="posts && posts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="post in posts"
          :key="post.id"
          class="bg-gradient-jet rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
        >
          <nuxt-link :to="`/blog/${post.slug}`">
            <img
              v-if="post.image_url"
              :src="getPublicUrl('blog-images', post.image_url)"
              :alt="post.title"
              class="w-full h-48 object-cover"
              loading="lazy"
            />
            <div class="p-6">
              <div class="flex gap-4 text-sm text-gray-400 mb-2">
                <span v-if="post.published_at">
                  {{ new Date(post.published_at).toLocaleDateString() }}
                </span>
                <span v-if="post.category" class="text-orange-yellow">
                  {{ post.category }}
                </span>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">
                {{ post.title }}
              </h3>
              <p v-if="post.excerpt" class="text-gray-300 text-sm line-clamp-3">
                {{ post.excerpt }}
              </p>
            </div>
          </nuxt-link>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center text-gray-400 py-12">
        <p>No blog posts yet. Check back soon!</p>
      </div>

      <!-- Back to Home -->
      <div class="mt-12">
        <nuxt-link
          to="/"
          class="inline-flex items-center gap-2 text-orange-yellow hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Back to Home</span>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchBlogPosts, getPublicUrl } = useSupabaseData()

const { data: posts, pending } = await useAsyncData('blog-posts', () => fetchBlogPosts())

// SEO
useSeoMeta({
  title: 'Blog - Le Hoang Triet Thong',
  description: 'Thoughts on AI, Machine Learning, and Technology',
  ogTitle: 'Blog - Le Hoang Triet Thong',
  ogDescription: 'Thoughts on AI, Machine Learning, and Technology'
})
</script>