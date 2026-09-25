export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabase()
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  // If not authenticated and trying to access admin routes
  if (!session && to.path.startsWith('/admin') && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }
  
  // If authenticated and trying to access login page
  if (session && to.path === '/admin/login') {
    return navigateTo('/admin')
  }
})


