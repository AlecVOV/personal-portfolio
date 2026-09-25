<template>
  <aside 
    class="fixed top-0 left-0 h-screen bg-gradient-onyx p-8 sm:p-6 transform transition-transform duration-300 overflow-hidden"
    :class="{ 
      '-translate-x-full': !isOpen,
      'w-[85vw] max-w-[325px]': true,
      'sm:w-72 md:w-96': true
    }"
  >
    <div class="flex flex-col items-center">
      <!-- Avatar and Basic Info -->
      <div class="relative w-24 h-24 sm:w-32 sm:h-32 mb-3 sm:mb-4 rounded-full overflow-hidden ring-4 ring-orange-yellow/20">
        <img 
          :src="avatarSrc"
          :alt="profile?.full_name ?? 'Le Hoang Triet Thong'"
          class="w-full h-full object-cover"
        />
      </div>
      
      <h1 class="text-xl sm:text-2xl font-semibold text-white mb-1">{{ profile?.full_name ?? 'Le Hoang Triet Thong' }}</h1>
      <p class="text-orange-yellow mb-4 sm:mb-6">{{ profile?.title ?? 'Machine Learning Engineer' }}</p>

      <!-- Show Contacts Toggle -->
      <button 
        @click="toggleContacts"
        class="w-full bg-gradient-to-r from-orange-yellow to-orange-600 hover:from-orange-600 hover:to-orange-yellow 
               text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 mb-4 sm:mb-6
               text-sm sm:text-base"
      >
        {{ showContacts ? 'Hide Contacts' : 'Show Contacts' }}
      </button>

      <!-- Contact Details -->
      <div 
        class="w-full transition-all duration-500 ease-in-out space-y-4 sm:space-y-6 text-sm sm:text-base"
        :class="showContacts ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0'"
      >
        <!-- Personal Info -->
        <ContactInfo :profile="profile" />

        <!-- Social Links -->
        <SocialLinks :social-links="socialLinks" :profile="profile" />

        <!-- Current Section Indicator -->
        <div class="mt-4 sm:mt-8 p-3 sm:p-4 bg-jet rounded-lg">
          <p class="text-xs sm:text-sm text-gray-400">Currently Viewing</p>
          <p class="text-base sm:text-lg text-orange-yellow font-medium">{{ currentSection }}</p>
        </div>
      </div>
    </div>
    
    <!-- Close button for mobile -->
    <button 
      @click="$emit('close-sidebar')"
      class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-jet hover:bg-gray-700 text-gray-300 hover:text-white md:hidden"
      aria-label="Close sidebar"
    >
      <span class="sr-only">Close</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
  </aside>
</template>

<script setup lang="ts">
import type { Profile, SocialLink } from '~/types/portfolio'

const props = defineProps<{
  isOpen: boolean
  currentSection: string
  profile?: Profile | null
  socialLinks?: SocialLink[]
}>()

defineEmits(['close-sidebar'])

const { getPublicUrl } = useSupabaseData()

const avatarSrc = computed(() => {
  if (!props.profile?.avatar_url) return '/my_image2.jpg'
  if (props.profile.avatar_url.startsWith('http')) return props.profile.avatar_url
  return getPublicUrl('avatars', props.profile.avatar_url)
})

const showContacts = ref(false)

const toggleContacts = () => {
  showContacts.value = !showContacts.value
}
</script>