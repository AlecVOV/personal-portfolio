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

const client = useSupabaseClient()

const [
  { count: projectCount },
  { count: blogCount },
  { count: certCount },
  { count: skillCount },
  { count: expCount },
  { count: eduCount },
  { count: fieldCount },
  { count: linkCount },
  { count: messageCount },
] = await Promise.all([
  client.from('projects').select('*', { count: 'exact', head: true }),
  client.from('blog_posts').select('*', { count: 'exact', head: true }),
  client.from('certifications').select('*', { count: 'exact', head: true }),
  client.from('skills').select('*', { count: 'exact', head: true }),
  client.from('experience').select('*', { count: 'exact', head: true }),
  client.from('education').select('*', { count: 'exact', head: true }),
  client.from('fields').select('*', { count: 'exact', head: true }),
  client.from('social_links').select('*', { count: 'exact', head: true }),
  client.from('contact_messages').select('*', { count: 'exact', head: true }),
])

const stats = [
  { label: 'Projects', count: projectCount ?? 0},
  { label: 'Blog Posts', count: blogCount ?? 0},
  { label: 'Certifications', count: certCount ?? 0},
  { label: 'Skills', count: skillCount ?? 0},
  { label: 'Experience', count: expCount ?? 0},
  { label: 'Education', count: eduCount ?? 0},
  { label: 'Fields', count: fieldCount ?? 0},
  { label: 'Social Links', count: linkCount ?? 0},
  { label: 'Messages', count: messageCount ?? 0},
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
