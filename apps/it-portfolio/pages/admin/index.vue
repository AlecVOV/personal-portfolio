<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold">Dashboard</h1>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <NuxtLink
        v-for="stat in stats"
        :key="stat.label"
        :to="stat.link"
        class="p-6 bg-gradient-jet rounded-xl hover:ring-2 hover:ring-orange-yellow/50 transition-all"
      >
        <p class="text-3xl font-bold">{{ stat.count }}</p>
        <p class="text-gray-400 text-sm mt-1">{{ stat.label }}</p>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="p-6 bg-gradient-jet rounded-xl hover:ring-2 hover:ring-orange-yellow/50 transition-all"
      >
        <h3 class="text-lg font-semibold ">{{ item.label }}</h3>
        <p class="text-sm text-gray-200 mt-1">{{ item.description }}</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin-auth'],
  layout: 'admin',
})

const counts = await $fetch<Record<string, number>>('/api/admin/stats')

const stats = [
  { label: 'Projects', count: counts.projects ?? 0},
  { label: 'Blog Posts', count: counts.blog ?? 0},
  { label: 'Certifications', count: counts.certifications ?? 0},
  { label: 'Skills', count: counts.skills ?? 0},
  { label: 'Experience', count: counts.experience ?? 0},
  { label: 'Education', count: counts.education ?? 0},
  { label: 'Fields', count: counts.fields ?? 0},
  { label: 'Social Links', count: counts.socialLinks ?? 0},
  { label: 'Messages', count: counts.messages ?? 0},
]

const navItems = [
  { to: '/admin/profile',        label: 'Profile',        description: 'Edit name, title, contact info' },
  { to: '/admin/projects',       label: 'Projects',       description: 'Manage portfolio projects' },
  { to: '/admin/blog',            label: 'Blog',           description: 'Write & manage blog posts' },
  { to: '/admin/certifications', label: 'Certifications', description: 'Add or update certifications' },
  { to: '/admin/experience',     label: 'Experience',     description: 'Work history & roles' },
  { to: '/admin/education',      label: 'Education',      description: 'Academic background' },
  { to: '/admin/skills',         label: 'Skills',         description: 'Technical skills & icons' },
  { to: '/admin/fields',         label: 'Fields',         description: 'Fields of interest' },
  { to: '/admin/social-links',   label: 'Social Links',   description: 'LinkedIn, Resume, etc.' },
  { to: '/admin/messages',      label: 'Messages',        description: 'View and manage contact messages' },
]
</script>
