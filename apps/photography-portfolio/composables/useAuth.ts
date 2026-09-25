export const useAuth = () => {
  const supabase = useSupabase()
  const user = useState('user', () => null)
  const loading = useState('authLoading', () => false)

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      user.value = data.user
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      await navigateTo('/admin/login')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Get current user
  const getCurrentUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser
    return currentUser
  }

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!user.value)

  return {
    user,
    loading,
    signIn,
    signOut,
    getCurrentUser,
    isAuthenticated,
  }
}