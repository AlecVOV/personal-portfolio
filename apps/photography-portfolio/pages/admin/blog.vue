<template>
  <div>
    <div class="px-4 sm:px-0 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-serif font-bold text-gray-900 dark:text-white">Blog Posts</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your blog posts
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="btn-primary"
      >
        New Post
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="mt-6 border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            activeTab === tab.value
              ? 'border-accent-500 text-accent-600 dark:text-accent-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Posts List -->
    <div class="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul v-if="filteredPosts.length" class="divide-y divide-gray-200 dark:divide-gray-700">
        <li v-for="post in filteredPosts" :key="post.id">
          <div class="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white truncate">
                  {{ post.title }}
                </h3>
                <div class="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span v-if="post.categories">{{ post.categories.name }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ formatDate(post.created_at) }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ post.views || 0 }} views</span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <!-- Status Badge -->
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    post.status === 'hidden' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  ]"
                >
                  {{ post.status }}
                </span>

                <!-- Actions -->
                <button
                  @click="editPost(post)"
                  class="text-accent-600 hover:text-accent-900 dark:text-accent-400 dark:hover:text-accent-300"
                >
                  Edit
                </button>
                
                <button
                  v-if="post.status === 'published'"
                  @click="toggleStatus(post.id, 'hidden')"
                  class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                >
                  Hide
                </button>
                
                <button
                  v-if="post.status === 'hidden'"
                  @click="toggleStatus(post.id, 'published')"
                  class="text-green-600 hover:text-green-900 dark:text-green-400"
                >
                  Publish
                </button>
                
                <button
                  v-if="post.status !== 'deleted'"
                  @click="deletePost(post.id)"
                  class="text-red-600 hover:text-red-900 dark:text-red-400"
                >
                  Delete
                </button>

                <button
                  v-if="post.status === 'deleted'"
                  @click="toggleStatus(post.id, 'published')"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                >
                  Restore
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <div v-else class="px-4 py-12 text-center">
        <p class="text-gray-500 dark:text-gray-400">No posts found</p>
      </div>
    </div>

    <!-- Editor Modal -->
    <AdminBlogEditor
      v-if="showEditor"
      :post="selectedPost"
      :categories="categories"
      @close="closeEditor"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const posts = ref([])
const categories = ref([])
const showEditor = ref(false)
const selectedPost = ref(null)
const activeTab = ref('all')

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Hidden', value: 'hidden' },
  { label: 'Deleted', value: 'deleted' }
]

const filteredPosts = computed(() => {
  if (activeTab.value === 'all') return posts.value
  return posts.value.filter(post => post.status === activeTab.value)
})

const fetchPosts = async () => {
  const data = await $fetch('/api/blog')
  posts.value = data
}

const fetchCategories = async () => {
  const data = await $fetch('/api/categories')
  categories.value = data
}

const openCreateModal = () => {
  selectedPost.value = null
  showEditor.value = true
}

const editPost = (post) => {
  selectedPost.value = post
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
  selectedPost.value = null
}

const handleSave = async () => {
  await fetchPosts()
  closeEditor()
}

const toggleStatus = async (id, status) => {
  await $fetch(`/api/blog/${id}/toggle-status`, {
    method: 'PUT',
    body: { status }
  })
  await fetchPosts()
}

const deletePost = async (id) => {
  if (confirm('This post will be hidden for 30 days before permanent deletion. Continue?')) {
    await $fetch(`/api/blog/${id}`, { method: 'DELETE' })
    await fetchPosts()
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchPosts()
  fetchCategories()
})
</script>