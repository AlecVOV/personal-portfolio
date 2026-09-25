<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Social Links</h1>
      <button @click="openCreate"
        class="px-4 py-2 bg-orange-yellow text-white rounded-lg hover:bg-orange-600 transition-colors">
        + Add Link
      </button>
    </div>

    <div v-if="loading" class="text-gray-400">Loading social links...</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="text-xs text-gray-400 uppercase border-b border-gray-700">
          <tr>
            <th class="px-4 py-3">Order</th>
            <th class="px-4 py-3">Platform</th>
            <th class="px-4 py-3">Icon Name</th>
            <th class="px-4 py-3">URL</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="item in items" :key="item.id" class="hover:bg-jet/50">
            <td class="px-4 py-3 text-gray-400">{{ item.sort_order }}</td>
            <td class="px-4 py-3 font-medium">{{ item.platform }}</td>
            <td class="px-4 py-3 text-gray-300">{{ item.icon_name ?? '—' }}</td>
            <td class="px-4 py-3 text-gray-400 truncate max-w-xs">
              <a :href="item.url" target="_blank" class="text-blue-400 hover:underline">{{ item.url }}</a>
            </td>
            <td class="px-4 py-3 space-x-2">
              <button @click="openEdit(item)" class="text-blue-400 hover:text-blue-300">Edit</button>
              <button @click="handleDelete(item)" class="text-red-400 hover:text-red-300">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        @click.self="showModal = false">
        <div class="bg-gradient-jet rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Social Link' : 'New Social Link' }}</h2>

          <form @submit.prevent="handleSave" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Platform *</label>
              <input v-model="form.platform" required placeholder="e.g. LinkedIn"
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">URL *</label>
              <input v-model="form.url" type="url" required
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-300 mb-1">Icon Name</label>
                <input v-model="form.icon_name" placeholder="e.g. IconLinkedin, IconGithub, IconPhotography"
                  class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
                <p class="text-xs text-gray-500 mt-1">Available: IconLinkedin, IconGithub, IconPhotography, IconResume, IconCV</p>
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Sort Order</label>
                <input v-model.number="form.sort_order" type="number" min="0"
                  class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="showModal = false"
                class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
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
import type { SocialLink } from '~/types/portfolio'

definePageMeta({ middleware: ['admin-auth'], layout: 'admin' })

const { getAll, create, update, remove } = useAdminCrud<SocialLink>('social_links')

const items = ref<SocialLink[]>([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)

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
  platform: '',
  url: '',
  icon_name: '',
  sort_order: 0,
})

const load = async () => {
  loading.value = true
  items.value = await getAll()
  loading.value = false
}

await load()

const resetForm = () => {
  form.platform = ''
  form.url = ''
  form.icon_name = ''
  form.sort_order = 0
  editingId.value = null
}

const openCreate = () => {
  resetForm()
  isEditing.value = false
  showModal.value = true
}

const openEdit = (item: SocialLink) => {
  isEditing.value = true
  editingId.value = item.id
  form.platform = item.platform
  form.url = item.url
  form.icon_name = item.icon_name ?? ''
  form.sort_order = item.sort_order
  showModal.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    const record = { ...form, icon_name: form.icon_name || null }
    if (isEditing.value && editingId.value) {
      await update(editingId.value, record)
    } else {
      await create(record)
    }
    showModal.value = false
    await load()
  } catch (err) {
    console.error('Save error:', err)
    alert('Failed to save social link.')
  } finally {
    saving.value = false
  }
}

const handleDelete = (item: SocialLink) => {
  showConfirm(
    'Delete Social Link',
    `Delete "${item.platform}"? This cannot be undone.`,
    'danger',
    async () => {
      confirmDialog.open = false
      try {
        await remove(item.id)
        await load()
      } catch (err) {
        console.error('Delete error:', err)
        alert('Failed to delete social link.')
      }
    }
  )
}
</script>
