<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Profile</h1>

    <div v-if="loadingProfile" class="text-gray-400">Loading profile...</div>

    <form v-else @submit.prevent="handleSave" class="space-y-4 max-w-4xl mx-auto">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-300 mb-1">Full Name *</label>
          <input v-model="form.full_name" required
            class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-1">Title *</label>
          <input v-model="form.title" required
            class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
        </div>
      </div>

      <div>
        <label class="block text-sm text-gray-300 mb-1">Bio</label>
        <textarea v-model="form.bio" rows="10"
          class="w-full px-4 py-2 bg-jet rounded-lg text-white text-base leading-relaxed focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-300 mb-1">Email 1</label>
          <input v-model="form.email_1" type="email"
            class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-1">Email 2</label>
          <input v-model="form.email_2" type="email"
            class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-300 mb-1">Phone</label>
          <input v-model="form.phone"
            class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-1">Location</label>
          <input v-model="form.location"
            class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
        </div>
      </div>

      <div>
        <label class="block text-sm text-gray-300 mb-1">Map Embed URL</label>
        <input v-model="form.map_embed"
          class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <!-- Resume -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">Resume (PDF)</label>
          <div class="flex gap-2 mb-2">
            <button type="button" @click="resumeMode = 'upload'"
              class="px-3 py-1 text-xs rounded-lg transition-colors"
              :class="resumeMode === 'upload' ? 'bg-orange-yellow text-white' : 'bg-gray-700 text-gray-300 hover:text-white'"
            >Upload</button>
            <button type="button" @click="resumeMode = 'browse'; fetchBucketFiles('resumes', 'resume')"
              class="px-3 py-1 text-xs rounded-lg transition-colors"
              :class="resumeMode === 'browse' ? 'bg-orange-yellow text-white' : 'bg-gray-700 text-gray-300 hover:text-white'"
            >Browse</button>
          </div>
          <div v-if="resumeMode === 'upload'">
            <input type="file" accept=".pdf" @change="handleResumeSelect"
              class="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-yellow file:text-white hover:file:bg-orange-600" />
          </div>
          <div v-else class="space-y-1">
            <div v-if="browsingResume" class="text-gray-400 text-xs">Loading...</div>
            <div v-else-if="resumeFiles.length === 0" class="text-gray-500 text-xs">No files in bucket.</div>
            <select v-else v-model="selectedResumePath" @change="onResumeBucketSelect"
              class="w-full px-3 py-2 bg-jet rounded-lg text-white text-sm focus:ring-2 focus:ring-orange-yellow focus:outline-none">
              <option value="">— Select a file —</option>
              <option v-for="f in resumeFiles" :key="f.name" :value="f.name">{{ f.name }}</option>
            </select>
          </div>
          <p v-if="selectedResumePath" class="mt-1 text-xs text-green-400">
            Selected: {{ selectedResumePath }}
          </p>
          <p v-else-if="profile?.resume_url && !selectedResumePath" class="mt-1 text-xs text-gray-500">
            Current: {{ profile.resume_url }}
          </p>
        </div>
        <!-- CV -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">CV (PDF)</label>
          <div class="flex gap-2 mb-2">
            <button type="button" @click="cvMode = 'upload'"
              class="px-3 py-1 text-xs rounded-lg transition-colors"
              :class="cvMode === 'upload' ? 'bg-orange-yellow text-white' : 'bg-gray-700 text-gray-300 hover:text-white'"
            >Upload</button>
            <button type="button" @click="cvMode = 'browse'; fetchBucketFiles('cv', 'cv')"
              class="px-3 py-1 text-xs rounded-lg transition-colors"
              :class="cvMode === 'browse' ? 'bg-orange-yellow text-white' : 'bg-gray-700 text-gray-300 hover:text-white'"
            >Browse</button>
          </div>
          <div v-if="cvMode === 'upload'">
            <input type="file" accept=".pdf" @change="handleCvSelect"
              class="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-yellow file:text-white hover:file:bg-orange-600" />
          </div>
          <div v-else class="space-y-1">
            <div v-if="browsingCv" class="text-gray-400 text-xs">Loading...</div>
            <div v-else-if="cvFiles.length === 0" class="text-gray-500 text-xs">No files in bucket.</div>
            <select v-else v-model="selectedCvPath" @change="onCvBucketSelect"
              class="w-full px-3 py-2 bg-jet rounded-lg text-white text-sm focus:ring-2 focus:ring-orange-yellow focus:outline-none">
              <option value="">— Select a file —</option>
              <option v-for="f in cvFiles" :key="f.name" :value="f.name">{{ f.name }}</option>
            </select>
          </div>
          <p v-if="selectedCvPath" class="mt-1 text-xs text-green-400">
            Selected: {{ selectedCvPath }}
          </p>
          <p v-else-if="profile?.cv_url && !selectedCvPath" class="mt-1 text-xs text-gray-500">
            Current: {{ profile.cv_url }}
          </p>
        </div>
      </div>
      
      <!-- Avatar -->
      <div>
        <label class="block text-sm text-gray-300 mb-1">Avatar Image</label>
        <div class="flex gap-2 mb-2">
          <button type="button" @click="avatarMode = 'upload'"
            class="px-3 py-1 text-xs rounded-lg transition-colors"
            :class="avatarMode === 'upload' ? 'bg-orange-yellow text-white' : 'bg-gray-700 text-gray-300 hover:text-white'"
          >Upload</button>
          <button type="button" @click="avatarMode = 'browse'; fetchBucketFiles('avatars', 'avatar')"
            class="px-3 py-1 text-xs rounded-lg transition-colors"
            :class="avatarMode === 'browse' ? 'bg-orange-yellow text-white' : 'bg-gray-700 text-gray-300 hover:text-white'"
          >Browse</button>
        </div>
        <div v-if="avatarMode === 'upload'" class="flex items-center gap-4">
          <input type="file" accept="image/*" @change="handleAvatarSelect"
            class="text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-yellow file:text-white hover:file:bg-orange-600" />
          <img
            v-if="avatarPreview"
            :src="avatarPreview"
            class="w-40 h-40 object-cover rounded-full shrink-0 border-4 border-white"
            alt="Avatar preview"
          />
        </div>
        <div v-else class="space-y-2">
          <div v-if="browsingAvatar" class="text-gray-400 text-xs">Loading images...</div>
          <div v-else-if="avatarFiles.length === 0" class="text-gray-500 text-xs">No images in bucket.</div>
          <div v-else class="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-jet rounded-lg">
            <div v-for="img in avatarFiles" :key="img.name"
              @click="selectAvatarBucket(img.name)"
              class="cursor-pointer rounded overflow-hidden border-2 transition-colors"
              :class="selectedAvatarPath === img.name ? 'border-orange-yellow' : 'border-transparent hover:border-gray-500'"
            >
              <img :src="getPublicUrl('avatars', img.name)" :alt="img.name"
                class="w-full h-16 object-cover" loading="lazy" />
              <p class="text-xs text-gray-400 truncate px-1 py-0.5">{{ img.name }}</p>
            </div>
          </div>
          <div v-if="selectedAvatarPath" class="flex items-center gap-4">
            <img :src="avatarPreview!" class="w-40 h-40 object-cover rounded-full shrink-0 border-4 border-white" alt="Avatar preview" />
            <button type="button" @click="selectedAvatarPath = null; avatarPreview = null" class="text-xs text-red-400 hover:text-red-300">Clear</button>
          </div>
        </div>
      </div>



      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving"
          class="px-6 py-2 bg-orange-yellow rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
          {{ saving ? 'Saving...' : 'Save Profile' }}
        </button>
      </div>

      <p v-if="successMsg" class="text-green-400 text-sm">{{ successMsg }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Profile } from '~/types/portfolio'

definePageMeta({
  middleware: ['admin-auth'],
  layout: 'admin',
})

const client = useSupabaseClient()
const { uploadFile } = useStorageUpload()
const { getPublicUrl } = useSupabaseData()

const profile = ref<Profile | null>(null)
const loadingProfile = ref(true)
const saving = ref(false)
const successMsg = ref('')

// ── File state ─────────────────────────────────────
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const resumeFile = ref<File | null>(null)
const cvFile = ref<File | null>(null)

// ── Bucket browsing state ──────────────────────────
const avatarMode = ref<'upload' | 'browse'>('upload')
const resumeMode = ref<'upload' | 'browse'>('upload')
const cvMode = ref<'upload' | 'browse'>('upload')

const avatarFiles = ref<{ name: string }[]>([])
const resumeFiles = ref<{ name: string }[]>([])
const cvFiles = ref<{ name: string }[]>([])

const browsingAvatar = ref(false)
const browsingResume = ref(false)
const browsingCv = ref(false)

const selectedAvatarPath = ref<string | null>(null)
const selectedResumePath = ref<string | null>(null)
const selectedCvPath = ref<string | null>(null)

const filterFiles = (files: { name: string }[], exts: RegExp) =>
  files.filter(f => f.name.match(exts))

// ── Bucket fetch ───────────────────────────────────
const fetchBucketFiles = async (bucket: string, field: 'avatar' | 'resume' | 'cv') => {
  if (field === 'avatar') browsingAvatar.value = true
  else if (field === 'resume') browsingResume.value = true
  else browsingCv.value = true

  const { data, error } = await client.storage.from(bucket).list()
  if (!error && data) {
    if (field === 'avatar') avatarFiles.value = filterFiles(data, /\.(png|jpg|jpeg|gif|webp|svg)$/i)
    else if (field === 'resume') resumeFiles.value = filterFiles(data, /\.pdf$/i)
    else cvFiles.value = filterFiles(data, /\.pdf$/i)
  }

  if (field === 'avatar') browsingAvatar.value = false
  else if (field === 'resume') browsingResume.value = false
  else browsingCv.value = false
}

// ── Avatar bucket selection ────────────────────────
const selectAvatarBucket = (name: string) => {
  selectedAvatarPath.value = name
  avatarFile.value = null
  avatarPreview.value = getPublicUrl('avatars', name)
}

// ── Resume / CV bucket selection ───────────────────
const onResumeBucketSelect = () => {
  resumeFile.value = null
}
const onCvBucketSelect = () => {
  cvFile.value = null
}

// Load existing profile
const { data } = await client.from('profile').select('*').single()
if (data) profile.value = data as Profile
loadingProfile.value = false

const form = reactive({
  full_name: profile.value?.full_name ?? '',
  title: profile.value?.title ?? '',
  bio: profile.value?.bio ?? '',
  email_1: profile.value?.email_1 ?? '',
  email_2: profile.value?.email_2 ?? '',
  phone: profile.value?.phone ?? '',
  location: profile.value?.location ?? '',
  map_embed: profile.value?.map_embed ?? '',
})

// Set avatar preview if exists
if (profile.value?.avatar_url) {
  const { getPublicUrl } = useSupabaseData()
  avatarPreview.value = getPublicUrl('avatars', profile.value.avatar_url)
}

const handleAvatarSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

const handleResumeSelect = (event: Event) => {
  resumeFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

const handleCvSelect = (event: Event) => {
  cvFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

const handleSave = async () => {
  saving.value = true
  successMsg.value = ''
  try {
    const record: Record<string, any> = { ...form }

    if (avatarFile.value) {
      await uploadFile('avatars', 'avatar.webp', avatarFile.value)
      record.avatar_url = 'avatar.webp'
    } else if (selectedAvatarPath.value) {
      record.avatar_url = selectedAvatarPath.value
    }

    if (resumeFile.value) {
      await uploadFile('resumes', 'resume.pdf', resumeFile.value)
      record.resume_url = 'resume.pdf'
    } else if (selectedResumePath.value) {
      record.resume_url = selectedResumePath.value
    }

    if (cvFile.value) {
      await uploadFile('cv', 'cv.pdf', cvFile.value)
      record.cv_url = 'cv.pdf'
    } else if (selectedCvPath.value) {
      record.cv_url = selectedCvPath.value
    }

    if (profile.value) {
      await client.from('profile').update(record).eq('id', profile.value.id)
    } else {
      await client.from('profile').insert(record)
    }

    successMsg.value = 'Profile saved successfully!'
  } catch (err) {
    console.error(err)
    alert('Failed to save profile.')
  } finally {
    saving.value = false
  }
}
</script>
