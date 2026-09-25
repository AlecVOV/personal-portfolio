// Hand-written body validation: every write route whitelists and checks fields before storing.
import type { H3Event } from 'h3'

export async function readObject(event: H3Event): Promise<Record<string, unknown>> {
  const body = await readBody(event).catch(() => undefined)
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw bad('Invalid JSON body')
  return body as Record<string, unknown>
}

export const bad = (message: string) => createError({ statusCode: 400, message })

interface StrOpts { required?: boolean, max?: number, pattern?: RegExp, label?: string }

/** Trimmed string or undefined (empty -> undefined). Throws 400 on wrong type/length/pattern. */
export function str(v: unknown, name: string, o: StrOpts = {}): string | undefined {
  const label = o.label ?? name
  if (v === undefined || v === null || v === '') {
    if (o.required) throw bad(`${label} is required`)
    return undefined
  }
  if (typeof v !== 'string') throw bad(`${label} must be text`)
  const s = v.trim()
  if (!s) { if (o.required) throw bad(`${label} is required`); return undefined }
  if (s.length > (o.max ?? 500)) throw bad(`${label} is too long`)
  if (o.pattern && !o.pattern.test(s)) throw bad(`${label} is invalid`)
  return s
}

export const httpsUrl = (v: unknown, name: string, required = false) =>
  str(v, name, { required, max: 2048, pattern: /^https:\/\/[^\s<>"']+$/ })

export function oneOf<T extends string>(v: unknown, name: string, allowed: readonly T[], fallback?: T): T {
  if ((v === undefined || v === null || v === '') && fallback) return fallback
  if (typeof v !== 'string' || !allowed.includes(v as T)) throw bad(`${name} is invalid`)
  return v as T
}

export function intRange(v: unknown, name: string, min: number, max: number, fallback: number): number {
  if (v === undefined || v === null || v === '') return fallback
  const n = Number(v)
  if (!Number.isInteger(n) || n < min || n > max) throw bad(`${name} must be ${min}–${max}`)
  return n
}

export const ID_RE = /^[A-Za-z0-9-]{1,64}$/

export function routeId(event: H3Event): string {
  const id = getRouterParam(event, 'id')
  if (!id || !ID_RE.test(id)) throw bad('Invalid id')
  return id
}

export function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 120)
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Only keys present in the body (for partial updates). */
export const has = (body: Record<string, unknown>, k: string) => Object.prototype.hasOwnProperty.call(body, k)
