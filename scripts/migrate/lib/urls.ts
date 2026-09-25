// URL helpers shared by export (collect) and upload-files (rewrite).

const URL_RE = /https?:\/\/[^\s"'()<>\\`]+/g

export function findUrls(text: string): string[] {
  return (text.match(URL_RE) ?? []).map(u => u.replace(/[.,;:!?\]]+$/, ''))
}

/** Every string inside a JSON value. */
export function* strings(value: unknown): Generator<string> {
  if (typeof value === 'string') yield value
  else if (Array.isArray(value)) for (const v of value) yield* strings(v)
  else if (value && typeof value === 'object') for (const v of Object.values(value)) yield* strings(v)
}

// ── Cloudinary ────────────────────────────────────────────────────────────

const CLD_RE = /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/(image|video|raw)\/upload\/(.+)$/
// Transformation parameter names (https://cloudinary.com/documentation/transformation_reference)
const CLD_PARAM = /^(a|ac|af|ar|b|bo|br|c|co|cs|d|dl|dn|dpr|du|e|eo|f|fl|fn|fps|g|h|if|ki|l|o|p|pg|q|r|so|sp|t|u|vc|vs|w|x|y|z|\$[a-z_]+)_[^,/]*$/

export interface CloudinaryRef {
  cloud: string
  resourceType: string
  /** public id including extension (if any), folders included */
  path: string
  /** Canonical original-asset URL (no transformations, no version) */
  original: string
}

export function parseCloudinary(url: string): CloudinaryRef | null {
  const m = url.split(/[?#]/)[0].match(CLD_RE)
  if (!m) return null
  const [, cloud, resourceType, rest] = m
  const segs = rest.split('/')
  while (segs.length > 1 && segs[0].split(',').every(p => CLD_PARAM.test(p))) segs.shift()
  if (segs.length > 1 && /^v\d+$/.test(segs[0])) segs.shift()
  const path = decodeURIComponent(segs.join('/'))
  return { cloud, resourceType, path, original: `https://res.cloudinary.com/${cloud}/${resourceType}/upload/${path}` }
}

// ── Supabase Storage ──────────────────────────────────────────────────────

const SB_RE = /^(https?:\/\/[^/]+)\/storage\/v1\/(?:object|render\/image)\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/

export interface SupabaseRef {
  origin: string
  bucket: string
  path: string
  canonical: string
}

export function parseSupabase(url: string): SupabaseRef | null {
  const m = url.split(/[?#]/)[0].match(SB_RE)
  if (!m) return null
  const [, origin, bucket, raw] = m
  const path = decodeURIComponent(raw)
  return { origin, bucket, path, canonical: supabaseCanonical(origin, bucket, path) }
}

export const supabaseCanonical = (origin: string, bucket: string, path: string) =>
  `${origin}/storage/v1/object/public/${bucket}/${path}`

/** Canonical form used as the url-map key; null if not a migratable media URL. */
export function canonicalMediaUrl(url: string): string | null {
  return parseCloudinary(url)?.original ?? parseSupabase(url)?.canonical ?? null
}

const EXT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
  svg: 'image/svg+xml', avif: 'image/avif', pdf: 'application/pdf', ico: 'image/x-icon',
  mp4: 'video/mp4', webm: 'video/webm',
}

export function contentTypeFor(path: string): string | undefined {
  return EXT_TYPES[path.split('.').pop()?.toLowerCase() ?? '']
}

export function extFor(contentType: string | null): string {
  const hit = Object.entries(EXT_TYPES).find(([, t]) => t === contentType?.split(';')[0])
  return hit ? `.${hit[0]}` : ''
}
