// Admin pages are client-rendered (routeRules ssr: false); the API enforces auth independently.
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, ready, fetch } = useUserSession()
  if (!ready.value) await fetch()

  if (!loggedIn.value && to.path.startsWith('/admin') && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }
  if (loggedIn.value && to.path === '/admin/login') {
    return navigateTo('/admin')
  }
})
