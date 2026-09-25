// Admin auth via server routes (Cognito behind /api/auth/*). The browser only ever sees the
// sealed session cookie; useUserSession() exposes { sub, email, exp }.
type SignInResult = { success: true } | { success: false, challenge?: string, error?: string }

export const useAuth = () => {
  const { loggedIn, user, fetch: refreshSession, clear } = useUserSession()
  const loading = useState('authLoading', () => false)

  const run = async (url: string, body: Record<string, unknown>): Promise<SignInResult> => {
    loading.value = true
    try {
      const res = await $fetch<{ ok?: true, challenge?: string }>(url, { method: 'POST', body })
      if (res.ok) {
        await refreshSession()
        return { success: true }
      }
      return { success: false, challenge: res.challenge }
    } catch (error: any) {
      return { success: false, error: error?.data?.message || 'Sign-in failed' }
    } finally {
      loading.value = false
    }
  }

  const signIn = (email: string, password: string) => run('/api/auth/login', { email, password })
  const answerChallenge = (answer: { code?: string, newPassword?: string }) => run('/api/auth/challenge', answer)

  const signOut = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    await clear()
    await navigateTo('/admin/login')
  }

  return { user, loading, isAuthenticated: loggedIn, signIn, answerChallenge, signOut }
}
