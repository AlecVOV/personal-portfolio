<template>
  <div class="min-h-screen bg-eerie-black font-poppins text-white">
    <article class="max-w-4xl mx-auto px-6 py-12">
      <!-- Loading State -->
      <div v-if="pending" class="text-center py-12">
        <p class="text-gray-400">Loading post...</p>
      </div>

      <!-- Post Not Found -->
      <div v-else-if="!post" class="text-center py-12">
        <h2 class="text-2xl font-semibold mb-4">Post not found</h2>
        <nuxt-link to="/blog" class="text-orange-yellow hover:text-white">
          ← Back to Blog
        </nuxt-link>
      </div>

      <!-- Post Content -->
      <template v-else>
        <!-- Back Button -->
        <nuxt-link
          to="/blog"
          class="inline-flex items-center gap-2 text-orange-yellow hover:text-white transition-colors mb-8"
        >
          <span>←</span>
          <span>Back to Blog</span>
        </nuxt-link>

        <!-- Article Header -->
        <header class="mb-8">
          <div class="flex gap-4 text-sm text-gray-400 mb-4">
            <time v-if="post.published_at" :datetime="post.published_at">
              {{ new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}
            </time>
            <span v-if="post.category" class="text-orange-yellow">
              {{ post.category }}
            </span>
          </div>

          <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ post.title }}</h1>

          <p v-if="post.excerpt" class="text-xl text-gray-300">
            {{ post.excerpt }}
          </p>
        </header>

        <!-- Featured Image -->
        <img
          v-if="post.image_url"
          :src="getPublicUrl('blog-images', post.image_url)"
          :alt="post.title"
          class="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
        />

        <!-- Article Content (rendered markdown) -->
        <div class="prose prose-invert prose-orange max-w-none" v-html="renderedContent" />

        <!-- Navigation -->
        <nav class="mt-12 pt-8 border-t border-gray-700 flex justify-between">
          <nuxt-link
            to="/blog"
            class="text-orange-yellow hover:text-white transition-colors"
          >
            ← All Posts
          </nuxt-link>
          <nuxt-link
            to="/"
            class="text-orange-yellow hover:text-white transition-colors"
          >
            Home →
          </nuxt-link>
        </nav>
      </template>
    </article>
  </div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it'

const route = useRoute()
const slug = route.params.slug as string

const { fetchBlogPostBySlug, getPublicUrl } = useSupabaseData()

const { data: post, pending } = await useAsyncData(
  `blog-${slug}`,
  () => fetchBlogPostBySlug(slug)
)

const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return md.render(post.value.content)
})

// SEO
watchEffect(() => {
  if (post.value) {
    useSeoMeta({
      title: post.value.title,
      description: post.value.excerpt ?? '',
      ogTitle: post.value.title,
      ogDescription: post.value.excerpt ?? '',
    })
  }
})
</script>


<style scoped>
.prose {
  color: rgb(209, 213, 219);
}

.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: white;
}

.prose :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: white;
}

.prose :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.75;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose :deep(li) {
  margin-bottom: 0.5rem;
}

.prose :deep(code) {
  background-color: #1a1a1a;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  color: #ff9800;
}

.prose :deep(pre) {
  background-color: #1a1a1a;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.prose :deep(a) {
  color: #ff9800;
  transition: color 0.2s;
}

.prose :deep(a:hover) {
  color: white;
}

.prose :deep(blockquote) {
  border-left: 4px solid #ff9800;
  padding-left: 1rem;
  font-style: italic;
  color: rgb(156, 163, 175);
  margin: 1rem 0;
}

.prose :deep(img) {
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}
</style>