<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Certifications</h1>
      <button @click="openCreate"
        class="px-4 py-2 bg-orange-yellow text-white rounded-lg hover:bg-orange-600 transition-colors">
        + Add Certification
      </button>
    </div>

    <div v-if="loading" class="text-gray-400">Loading certifications...</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="text-xs text-gray-400 uppercase border-b border-gray-700">
          <tr>
            <th class="px-4 py-3">Order</th>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Issuer</th>
            <th class="px-4 py-3">Date</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="item in items" :key="item.id" class="hover:bg-jet/50">
            <td class="px-4 py-3 text-gray-400">{{ item.sort_order }}</td>
            <td class="px-4 py-3 font-medium">{{ item.name }}</td>
            <td class="px-4 py-3 text-gray-300">{{ item.issuer }}</td>
            <td class="px-4 py-3 text-gray-400">{{ item.date }}</td>
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
          <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Certification' : 'New Certification' }}</h2>

          <form @submit.prevent="handleSave" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Name *</label>
              <input v-model="form.name" required
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Issuer *</label>
              <input v-model="form.issuer" required
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-300 mb-1">Date *</label>
                <input v-model="form.date" required placeholder="e.g. March 2025"
                  class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Sort Order</label>
                <input v-model.number="form.sort_order" type="number" min="0"
                  class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Certification URL</label>
              <input v-model="form.link"
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Badge URL</label>
              <input v-model="form.badge_url"
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
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
import type { Certification } from '~/types/portfolio'

definePageMeta({ middleware: ['admin-auth'], layout: 'admin' })

const { getAll, create, update, remove } = useAdminCrud<Certification>('certifications')

const items = ref<Certification[]>([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)

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
  name: '',
  issuer: '',
  date: '',
  link: '',
  badge_url: '',
  sort_order: 0,
})

const load = async () => {
  loading.value = true
  items.value = await getAll()
  loading.value = false
}

await load()

const resetForm = () => {
  form.name = ''
  form.issuer = ''
  form.date = ''
  form.link = ''
  form.badge_url = ''
  form.sort_order = 0
  editingId.value = null
}

const openCreate = () => {
  resetForm()
  isEditing.value = false
  showModal.value = true
}

const openEdit = (item: Certification) => {
  isEditing.value = true
  editingId.value = item.id
  form.name = item.name
  form.issuer = item.issuer
  form.date = item.date
  form.link = item.link
  form.badge_url = item.badge_url ?? ''
  form.sort_order = item.sort_order
  showModal.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    const record = { ...form, link: form.link || null, badge_url: form.badge_url || null }
    if (isEditing.value && editingId.value) {
      await update(editingId.value, record)
    } else {
      await create(record)
    }
    showModal.value = false
    await load()
  } catch (err) {
    console.error('Save error:', err)
    alert('Failed to save certification.')
  } finally {
    saving.value = false
  }
}

const handleDelete = (item: Certification) => {
  showConfirm(
    'Delete Certification',
    `Delete "${item.name}"? This cannot be undone.`,
    'danger',
    async () => {
      confirmDialog.open = false
      try {
        await remove(item.id)
        await load()
      } catch (err) {
        console.error('Delete error:', err)
        alert('Failed to delete certification.')
      }
    }
  )
}
</script>
