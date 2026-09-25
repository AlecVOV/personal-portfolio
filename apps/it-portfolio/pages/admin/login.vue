<template>
  <div class="min-h-screen bg-eerie-black flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-gradient-jet rounded-2xl p-8 shadow-xl">
      <h1 class="text-2xl font-bold text-white text-center mb-6">Admin Login</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div v-if="challenge === 'SOFTWARE_TOKEN_MFA'">
          <label for="code" class="block text-sm text-gray-300 mb-1">Code from your authenticator app</label>
          <input
            id="code"
            v-model="code"
            inputmode="numeric"
            autocomplete="one-time-code"
            pattern="[0-9]{6}"
            maxlength="6"
            required
            class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-yellow"
          />
        </div>

        <div v-else-if="challenge === 'NEW_PASSWORD_REQUIRED'">
          <label for="new-password" class="block text-sm text-gray-300 mb-1">Choose a new password</label>
          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            required
            autocomplete="new-password"
            class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-yellow"
          />
        </div>

        <template v-else>
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
        </template>

        <p v-if="errorMsg" class="text-red-400 text-sm">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-orange-yellow text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : challenge ? 'Continue' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { signIn, answerChallenge, loading, isAuthenticated } = useAuth()
const { fetch: refreshSession } = useUserSession()
const email = ref('')
const password = ref('')
const code = ref('')
const newPassword = ref('')
const challenge = ref<string | null>(null)
const errorMsg = ref('')

// If already logged in, redirect to admin dashboard
onMounted(async () => {
  await refreshSession()
  if (isAuthenticated.value) await navigateTo('/admin')
})

const handleLogin = async () => {
  errorMsg.value = ''

  const result = challenge.value
    ? await answerChallenge({ code: code.value || undefined, newPassword: newPassword.value || undefined })
    : await signIn(email.value, password.value)
  password.value = ''

  if (result.success) {
    await navigateTo('/admin')
  } else if (result.challenge) {
    challenge.value = result.challenge
    code.value = ''
    newPassword.value = ''
  } else {
    if (/timed out/i.test(result.error || '')) challenge.value = null
    errorMsg.value = result.error || 'Invalid email or password'
  }
}
</script>
