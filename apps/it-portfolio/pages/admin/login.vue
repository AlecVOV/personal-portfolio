<template>
  <div class="min-h-screen bg-eerie-black flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-gradient-jet rounded-2xl p-8 shadow-xl">
      <h1 class="text-2xl font-bold text-white text-center mb-6">Admin Login</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-sm text-gray-300 mb-1">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-yellow"
          />
        </div>

        <div>
          <label for="password" class="block text-sm text-gray-300 mb-1">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-yellow"
          />
        </div>

        <p v-if="errorMsg" class="text-red-400 text-sm">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-orange-yellow text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const client = useSupabaseClient()
const user = useSupabaseUser()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

// If already logged in, redirect to admin dashboard
watchEffect(() => {
  if (user.value) {
    navigateTo('/admin')
  }
})

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMsg.value = error.message
    loading.value = false
    return
  }

  await navigateTo('/admin')
}
</script>
