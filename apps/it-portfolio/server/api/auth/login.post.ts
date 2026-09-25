// Step 1 of admin sign-in. Returns { ok } or { challenge } (MFA code / new password).
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const body = await readObject(event)
  const email = str(body.email, 'email', { required: true, max: 254, pattern: /^[^@\s]+@[^@\s]+$/ })!
  const password = typeof body.password === 'string' && body.password.length <= 256 ? body.password : ''
  if (!password) throw bad('password is required')
  return cognitoLogin(event, email.toLowerCase(), password)
})
