// Admin pages are client-rendered (routeRules ssr: false); the API enforces auth independently.
export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, ready, fetch } = useUserSession()
  if (!ready.value) await fetch()

  if (!loggedIn.value) {
    return navigateTo('/admin/login')
  }
})
