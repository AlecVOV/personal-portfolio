<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Blog Posts</h1>
      <button @click="openCreate"
        class="px-4 py-2 bg-orange-yellow text-white rounded-lg hover:bg-orange-600 transition-colors">
        + New Post
      </button>
    </div>

    <div v-if="loading" class="text-gray-400">Loading blog posts...</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="text-xs text-gray-400 uppercase border-b border-gray-700">
          <tr>
            <th class="px-4 py-3">Title</th>
            <th class="px-4 py-3">Category</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="item in items" :key="item.id" class="hover:bg-jet/50">
            <td class="px-4 py-3 font-medium">{{ item.title }}</td>
            <td class="px-4 py-3 text-gray-300">{{ item.category ?? '—' }}</td>
            <td class="px-4 py-3">
              <span :class="item.published ? 'text-green-400' : 'text-yellow-400'">
                {{ item.published ? 'Published' : 'Draft' }}
              </span>
              <span v-if="item.published_at" class="text-gray-500 text-xs ml-2">
                {{ new Date(item.published_at).toLocaleDateString() }}
              </span>
            </td>
            <td class="px-4 py-3 space-x-2">
              <button v-if="!item.published" @click="handlePublish(item)" class="text-green-400 hover:text-green-300">Publish</button>
              <button v-else @click="handleUnpublish(item)" class="text-yellow-400 hover:text-yellow-300">Unpublish</button>
              <button @click="openEdit(item)" class="text-blue-400 hover:text-blue-300">Edit</button>
              <button @click="handleDelete(item)" class="text-red-400 hover:text-red-300">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        @click.self="showModal = false">
        <div class="bg-gradient-jet rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Post' : 'New Post' }}</h2>

          <form @submit.prevent="handleSave" class="space-y-4">
            <!-- Title + Slug -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-300 mb-1">Title *</label>
                <input v-model="form.title" required @input="autoSlug"
                  class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Slug *</label>
                <input v-model="form.slug" required
                  class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
              </div>
            </div>

            <!-- Excerpt -->
            <div>
              <label class="block text-sm text-gray-300 mb-1">Excerpt</label>
              <input v-model="form.excerpt"
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>

            <!-- Category + Publish Date -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-300 mb-1">Category</label>
                <input v-model="form.category" placeholder="e.g. Tutorial"
                  class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Publish Date</label>
                <input v-model="form.published_at" type="date"
                  class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
              </div>
            </div>

            <!-- Cover Image — own dedicated section -->
            <div>
              <label class="block text-sm text-gray-300 mb-1">Cover Image</label>
              <div class="flex gap-2 mb-2">
                <button type="button" @click="imageMode = 'upload'"
                  class="px-3 py-1 text-sm rounded-lg transition-colors"
                  :class="imageMode === 'upload' ? 'bg-orange-yellow text-white' : 'bg-gray-700 text-gray-300 hover:text-white'"
                >Upload</button>
                <button type="button" @click="imageMode = 'browse'; fetchBlogImages()"
                  class="px-3 py-1 text-sm rounded-lg transition-colors"
                  :class="imageMode === 'browse' ? 'bg-orange-yellow text-white' : 'bg-gray-700 text-gray-300 hover:text-white'"
                >Browse</button>
              </div>
              <div v-if="imageMode === 'upload'">
                <input type="file" accept="image/*" @change="handleFileSelect"
                  class="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-yellow file:text-white hover:file:bg-orange-600" />
              </div>
              <div v-else class="space-y-1">
                <div v-if="browsingBlog" class="text-gray-400 text-sm">Loading images...</div>
                <div v-else-if="blogImages.length === 0" class="text-gray-500 text-sm">No images in bucket.</div>
                <div v-else class="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto p-3 bg-jet rounded-lg">
                  <div v-for="img in blogImages" :key="img.name"
                    @click="selectBlogImage(img.name)"
                    class="cursor-pointer rounded-lg overflow-hidden border-2 transition-colors"
                    :class="selectedBlogPath === img.name ? 'border-orange-yellow' : 'border-transparent hover:border-gray-500'"
                  >
                    <img :src="getBlogImageUrl(img.name)" :alt="img.name"
                      class="w-full h-20 object-cover" loading="lazy" />
                    <p class="text-xs text-gray-400 truncate px-2 py-1">{{ img.name }}</p>
                  </div>
                </div>
                <button v-if="selectedBlogPath" type="button" @click="clearBlogSelection"
                  class="text-sm text-red-400 hover:text-red-300">Clear selection</button>
              </div>
              <img v-if="coverPreview" :src="coverPreview" class="mt-3 w-48 h-32 object-cover rounded-lg" alt="Cover preview" />
            </div>

            <!-- Content (Markdown) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-sm text-gray-300">Content (Markdown) *</label>
                <button type="button" @click="imageMode = 'browse'; insertMode = true; fetchBlogImages()"
                  class="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                  + Insert Image
                </button>
              </div>
              <!-- Insert image picker -->
              <div v-if="insertMode && imageMode === 'browse'" class="mb-2 space-y-1">
                <div v-if="browsingBlog" class="text-gray-400 text-sm">Loading images...</div>
                <div v-else-if="blogImages.length === 0" class="text-gray-500 text-sm">No images in bucket.</div>
                <div v-else class="grid grid-cols-6 gap-3 max-h-48 overflow-y-auto p-3 bg-jet rounded-lg">
                  <div v-for="img in blogImages" :key="img.name"
                    @click="insertBlogImage(img.name)"
                    class="cursor-pointer rounded-lg overflow-hidden border border-transparent hover:border-orange-yellow transition-colors"
                  >
                    <img :src="getBlogImageUrl(img.name)" :alt="img.name"
                      class="w-full h-16 object-cover" loading="lazy" />
                    <p class="text-xs text-gray-400 truncate px-2 py-1">{{ img.name }}</p>
                  </div>
                </div>
                <button type="button" @click="insertMode = false"
                  class="text-sm text-red-400 hover:text-red-300">Close</button>
              </div>
              <textarea v-model="form.content" required rows="16"
                class="w-full px-4 py-3 bg-jet rounded-lg text-white font-mono text-sm leading-relaxed focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>

            <!-- Buttons -->
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="showModal = false"
                class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
              <button type="submit" :disabled="saving"
                class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50">
                {{ saving ? 'Saving...' : 'Save Draft' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Confirm Dialogs -->
    <ConfirmDialog
      :open="confirmDialog.open"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-label="confirmDialog.confirmLabel"
      :variant="confirmDialog.variant"
      @confirm="confirmDialog.onConfirm"
      @cancel="confirmDialog.open = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { BlogPostDB } from '~/types/portfolio'

definePageMeta({ middleware: ['admin-auth'], layout: 'admin' })

const { getAll, create, update, remove } = useAdminCrud<BlogPostDB>('blog_posts')
const { uploadFile, deleteFile } = useStorageUpload()
const { getPublicUrl } = useSupabaseData()
const client = useSupabaseClient()

const items = ref<BlogPostDB[]>([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const selectedFile = ref<File | null>(null)

// ── Bucket browsing ────────────────────────────────
const imageMode = ref<'upload' | 'browse'>('upload')
const blogImages = ref<{ name: string }[]>([])
const browsingBlog = ref(false)
const selectedBlogPath = ref<string | null>(null)
const coverPreview = ref<string | null>(null)
const insertMode = ref(false)

// ── Confirm dialog state ───────────────────────────
const confirmDialog = reactive({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  variant: 'primary' as 'primary' | 'danger',
  onConfirm: () => {},
})

const showConfirm = (title: string, message: string, variant: 'primary' | 'danger', onConfirm: () => void) => {
  confirmDialog.title = title
  confirmDialog.message = message
  confirmDialog.variant = variant
  confirmDialog.confirmLabel = variant === 'danger' ? 'Delete' : 'Confirm'
  confirmDialog.onConfirm = onConfirm
  confirmDialog.open = true
}

const getBlogImageUrl = (name: string) => getPublicUrl('blog-images', name)

const fetchBlogImages = async () => {
  browsingBlog.value = true
  const { data, error } = await client.storage.from('blog-images').list()
  if (!error && data) {
    blogImages.value = data.filter(f => f.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i))
  }
  browsingBlog.value = false
}

const selectBlogImage = (name: string) => {
  selectedBlogPath.value = name
  selectedFile.value = null
  coverPreview.value = getBlogImageUrl(name)
}

const clearBlogSelection = () => {
  selectedBlogPath.value = null
  coverPreview.value = null
}

const insertBlogImage = (name: string) => {
  const url = getBlogImageUrl(name)
  const md = `![${name}](${url})`
  form.content += `\n${md}\n`
  insertMode.value = false
}

const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  published_at: '',
})

const load = async () => {
  loading.value = true
  items.value = await getAll('created_at')
  loading.value = false
}

await load()

const autoSlug = () => {
  if (!isEditing.value) {
    form.slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
}

const resetForm = () => {
  form.title = ''
  form.slug = ''
  form.excerpt = ''
  form.content = ''
  form.category = ''
  form.published_at = ''
  selectedFile.value = null
  selectedBlogPath.value = null
  coverPreview.value = null
  imageMode.value = 'upload'
  insertMode.value = false
  editingId.value = null
}

const openCreate = () => {
  resetForm()
  isEditing.value = false
  showModal.value = true
}

const openEdit = (item: BlogPostDB) => {
  isEditing.value = true
  editingId.value = item.id
  form.title = item.title
  form.slug = item.slug
  form.excerpt = item.excerpt ?? ''
  form.content = item.content
  form.category = item.category ?? ''
  form.published_at = item.published_at ? item.published_at.split('T')[0] : ''
  selectedFile.value = null
  selectedBlogPath.value = null
  coverPreview.value = item.image_url ? getBlogImageUrl(item.image_url) : null
  imageMode.value = 'upload'
  insertMode.value = false
  showModal.value = true
}

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  selectedFile.value = file
  selectedBlogPath.value = null
  coverPreview.value = URL.createObjectURL(file)
}

const handleSave = async () => {
  saving.value = true
  try {
    let imageUrl: string | undefined

    if (selectedFile.value) {
      const timestamp = Date.now()
      const safeName = selectedFile.value.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `${timestamp}-${safeName}`
      await uploadFile('blog-images', filePath, selectedFile.value)
      imageUrl = filePath
    } else if (selectedBlogPath.value) {
      imageUrl = selectedBlogPath.value
    }

    const record: Record<string, any> = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content,
      category: form.category || null,
      published: false,
      published_at: null,
    }
    if (imageUrl) record.image_url = imageUrl

    if (isEditing.value && editingId.value) {
      await update(editingId.value, record)
    } else {
      await create(record)
    }

    showModal.value = false
    await load()
  } catch (err) {
    console.error('Save error:', err)
    alert('Failed to save blog post.')
  } finally {
    saving.value = false
  }
}

const handlePublish = (item: BlogPostDB) => {
  showConfirm(
    'Publish Post',
    `Publish "${item.title}"? It will be visible to all visitors.`,
    'primary',
    async () => {
      confirmDialog.open = false
      try {
        await update(item.id, {
          published: true,
          published_at: new Date().toISOString(),
        })
        await load()
      } catch (err) {
        console.error('Publish error:', err)
        alert('Failed to publish.')
      }
    }
  )
}

const handleUnpublish = (item: BlogPostDB) => {
  showConfirm(
    'Unpublish Post',
    `Move "${item.title}" back to draft? It will be hidden from visitors.`,
    'primary',
    async () => {
      confirmDialog.open = false
      try {
        await update(item.id, {
          published: false,
          published_at: null,
        })
        await load()
      } catch (err) {
        console.error('Unpublish error:', err)
        alert('Failed to unpublish.')
      }
    }
  )
}

const handleDelete = (item: BlogPostDB) => {
  showConfirm(
    'Delete Post',
    `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
    'danger',
    async () => {
      confirmDialog.open = false
      try {
        if (item.image_url) {
          await deleteFile('blog-images', item.image_url)
        }
        await remove(item.id)
        await load()
      } catch (err) {
        console.error('Delete error:', err)
        alert('Failed to delete blog post.')
      }
    }
  )
}
</script>
