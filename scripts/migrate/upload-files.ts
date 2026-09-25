// Upload exported files to S3 and rewrite media URLs in items.
//   npx tsx upload-files.ts --app <it|photo>            (dry run: HEAD checks only, writes local JSON)
//   npx tsx upload-files.ts --app <it|photo> --apply    (uploads missing/changed files)
// Reads data/<app>/{files.json,items.json,code-refs.json}; writes url-map.json, items.final.json,
// code-url-map.json (hard-coded URLs for Phase 3). Logs counts and S3 keys only.
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { APPS, dataDir, filesDir, hasFlag, mediaBaseUrl, mediaBucket, parseApp, readJson, region, writeJson, type FileEntry, type Item } from './lib/config.js'
import { canonicalMediaUrl, findUrls } from './lib/urls.js'

const app = parseApp()
const apply = hasFlag('--apply')
const cfg = APPS[app]
const base = mediaBaseUrl()
const manifest = readJson<FileEntry[]>(join(dataDir(app), 'files.json'))
const items = readJson<Item[]>(join(dataDir(app), 'items.json'))
const codeRefs = readJson<Record<string, string[]>>(join(dataDir(app), 'code-refs.json'))

const cdnUrl = (key: string) => `${base}/${key.split('/').map(encodeURIComponent).join('/')}`

// ── url-map: canonical old URL -> CloudFront URL ─────────────────────────
const urlMap: Record<string, string> = {}
for (const f of manifest) for (const u of f.urls) urlMap[u] = cdnUrl(f.key)
const byKey = new Map(manifest.map(f => [f.key, f]))

// it-portfolio stores bucket-relative paths (e.g. "avatar.webp") in these fields.
const PATH_FIELDS: Record<string, Record<string, string>> = app === 'it'
  ? {
      profile: { avatar_url: 'avatars', resume_url: 'resumes', cv_url: 'cv' },
      project: { image_url: 'projects' },
      blogPost: { image_url: 'blog-images' },
      certification: { badge_url: 'certificates' },
      skill: { icon_url: 'skills' },
    }
  : {}

const stats = { urlsRewritten: 0, pathsResolved: 0, pathsUnresolved: 0, oldUrlsUnresolved: 0 }

function resolvePath(value: string, bucket: string): string | undefined {
  const exact = byKey.get(`${cfg.prefix}/${bucket}/${value.replace(/^\/+/, '')}`)
  if (exact) return cdnUrl(exact.key)
  const suffix = manifest.filter(f => f.source === 'supabase' && f.key.endsWith(`/${value}`))
  return suffix.length === 1 ? cdnUrl(suffix[0].key) : undefined
}

function rewriteString(s: string): string {
  let out = s
  for (const u of findUrls(s)) {
    const canon = canonicalMediaUrl(u)
    if (!canon) continue
    const to = urlMap[canon]
    if (to) { out = out.split(u).join(to); stats.urlsRewritten++ }
    else stats.oldUrlsUnresolved++
  }
  return out
}

function rewrite(value: unknown): unknown {
  if (typeof value === 'string') return rewriteString(value)
  if (Array.isArray(value)) return value.map(rewrite)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewrite(v)]))
  return value
}

const KEY_ATTRS = new Set(['PK', 'SK', 'GSI1PK', 'GSI1SK', 'type', 'id', 'slug', 'createdAt', 'updatedAt'])
const finalItems = items.map(item => {
  const out: Item = { ...item }
  for (const [k, v] of Object.entries(item)) {
    if (KEY_ATTRS.has(k)) continue
    const bucket = PATH_FIELDS[item.type]?.[k]
    if (bucket && typeof v === 'string' && v && !/^https?:\/\//.test(v)) {
      const url = resolvePath(v, bucket)
      if (url) { out[k] = url; stats.pathsResolved++ } else stats.pathsUnresolved++
    } else out[k] = rewrite(v)
  }
  return out
})

// Hard-coded URLs in app source (Phase 3 replaces them)
const codeUrlMap: Record<string, { cdn: string | null, files: string[] }> = {}
for (const [canon, files] of Object.entries(codeRefs)) codeUrlMap[canon] = { cdn: urlMap[canon] ?? null, files }

writeJson(join(dataDir(app), 'url-map.json'), urlMap)
writeJson(join(dataDir(app), 'items.final.json'), finalItems)
writeJson(join(dataDir(app), 'code-url-map.json'), codeUrlMap)
console.log('  rewrite:', JSON.stringify(stats))
console.log(`  hard-coded URLs in code: ${Object.keys(codeUrlMap).length} (${Object.values(codeUrlMap).filter(v => !v.cdn).length} without a file)`)

// ── S3 ───────────────────────────────────────────────────────────────────
const s3 = new S3Client({ region: region() })
const Bucket = mediaBucket()
let toUpload = 0, same = 0, uploaded = 0, bytes = 0
const failures: string[] = []

async function pool<T>(xs: T[], n: number, fn: (x: T) => Promise<void>) {
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => { while (i < xs.length) await fn(xs[i++]) }))
}

await pool(manifest, 6, async f => {
  const local = join(filesDir(app), f.localPath)
  const size = statSync(local).size
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket, Key: f.key }))
    if (head.ContentLength === size) { same++; return }
  } catch (e: any) {
    if (e?.$metadata?.httpStatusCode !== 404 && e?.name !== 'NotFound') { failures.push(f.key); return }
  }
  toUpload++; bytes += size
  if (!apply) return
  try {
    await s3.send(new PutObjectCommand({
      Bucket, Key: f.key, Body: readFileSync(local),
      ContentType: f.contentType ?? 'application/octet-stream',
      CacheControl: 'public, max-age=31536000, immutable',
    }))
    uploaded++
  } catch { failures.push(f.key) }
})

console.log(`  s3: ${manifest.length} files, ${same} already up to date, ${toUpload} to upload (${(bytes / 1048576).toFixed(1)} MB)`)
if (apply) console.log(`  uploaded: ${uploaded}`)
else console.log('  DRY RUN — nothing uploaded. Re-run with --apply to upload.')
if (failures.length) { console.log(`  FAILED (${failures.length}):`, failures.join(', ')); process.exitCode = 1 }
