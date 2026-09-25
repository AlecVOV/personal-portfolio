<template>
  <div class="space-y-3 sm:space-y-4">
    <div class="flex items-center gap-3 text-gray-300">
      <div class="flex-shrink-0 w-8 h-8 bg-gradient-orange-yellow rounded-lg flex items-center justify-center">
        <IconMail class="w-4 h-4 text-white" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs text-gray-400 mb-1">Gmail</p>
        <a 
          :href="`mailto:${profile?.email_2 ?? 'lhtthong.forwork@gmail.com'}`" 
          class="text-sm hover:text-orange-yellow transition-colors break-all"
        >
          {{ profile?.email_2 ?? 'lhtthong.forwork@gmail.com' }}
        </a>
        <p class="text-xs text-gray-400 mb-1 mt-2">Outlook</p>
        <a 
          :href="`mailto:${profile?.email_1 ?? 'lhtthong.forwork@outlook.com'}`" 
          class="text-sm hover:text-orange-yellow transition-colors break-all"
        >
          {{ profile?.email_1 ?? 'lhtthong.forwork@outlook.com' }}
        </a>
      </div>
    </div>

    <div class="flex items-center gap-3 text-gray-300">
      <div class="flex-shrink-0 w-8 h-8 bg-gradient-orange-yellow rounded-lg flex items-center justify-center">
        <IconPhone class="w-4 h-4 text-white" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs text-gray-400 mb-1">Phone</p>
        <a 
          :href="`tel:${profile?.phone ?? '+84947685335'}`" 
          class="text-sm hover:text-orange-yellow transition-colors"
        >
          {{ profile?.phone ?? '+84 947 685 335' }}
        </a>
      </div>
    </div>

    <div class="flex items-center gap-3 text-gray-300">
      <div class="flex-shrink-0 w-8 h-8 bg-gradient-orange-yellow rounded-lg flex items-center justify-center">
        <IconLocation class="w-4 h-4 text-white" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs text-gray-400 mb-1">Location</p>
        <p class="text-sm">{{ profile?.location ?? 'Phu Thanh Ward, Ho Chi Minh City' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Profile } from '~/types/portfolio'

defineProps<{
  profile?: Profile | null
}>()
</script>
