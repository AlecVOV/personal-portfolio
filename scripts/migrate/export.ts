// Export every source table + every media file for one app. Read-only against the source.
//   npx tsx export.ts --app <it|photo> [--skip-files]
// Writes data/<app>/<table>.json, data/<app>/files/**, data/<app>/files.json.
// Logs counts and column/key names only — never row contents.
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { APPS, cloudinaryCreds, dataDir, filesDir, hasFlag, parseApp, writeJson, type FileEntry, type Row } from './lib/config.js'
import { contentTypeFor, extFor, findUrls, parseCloudinary, parseSupabase, strings, supabaseCanonical } from './lib/urls.js'

const PAGE = 1000
const app = parseApp()
const cfg = APPS[app]
const sb = createClient(cfg.supabaseUrl(), cfg.supabaseKey(), { auth: { persistSession: false } })
const sbOrigin = new URL(cfg.supabaseUrl()).origin
const summary: Record<string, unknown> = { app, exportedAt: new Date().toISOString() }

// ── Tables ────────────────────────────────────────────────────────────────

async function exportTable(table: string): Promise<Row[] | null> {
  const rows: Row[] = []
  let ordered = true
  for (let from = 0; ; from += PAGE) {
    let q = sb.from(table).select('*')
    if (ordered) q = q.order('id')
    const { data, error } = await q.range(from, from + PAGE - 1)
    if (error) {
      const msg = `${error.code} ${error.message}`
      if (from === 0 && ordered && /42703|column .*id.* does not exist/i.test(msg)) { ordered = false; from -= PAGE; continue }
      if (from === 0 && /42P01|PGRST205|does not exist|schema cache/i.test(msg)) return null
      throw new Error(`${table}: ${msg}`)
    }
    rows.push(...(data as Row[]))
    if (data.length < PAGE) break
  }
  return rows
}

const allRows: Row[] = []
const tableSummary: Record<string, { rows: number, columns: string[] } | 'missing'> = {}
for (const table of cfg.tables) {
  const rows = await exportTable(table)
  if (!rows) {
    tableSummary[table] = 'missing'
    console.log(`  ${table}: table not found, skipped`)
    continue
  }
  writeJson(join(dataDir(app), `${table}.json`), rows)
  const columns = [...new Set(rows.flatMap(r => Object.keys(r)))]
  tableSummary[table] = { rows: rows.length, columns }
  allRows.push(...rows)
  console.log(`  ${table}: ${rows.length} rows; columns: ${columns.join(', ')}`)
}
summary.tables = tableSummary

if (hasFlag('--skip-files')) {
  writeJson(join(dataDir(app), 'export-summary.json'), summary)
  console.log('Files skipped (--skip-files).')
  process.exit(0)
}

// ── Referenced URLs (rows + hard-coded in app source) ────────────────────

const SKIP_DIRS = new Set(['node_modules', '.nuxt', '.output', '.nitro', '.data', '.git', '.amplify-hosting', 'dist'])
function* sourceFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { if (!SKIP_DIRS.has(name)) yield* sourceFiles(p) }
    else if (/\.(vue|ts|js|mjs|md|css|html)$/.test(name) && !/^\.env|dev_log/.test(name)) yield p
  }
}

const referenced = new Set<string>()
for (const s of strings(allRows)) findUrls(s).forEach(u => referenced.add(u))
const codeRefs = new Map<string, string[]>() // canonical URL -> source files
for (const f of sourceFiles(cfg.sourceDir)) {
  for (const u of findUrls(readFileSync(f, 'utf8'))) {
    const canon = parseCloudinary(u)?.original ?? parseSupabase(u)?.canonical
    if (!canon) continue
    referenced.add(u)
    codeRefs.set(canon, [...new Set([...(codeRefs.get(canon) ?? []), relative(cfg.sourceDir, f).replace(/\\/g, '/')])])
  }
}

// ── File registry ─────────────────────────────────────────────────────────

const files = new Map<string, FileEntry>() // by localPath
function addFile(e: FileEntry) {
  const prev = files.get(e.localPath)
  if (prev) prev.urls = [...new Set([...prev.urls, ...e.urls])]
  else files.set(e.localPath, e)
}

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]) }))
}

function saveFile(localPath: string, buf: Buffer) {
  const p = join(filesDir(app), localPath)
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, buf)
}
const alreadyHave = (localPath: string, bytes?: number) => {
  const p = join(filesDir(app), localPath)
  return existsSync(p) && (bytes === undefined || statSync(p).size === bytes)
}

// ── Supabase Storage: every object in every bucket ───────────────────────

interface SbObject { bucket: string, path: string, bytes?: number, mimetype?: string }

async function listBucket(bucket: string, prefix = ''): Promise<SbObject[]> {
  const out: SbObject[] = []
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await sb.storage.from(bucket).list(prefix, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } })
    if (error) throw new Error(`storage list ${bucket}: ${error.message}`)
    for (const e of data) {
      const path = prefix ? `${prefix}/${e.name}` : e.name
      if (e.id === null) out.push(...await listBucket(bucket, path))
      else if (e.name !== '.emptyFolderPlaceholder') {
        const meta = (e.metadata ?? {}) as { size?: number, mimetype?: string }
        out.push({ bucket, path, bytes: meta.size, mimetype: meta.mimetype })
      }
    }
    if (data.length < 1000) break
  }
  return out
}

const { data: buckets, error: bErr } = await sb.storage.listBuckets()
if (bErr) throw new Error(`storage listBuckets: ${bErr.message}`)
const sbObjects: SbObject[] = []
for (const b of buckets) sbObjects.push(...await listBucket(b.name))
console.log(`  storage: ${buckets.length} buckets (${buckets.map(b => b.name).join(', ') || '-'}), ${sbObjects.length} objects`)

let sbFailed = 0
await pool(sbObjects, 6, async o => {
  const localPath = `supabase/${o.bucket}/${o.path}`
  if (!alreadyHave(localPath, o.bytes)) {
    const { data, error } = await sb.storage.from(o.bucket).download(o.path)
    if (error || !data) { sbFailed++; return }
    saveFile(localPath, Buffer.from(await data.arrayBuffer()))
  }
  addFile({
    source: 'supabase', localPath, key: `${cfg.prefix}/${o.bucket}/${o.path}`,
    urls: [supabaseCanonical(sbOrigin, o.bucket, o.path)],
    contentType: o.mimetype || contentTypeFor(o.path), bytes: o.bytes,
  })
})

const sbKnown = new Set(sbObjects.map(o => supabaseCanonical(sbOrigin, o.bucket, o.path)))
const sbMissing = [...referenced].map(parseSupabase).filter(r => r && !sbKnown.has(r.canonical)).length

// ── Cloudinary: referenced URLs (any cloud) + Admin API listing ──────────

const cldRefs = new Map<string, ReturnType<typeof parseCloudinary> & {}>()
for (const u of referenced) { const r = parseCloudinary(u); if (r) cldRefs.set(r.original, r) }
let listed = 0
if (app === 'photo') {
  cloudinary.config({ ...cloudinaryCreds(), secure: true })
  for (const resource_type of ['image', 'video', 'raw']) {
    let next_cursor: string | undefined
    do {
      const res = await cloudinary.api.resources({ type: 'upload', resource_type, max_results: 500, next_cursor })
      for (const r of res.resources as { secure_url: string }[]) {
        const ref = parseCloudinary(r.secure_url)
        if (ref) { cldRefs.set(ref.original, ref); listed++ }
      }
      next_cursor = res.next_cursor
    } while (next_cursor)
  }
}

let cldFailed = 0
await pool([...cldRefs.values()], 6, async ref => {
  let localPath = `cloudinary/${ref.cloud}/${ref.path}`
  let key = `${cfg.prefix}/legacy/${ref.cloud}/${ref.path}`
  const hasExt = /\.[a-z0-9]{2,5}$/i.test(ref.path)
  let contentType = contentTypeFor(ref.path)
  if (!hasExt || !alreadyHave(localPath)) {
    const res = await fetch(ref.original)
    if (!res.ok) { cldFailed++; return }
    contentType = res.headers.get('content-type')?.split(';')[0] ?? contentType
    if (!hasExt) { localPath += extFor(contentType ?? null); key += extFor(contentType ?? null) }
    saveFile(localPath, Buffer.from(await res.arrayBuffer()))
  }
  addFile({ source: 'cloudinary', localPath, key, urls: [ref.original], contentType, bytes: statSync(join(filesDir(app), localPath)).size })
})

// ── Write manifest + summary ─────────────────────────────────────────────

const manifest = [...files.values()].sort((a, b) => a.key.localeCompare(b.key))
writeJson(join(dataDir(app), 'files.json'), manifest)
writeJson(join(dataDir(app), 'code-refs.json'), Object.fromEntries(codeRefs))
summary.files = {
  supabaseObjects: sbObjects.length, supabaseDownloadFailed: sbFailed, supabaseReferencedButMissing: sbMissing,
  cloudinaryAssets: cldRefs.size, cloudinaryListedViaApi: listed, cloudinaryDownloadFailed: cldFailed,
  hardCodedUrlsInCode: codeRefs.size, manifestEntries: manifest.length,
  totalMB: +(manifest.reduce((s, f) => s + (f.bytes ?? 0), 0) / 1048576).toFixed(1),
}
writeJson(join(dataDir(app), 'export-summary.json'), summary)
console.log('  files:', JSON.stringify(summary.files))
