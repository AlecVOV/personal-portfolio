<template>
  <div class="flex justify-center gap-3 sm:gap-4">
    <a 
      v-for="link in socialLinks"
      :key="link.id"
      :href="link.url" 
      target="_blank" 
      rel="noopener noreferrer"
      class="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg flex items-center justify-center hover:from-orange-yellow hover:to-orange-600 transition-all duration-300"
      :aria-label="link.platform"
    >
      <component :is="iconMap[link.icon_name ?? '']" class="w-5 h-5 text-white" />
    </a>

    <!-- Resume (from profile) -->
    <a 
      v-if="resumeSrc"
      :href="resumeSrc"
      target="_blank"
      rel="noopener noreferrer"
      class="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg flex items-center justify-center hover:from-orange-yellow hover:to-orange-600 transition-all duration-300"
      aria-label="Resume"
    >
      <IconResume class="w-5 h-5 text-white" />
    </a>

    <!-- CV (from profile) -->
    <a 
      v-if="cvSrc"
      :href="cvSrc"
      target="_blank"
      rel="noopener noreferrer"
      class="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg flex items-center justify-center hover:from-orange-yellow hover:to-orange-600 transition-all duration-300"
      aria-label="CV"
    >
      <IconCV class="w-5 h-5 text-white" />
    </a>
  </div>
</template>

<script setup lang="ts">
import type { SocialLink, Profile } from '~/types/portfolio'
import type { Component } from 'vue'
import IconLinkedin from '~/components/IconLinkedin.vue'
import IconPhotography from '~/components/IconPhotography.vue'
import IconResume from '~/components/IconResume.vue'
import IconCV from '~/components/IconCV.vue'
import IconGithub from '~/components/IconGithub.vue'

const props = defineProps<{
  socialLinks?: SocialLink[]
  profile?: Profile | null
}>()

const { getPublicUrl } = useSiteData()

const resumeSrc = computed(() => {
  if (!props.profile?.resume_url) return null
  if (props.profile.resume_url.startsWith('http')) return props.profile.resume_url
  return getPublicUrl('resumes', props.profile.resume_url)
})

const cvSrc = computed(() => {
  if (!props.profile?.cv_url) return null
  if (props.profile.cv_url.startsWith('http')) return props.profile.cv_url
  return getPublicUrl('cv', props.profile.cv_url)
})

const iconMap: Record<string, Component> = {
  IconLinkedin,
  IconPhotography,
  IconResume,
  IconCV,
  IconGithub,
}
</script>
