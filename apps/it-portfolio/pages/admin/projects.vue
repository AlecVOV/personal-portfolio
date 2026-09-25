<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Projects</h1>
      <button
        @click="openCreate()"
        class="px-4 py-2 bg-orange-yellow text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        + Add Project
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-gray-400">Loading projects...</div>

    <!-- Projects Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="text-xs text-gray-400 uppercase border-b border-gray-700">
          <tr>
            <th class="px-4 py-3">Order</th>
            <th class="px-4 py-3">Image</th>
            <th class="px-4 py-3">Title</th>
            <th class="px-4 py-3">Categories</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="project in projects" :key="project.id" class="hover:bg-jet/50">
            <td class="px-4 py-3 text-gray-400">{{ project.sort_order }}</td>
            <td class="px-4 py-3">
              <img
                v-if="project.image_url"
                :src="getPublicUrl('projects', project.image_url)"
                class="w-16 h-12 object-cover rounded"
                :alt="project.title"
              />
              <span v-else class="text-gray-600">No image</span>
            </td>
            <td class="px-4 py-3 font-medium">{{ project.title }}</td>
            <td class="px-4 py-3">
              <span
                v-for="cat in project.categories"
                :key="cat"
                class="inline-block px-2 py-0.5 mr-1 mb-1 text-xs bg-gray-700 rounded"
              >
                {{ cat }}
              </span>
            </td>
            <td class="px-4 py-3 space-x-2">
              <button @click="openEdit(project)" class="text-blue-400 hover:text-blue-300">Edit</button>
              <button @click="confirmDelete(project)" class="text-red-400 hover:text-red-300">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        @click.self="showModal = false"
      >
        <div class="bg-gradient-jet rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold mb-4 text-center text-orange-yellow">
            {{ isEditing ? 'Edit Project' : 'New Project' }}
          </h2>

          <form @submit.prevent="handleSave" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Sort Order</label>
              <input v-model.number="form.sort_order" type="number" min="0"
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>

            <div>
              <label class="block text-sm text-gray-300 mb-1">Title *</label>
              <input v-model="form.title" required
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>

            <div>
              <label class="block text-sm text-gray-300 mb-1">Description *</label>
              <textarea v-model="form.description" required rows="3"
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-300 mb-1">GitHub URL *</label>
                <input v-model="form.github_url" type="url" required
                  class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Demo URL</label>
                <input v-model="form.demo_url" type="url"
                  class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
              </div>
            </div>

            <!-- Section selector -->
            <div>
              <label class="block text-sm text-gray-300 mb-1">Section</label>
              <div class="flex gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="projectSection" type="radio" value="Industry" class="accent-orange-yellow" />
                  <span class="text-md">Industry Project</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="projectSection" type="radio" value="Research" class="accent-aws-lime" />
                  <span class="text-md">Research Paper</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm text-gray-300 mb-1">Categories (comma-separated)</label>
              <input v-model="categoriesInput" placeholder="Machine Learning, Data Visualization"
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>

            <div>
              <label class="block text-sm text-gray-300 mb-1">Thumbnail Image</label>
              <!-- Toggle: Upload / Browse -->
              <div class="flex gap-2 mb-3">
                <button type="button" @click="imageMode = 'upload'"
                  class="px-3 py-1 text-sm rounded-lg transition-colors"
                  :class="imageMode === 'upload' ? 'bg-orange-yellow text-white' : 'bg-gray-700 text-gray-300 hover:text-white'"
                >Upload New</button>
                <button type="button" @click="imageMode = 'browse'; fetchBucketImages()"
                  class="px-3 py-1 text-sm rounded-lg transition-colors"
                  :class="imageMode === 'browse' ? 'bg-orange-yellow text-white' : 'bg-gray-700 text-gray-300 hover:text-white'"
                >Browse Bucket</button>
              </div>

              <!-- Upload mode -->
              <div v-if="imageMode === 'upload'">
                <input type="file" accept="image/*" @change="handleFileSelect"
                  class="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-yellow file:text-white hover:file:bg-orange-600" />
              </div>

              <!-- Browse mode -->
              <div v-else class="space-y-2">
                <div v-if="browsingBucket" class="text-gray-400 text-sm">Loading images...</div>
                <div v-else-if="bucketImages.length === 0" class="text-gray-500 text-sm">No images in bucket.</div>
                <div v-else class="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-jet rounded-lg">
                  <div v-for="img in bucketImages" :key="img.name"
                    @click="selectBucketImage(img.name)"
                    class="cursor-pointer rounded overflow-hidden border-2 transition-colors"
                    :class="selectedExistingPath === img.name ? 'border-orange-yellow' : 'border-transparent hover:border-gray-500'"
                  >
                    <img :src="getPublicUrl('projects', img.name)" :alt="img.name"
                      class="w-full h-16 object-cover" loading="lazy" />
                    <p class="text-xs text-gray-400 truncate px-1 py-0.5">{{ img.name }}</p>
                  </div>
                </div>
                <button v-if="selectedExistingPath" type="button" @click="clearSelection"
                  class="text-xs text-red-400 hover:text-red-300">Clear selection</button>
              </div>

              <!-- Preview -->
              <img
                v-if="previewUrl"
                :src="previewUrl"
                class="mt-2 w-32 h-24 object-cover rounded"
                alt="Preview"
              />
            </div>

            

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="showModal = false"
                class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="saving"
                class="px-4 py-2 bg-orange-yellow rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

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
import type { Project } from '~/types/portfolio'

definePageMeta({
  middleware: ['admin-auth'],
  layout: 'admin',
})

const { create, update, remove } = useAdminCrud<Project>('projects')
const { uploadFile, deleteFile } = useStorageUpload()
const { getPublicUrl } = useSupabaseData()
const client = useSupabaseClient()

// ── State ──────────────────────────────────────────
const projects = ref<Project[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

// ── Confirm dialog ────────────────────────────────
const confirmDialog = reactive({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  variant: 'danger' as 'primary' | 'danger',
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

const form = reactive({
  title: '',
  description: '',
  github_url: '',
  demo_url: '',
  sort_order: 0,
})
const categoriesInput = ref('')
const projectSection = ref<'Industry' | 'Research'>('Industry')
const selectedFile = ref<File | null>(null)
const selectedExistingPath = ref<string | null>(null)
const previewUrl = ref<string | null>(null)
const imageMode = ref<'upload' | 'browse'>('upload')
const bucketImages = ref<{ name: string }[]>([])
const browsingBucket = ref(false)

// ── Load Data ──────────────────────────────────────
const loadProjects = async () => {
  loading.value = true
  const { data, error } = await client
    .from('projects')
    .select('*, project_categories(category)')
    .order('sort_order')

  if (!error && data) {
    projects.value = data.map((p: any) => ({
      ...p,
      categories: p.project_categories?.map((pc: any) => pc.category) ?? [],
    }))
  }
  loading.value = false
}

await loadProjects()

// ── Modal Helpers ──────────────────────────────────
const resetForm = () => {
  form.title = ''
  form.description = ''
  form.github_url = ''
  form.demo_url = ''
  form.sort_order = 0
  categoriesInput.value = ''
  projectSection.value = 'Industry'
  selectedFile.value = null
  selectedExistingPath.value = null
  previewUrl.value = null
  imageMode.value = 'upload'
  bucketImages.value = []
  editingId.value = null
}

const openCreate = () => {
  resetForm()
  isEditing.value = false
  showModal.value = true
}

const openEdit = (project: Project) => {
  isEditing.value = true
  editingId.value = project.id
  form.title = project.title
  form.description = project.description
  form.github_url = project.github_url
  form.demo_url = project.demo_url ?? ''
  form.sort_order = project.sort_order
  // Detect section from existing categories
  projectSection.value = (project.categories ?? []).includes('Research Paper') ? 'Research' : 'Industry'
  // Hide "Research Paper" from the visible categories input
  categoriesInput.value = (project.categories ?? []).filter(c => c !== 'Research Paper').join(', ')
  previewUrl.value = project.image_url ? getPublicUrl('projects', project.image_url) : null
  showModal.value = true
}

// ── File Handling ──────────────────────────────────
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  selectedFile.value = file
  selectedExistingPath.value = null
  previewUrl.value = URL.createObjectURL(file)
}

// ── Bucket Browsing ────────────────────────────────
const fetchBucketImages = async () => {
  browsingBucket.value = true
  const { data, error } = await client.storage.from('projects').list()
  if (!error && data) {
    bucketImages.value = data.filter(f => f.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i))
  }
  browsingBucket.value = false
}

const selectBucketImage = (name: string) => {
  selectedExistingPath.value = name
  selectedFile.value = null
  previewUrl.value = getPublicUrl('projects', name)
}

const clearSelection = () => {
  selectedExistingPath.value = null
  previewUrl.value = null
}

// ── Save (Create or Update) ────────────────────────
const handleSave = async () => {
  saving.value = true
  try {
    let imageUrl: string | undefined

    if (selectedFile.value) {
      const timestamp = Date.now()
      const safeName = selectedFile.value.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `${timestamp}-${safeName}`
      await uploadFile('projects', filePath, selectedFile.value)
      imageUrl = filePath
    } else if (selectedExistingPath.value) {
      imageUrl = selectedExistingPath.value
    }

    const record: Record<string, any> = {
      title: form.title,
      description: form.description,
      github_url: form.github_url,
      demo_url: form.demo_url || null,
      sort_order: form.sort_order,
    }
    if (imageUrl) record.image_url = imageUrl

    let projectId: string

    if (isEditing.value && editingId.value) {
      await update(editingId.value, record)
      projectId = editingId.value
    } else {
      const created = await create(record)
      projectId = created.id
    }

    // Sync categories — inject Research Paper if selected
    await client.from('project_categories').delete().eq('project_id', projectId)

    const categories = categoriesInput.value
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)

    // Secretly add "Research Paper" if that section is selected
    if (projectSection.value === 'Research' && !categories.includes('Research Paper')) {
      categories.push('Research Paper')
    }

    if (categories.length > 0) {
      await client.from('project_categories').insert(
        categories.map(category => ({ project_id: projectId, category }))
      )
    }

    showModal.value = false
    await loadProjects()
  } catch (err) {
    console.error('Save error:', err)
    alert('Failed to save project. Check the console for details.')
  } finally {
    saving.value = false
  }
}

// ── Delete ─────────────────────────────────────────
const confirmDelete = (project: Project) => {
  showConfirm(
    'Delete Project',
    `Delete "${project.title}"? This cannot be undone.`,
    'danger',
    async () => {
      confirmDialog.open = false
      try {
        if (project.image_url) {
          await deleteFile('projects', project.image_url)
        }
        await remove(project.id)
        await loadProjects()
      } catch (err) {
        console.error('Delete error:', err)
        alert('Failed to delete project.')
      }
    }
  )
}
</script>
