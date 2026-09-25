<template>
  <div v-if="post">
    <!-- Hero Section -->
    <section class="pt-32 pb-12 bg-primary-50 dark:bg-primary-800">
      <div class="container-custom">
        <div class="max-w-4xl mx-auto">
          <!-- Category Badge -->
          <div class="mb-4">
            <span class="inline-block bg-accent-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              {{ post.categories?.name || 'Uncategorized' }}
            </span>
          </div>

          <!-- Title -->
          <h1 
            class="font-serif text-4xl md:text-5xl lg:text-6xl mb-6"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 800 } }"
          >
            {{ post.title }}
          </h1>

          <!-- Meta Info -->
          <div 
            class="flex items-center text-primary-600 dark:text-primary-400 mb-8"
            v-motion
            :initial="{ opacity: 0 }"
            :visibleOnce="{ opacity: 1, transition: { delay: 200, duration: 600 } }"
          >
            <span>{{ formatDate(post.created_at) }}</span>
            <span class="mx-3">•</span>
            <span>5 min read</span>
            <span class="mx-3">•</span>
            <span>{{ post.views || 0 }} views</span>
          </div>

          <!-- Excerpt -->
          <p 
            v-if="post.excerpt"
            class="text-xl text-primary-600 dark:text-primary-300 mb-8"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { delay: 300, duration: 600 } }"
          >
            {{ post.excerpt }}
          </p>
        </div>
      </div>
    </section>

    <!-- Featured Image -->
    <section 
      v-if="post.featured_image" 
      class="section"
      v-motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :visibleOnce="{ opacity: 1, scale: 1, transition: { delay: 400, duration: 800 } }"
    >
      <div class="container-custom">
        <div class="max-w-5xl mx-auto">
          <img 
            :src="post.featured_image" 
            :alt="post.title" 
            class="w-full h-auto rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="section">
      <div class="container-custom">
        <div class="max-w-4xl mx-auto">
          <article 
            class="prose prose-lg dark:prose-invert max-w-none
                   prose-headings:font-serif prose-headings:font-bold
                   prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                   prose-p:text-primary-700 dark:prose-p:text-primary-300
                   prose-a:text-accent-600 hover:prose-a:text-accent-700
                   prose-img:rounded-lg prose-img:shadow-lg
                   prose-blockquote:border-l-4 prose-blockquote:border-accent-600
                   prose-blockquote:italic prose-blockquote:text-primary-600
                   prose-code:text-accent-600 prose-code:bg-primary-100 
                   dark:prose-code:bg-primary-800 prose-code:px-1 prose-code:rounded"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visibleOnce="{ opacity: 1, y: 0, transition: { delay: 500, duration: 800 } }"
            v-html="renderMarkdown(post.content)"
          ></article>

          <!-- Share Section -->
          <div 
            class="mt-12 pt-8 border-t border-primary-200 dark:border-primary-700"
            v-motion
            :initial="{ opacity: 0 }"
            :visibleOnce="{ opacity: 1, transition: { delay: 600, duration: 600 } }"
          >
            <h3 class="font-serif text-xl mb-4">Share this post</h3>
            <div class="flex gap-4">
              <a 
                :href="`https://twitter.com/intent/tweet?text=${post.title}&url=${currentUrl}`"
                target="_blank"
                class="btn-secondary"
              >
                Twitter
              </a>
              <a 
                :href="`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`"
                target="_blank"
                class="btn-secondary"
              >
                Facebook
              </a>
              <a 
                :href="`https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=${post.title}`"
                target="_blank"
                class="btn-secondary"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Related Posts -->
    <section v-if="relatedPosts.length > 0" class="section bg-primary-50 dark:bg-primary-800">
      <div class="container-custom">
        <h2 class="font-serif text-3xl md:text-4xl mb-12 text-center">Related Posts</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BlogCard 
            v-for="relatedPost in relatedPosts" 
            :key="relatedPost.id" 
            :post="relatedPost" 
          />
        </div>
      </div>
    </section>
  </div>

  <!-- Loading State -->
  <div v-else class="min-h-screen flex items-center justify-center">
    <p class="text-gray-500 dark:text-gray-400">Loading post...</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { marked } from 'marked';

definePageMeta({
  layout: 'default'
});

const route = useRoute();
const slug = computed(() => route.params.slug);

// Current URL for sharing
const currentUrl = computed(() => {
  if (process.client) {
    return window.location.href
  }
  return ''
})

// Fetch all posts and find the one matching the slug
const { data: allPosts } = await useFetch('/api/blog')

const post = computed(() => {
  if (!allPosts.value) return null
  return allPosts.value.find(p => p.slug === slug.value)
})

// Handle post not found
if (!post.value) {
  throw createError({
    statusCode: 404,
    message: 'Blog post not found'
  })
}

// Get related posts (exclude current post, same category preferred)
const relatedPosts = computed(() => {
  if (!allPosts.value || !post.value) return []
  
  return allPosts.value
    .filter(p => 
      p.id !== post.value.id && 
      p.status === 'published' && 
      !p.deleted_at
    )
    .sort((a, b) => {
      // Prioritize same category
      if (a.category_id === post.value.category_id && b.category_id !== post.value.category_id) return -1
      if (b.category_id === post.value.category_id && a.category_id !== post.value.category_id) return 1
      return 0
    })
    .slice(0, 3)
})

useHead({
  title: computed(() => `${post.value?.title || 'Blog Post'} - LensCraft Photography Blog`),
  meta: [
    { 
      name: 'description', 
      content: computed(() => post.value?.excerpt || '')
    }
  ]
});

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Render Markdown to HTML
const renderMarkdown = (markdown) => {
  if (!markdown) return ''
  return marked(markdown)
}
</script>

<style scoped>
/* Additional styling for blog content if needed */
</style>