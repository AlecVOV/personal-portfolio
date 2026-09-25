<template>
  <div>
    <div class="px-4 sm:px-0 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-serif font-bold text-gray-900 dark:text-white">Portfolio Items</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your portfolio gallery
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="btn-primary"
      >
        New Portfolio Item
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

    <!-- Portfolio Grid -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden group"
      >
        <div class="aspect-[3/4] relative overflow-hidden">
          <img
            :src="item.image"
            :alt="item.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
              <button
                @click="editItem(item)"
                class="p-2 bg-white rounded-full hover:bg-gray-100"
              >
                <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                @click="deleteItem(item.id)"
                class="p-2 bg-white rounded-full hover:bg-gray-100"
              >
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{ item.title }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">{{ item.category }}</p>
          <div class="mt-2 flex items-center justify-between">
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                item.status === 'published' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              ]"
            >
              {{ item.status }}
            </span>
            <button
              @click="toggleStatus(item.id, item.status === 'published' ? 'hidden' : 'published')"
              class="text-sm text-accent-600 hover:text-accent-700 dark:text-accent-400"
            >
              {{ item.status === 'published' ? 'Hide' : 'Publish' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredItems.length === 0"
      class="mt-12 text-center"
    >
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No portfolio items</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new portfolio item.</p>
    </div>

    <!-- Editor Modal -->
    <AdminPortfolioEditor
      v-if="showEditor"
      :item="selectedItem"
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

const showEditor = ref(false)
const selectedItem = ref(null)
const activeTab = ref('all')
const items = ref([])
const categories = ref([])

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Hidden', value: 'hidden' }
]

const filteredItems = computed(() => {
  if (activeTab.value === 'all') return items.value
  return items.value.filter(item => item.status === activeTab.value)
})

const fetchItems = async () => {
  const data = await $fetch('/api/portfolio')
  items.value = data
}

const fetchCategories = async () => {
  const data = await $fetch('/api/categories')
  categories.value = data
}

const openCreateModal = () => {
  selectedItem.value = null
  showEditor.value = true
}

const editItem = (item) => {
  selectedItem.value = item
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
  selectedItem.value = null
}

const handleSave = async () => {
  await fetchItems()
  closeEditor()
}

const toggleStatus = async (id, status) => {
  await $fetch(`/api/portfolio/${id}`, {
    method: 'PUT',
    body: { status }
  })
  await fetchItems()
}

const deleteItem = async (id) => {
  if (confirm('Are you sure you want to delete this portfolio item?')) {
    await $fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
    await fetchItems()
  }
}

onMounted(() => {
  fetchItems()
  fetchCategories()
})
</script>