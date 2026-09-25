<template>
  <div class="min-h-screen bg-eerie-black text-white">
    <!-- Admin Top Bar -->
    <header class="bg-gradient-jet border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin" class="text-xl font-bold hover:text-orange-yellow transition-colors">
          CMS Dashboard
        </NuxtLink>
        <nav class="hidden md:flex gap-4 text-sm">
          <NuxtLink to="/admin/profile"        class="hover:text-orange-yellow transition-colors">Profile</NuxtLink>
          <NuxtLink to="/admin/projects"       class="hover:text-orange-yellow transition-colors">Projects</NuxtLink>
          <NuxtLink to="/admin/blog"            class="hover:text-orange-yellow transition-colors">Blog</NuxtLink>
          <NuxtLink to="/admin/certifications" class="hover:text-orange-yellow transition-colors">Certifications</NuxtLink>
          <NuxtLink to="/admin/experience"     class="hover:text-orange-yellow transition-colors">Experience</NuxtLink>
          <NuxtLink to="/admin/education"      class="hover:text-orange-yellow transition-colors">Education</NuxtLink>
          <NuxtLink to="/admin/skills"         class="hover:text-orange-yellow transition-colors">Skills</NuxtLink>
          <NuxtLink to="/admin/fields"         class="hover:text-orange-yellow transition-colors">Fields</NuxtLink>
          <NuxtLink to="/admin/social-links"   class="hover:text-orange-yellow transition-colors">Social Links</NuxtLink>
          <NuxtLink to="/admin/messages"      class="hover:text-orange-yellow transition-colors">Messages</NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <NuxtLink to="/" target="_blank" class="text-sm text-gray-400 hover:text-white">
          View Site ↗
        </NuxtLink>
        <button @click="handleLogout" class="text-sm text-red-400 hover:text-red-300">
          Sign Out
        </button>
      </div>
    </header>

    <!-- Mobile Nav -->
    <nav class="md:hidden bg-gradient-jet border-b border-gray-800 px-4 py-3 flex gap-3 overflow-x-auto text-sm">
      <NuxtLink to="/admin/profile"        class="whitespace-nowrap hover:text-orange-yellow transition-colors">Profile</NuxtLink>
      <NuxtLink to="/admin/projects"       class="whitespace-nowrap hover:text-orange-yellow transition-colors">Projects</NuxtLink>
      <NuxtLink to="/admin/blog"            class="whitespace-nowrap hover:text-orange-yellow transition-colors">Blog</NuxtLink>
      <NuxtLink to="/admin/certifications" class="whitespace-nowrap hover:text-orange-yellow transition-colors">Certs</NuxtLink>
      <NuxtLink to="/admin/experience"     class="whitespace-nowrap hover:text-orange-yellow transition-colors">Experience</NuxtLink>
      <NuxtLink to="/admin/education"      class="whitespace-nowrap hover:text-orange-yellow transition-colors">Education</NuxtLink>
      <NuxtLink to="/admin/skills"         class="whitespace-nowrap hover:text-orange-yellow transition-colors">Skills</NuxtLink>
      <NuxtLink to="/admin/fields"         class="whitespace-nowrap hover:text-orange-yellow transition-colors">Fields</NuxtLink>
      <NuxtLink to="/admin/social-links"   class="whitespace-nowrap hover:text-orange-yellow transition-colors">Links</NuxtLink>
      <NuxtLink to="/admin/messages"      class="whitespace-nowrap hover:text-orange-yellow transition-colors">Messages</NuxtLink>
    </nav>

    <!-- Page Content -->
    <main class="p-6 md:p-8 max-w-7xl mx-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { signOut } = useAuth()

const handleLogout = async () => {
  await signOut()
}
</script>
