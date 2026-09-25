// Refresh tokens are never kept, so clearing the session is enough (no GlobalSignOut).
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  await clearUserSession(event)
  return { ok: true }
})
