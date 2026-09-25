<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-serif font-extrabold text-gray-900 dark:text-white">
          Admin Login
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Sign in to access your dashboard
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div v-if="errorMessage" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p class="text-sm text-red-800 dark:text-red-200">{{ errorMessage }}</p>
        </div>

        <div v-if="challenge === 'SOFTWARE_TOKEN_MFA'">
          <label for="code" class="block text-sm text-gray-700 dark:text-gray-300 mb-2">Code from your authenticator app</label>
          <input
            id="code"
            v-model="code"
            inputmode="numeric"
            autocomplete="one-time-code"
            pattern="[0-9]{6}"
            maxlength="6"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm dark:bg-gray-800"
            placeholder="123456"
          />
        </div>

        <div v-else-if="challenge === 'NEW_PASSWORD_REQUIRED'">
          <label for="new-password" class="block text-sm text-gray-700 dark:text-gray-300 mb-2">Choose a new password</label>
          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-accent-500 focus:border-accent-500 sm:text-sm dark:bg-gray-800"
            placeholder="New password"
          />
        </div>

        <div v-else class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-accent-500 focus:border-accent-500 focus:z-10 sm:text-sm dark:bg-gray-800"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-accent-500 focus:border-accent-500 focus:z-10 sm:text-sm dark:bg-gray-800"
              placeholder="Password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { signIn, answerChallenge, loading } = useAuth()

const email = ref('')
const password = ref('')
const code = ref('')
const newPassword = ref('')
const challenge = ref(null)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''

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
    errorMessage.value = result.error || 'Invalid email or password'
  }
}
</script>