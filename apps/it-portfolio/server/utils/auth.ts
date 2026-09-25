// Cognito sign-in + nuxt-auth-utils sealed session. Cognito tokens are verified here and never
// sent to the browser; the session holds only { sub, email, exp }.
import {
  CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand,
  type AuthenticationResultType, type ChallengeNameType,
} from '@aws-sdk/client-cognito-identity-provider'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import type { H3Event } from 'h3'

declare module '#auth-utils' {
  interface User { sub: string, email: string, exp: number }
}

export const SESSION_MAX_AGE = 8 * 60 * 60
const SUPPORTED_CHALLENGES = new Set<string>(['NEW_PASSWORD_REQUIRED', 'SOFTWARE_TOKEN_MFA'])

let cognito: CognitoIdentityProviderClient | undefined
let verifier: ReturnType<typeof CognitoJwtVerifier.create<{ userPoolId: string, tokenUse: 'id', clientId: string }>> | undefined

const cfg = () => useRuntimeConfig()
const client = () => (cognito ??= new CognitoIdentityProviderClient({ region: cfg().appRegion }))
const idVerifier = () => (verifier ??= CognitoJwtVerifier.create({
  userPoolId: cfg().cognitoUserPoolId, tokenUse: 'id', clientId: cfg().cognitoClientId,
}))

/** Every write/delete/presign route calls this first. */
export async function requireAdmin(event: H3Event) {
  setResponseHeader(event, 'cache-control', 'no-store')
  const { user } = await requireUserSession(event)
  if (!user.exp || user.exp * 1000 < Date.now()) {
    await clearUserSession(event)
    throw createError({ statusCode: 401, message: 'Session expired' })
  }
  const adminSub = cfg().adminSub
  if (adminSub && user.sub !== adminSub) throw createError({ statusCode: 403, message: 'Forbidden' })
  return user
}

// Pending Cognito challenge lives in its own short-lived sealed cookie, not in the browser's JS.
interface Pending { session?: string, username?: string, challenge?: string }
const pending = (event: H3Event) => useSession<Pending>(event, {
  name: 'cognito-challenge',
  password: cfg().session.password,
  maxAge: 180,
  cookie: { httpOnly: true, sameSite: 'lax', secure: !import.meta.dev },
})

async function finish(event: H3Event, result: AuthenticationResultType | undefined, challenge: ChallengeNameType | undefined, cognitoSession: string | undefined, username: string) {
  if (result?.IdToken) {
    const payload = await idVerifier().verify(result.IdToken)
    const groups = (payload['cognito:groups'] ?? []) as string[]
    if (!groups.includes('admin') && payload.sub !== cfg().adminSub)
      throw createError({ statusCode: 403, message: 'This account is not an administrator.' })
    await replaceUserSession(event, {
      user: { sub: payload.sub, email: String(payload.email ?? username), exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE },
    }, { maxAge: SESSION_MAX_AGE })
    await (await pending(event)).clear()
    return { ok: true as const }
  }
  if (challenge && cognitoSession && SUPPORTED_CHALLENGES.has(challenge)) {
    await (await pending(event)).update({ session: cognitoSession, username, challenge })
    return { challenge }
  }
  throw createError({ statusCode: 400, message: 'This sign-in step is not supported.' })
}

function authError(e: any): never {
  if (e?.statusCode) throw e
  const map: Record<string, [number, string]> = {
    NotAuthorizedException: [401, 'Incorrect email or password.'],
    UserNotFoundException: [401, 'Incorrect email or password.'],
    CodeMismatchException: [401, 'Invalid verification code.'],
    ExpiredCodeException: [401, 'The code has expired. Sign in again.'],
    InvalidPasswordException: [400, e?.message ?? 'Password does not meet the policy.'],
    PasswordResetRequiredException: [403, 'Password reset required. Contact the site owner.'],
    UserNotConfirmedException: [403, 'Account not confirmed.'],
    TooManyRequestsException: [429, 'Too many attempts. Try again later.'],
    LimitExceededException: [429, 'Too many attempts. Try again later.'],
  }
  const hit = map[e?.name]
  if (hit) throw createError({ statusCode: hit[0], message: hit[1] })
  console.error('Cognito error:', e?.name)
  throw createError({ statusCode: 500, message: 'Sign-in failed.' })
}

export async function cognitoLogin(event: H3Event, email: string, password: string) {
  try {
    const res = await client().send(new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH', ClientId: cfg().cognitoClientId,
      AuthParameters: { USERNAME: email, PASSWORD: password },
    }))
    return await finish(event, res.AuthenticationResult, res.ChallengeName, res.Session, email)
  } catch (e) { authError(e) }
}

export async function cognitoChallenge(event: H3Event, answer: { code?: string, newPassword?: string }) {
  const p = (await pending(event)).data
  if (!p.session || !p.username || !p.challenge) throw createError({ statusCode: 401, message: 'Sign-in timed out. Start again.' })
  const responses: Record<string, string> = { USERNAME: p.username }
  if (p.challenge === 'SOFTWARE_TOKEN_MFA') {
    if (!answer.code || !/^\d{6}$/.test(answer.code)) throw createError({ statusCode: 400, message: 'Enter the 6-digit code.' })
    responses.SOFTWARE_TOKEN_MFA_CODE = answer.code
  } else {
    if (!answer.newPassword) throw createError({ statusCode: 400, message: 'Enter a new password.' })
    responses.NEW_PASSWORD = answer.newPassword
  }
  try {
    const res = await client().send(new RespondToAuthChallengeCommand({
      ClientId: cfg().cognitoClientId, ChallengeName: p.challenge as ChallengeNameType, Session: p.session, ChallengeResponses: responses,
    }))
    return await finish(event, res.AuthenticationResult, res.ChallengeName, res.Session, p.username)
  } catch (e) { authError(e) }
}
