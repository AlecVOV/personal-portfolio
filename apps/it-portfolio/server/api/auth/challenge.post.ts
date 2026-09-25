// Step 2 of admin sign-in: answer SOFTWARE_TOKEN_MFA ({ code }) or NEW_PASSWORD_REQUIRED ({ newPassword }).
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const body = await readObject(event)
  return cognitoChallenge(event, {
    code: str(body.code, 'code', { max: 6 }),
    newPassword: typeof body.newPassword === 'string' && body.newPassword.length <= 256 ? body.newPassword : undefined,
  })
})
