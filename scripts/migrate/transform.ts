// Pure transform: data/<app>/<table>.json -> data/<app>/items.json, keyed per docs/data-model.md.
//   npx tsx transform.ts --app <it|photo> [--include-analytics]
// Keeps original UUIDs as ids, converts timestamps to ISO 8601, drops nulls. Logs counts only.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { dataDir, hasFlag, parseApp, readJson, writeJson, type App, type Item, type Row } from './lib/config.js'

// ── Generic helpers (pure) ────────────────────────────────────────────────

const TIMESTAMP_COLS = new Set(['published_at', 'deleted_at'])

export function iso(v: unknown): string | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const d = new Date(v as string)
  if (Number.isNaN(d.getTime())) throw new Error('Unparseable timestamp value')
  return d.toISOString()
}

/** Copy row attributes: drop nulls, ISO-ify timestamp columns, strip created_at/updated_at. */
export function attrs(row: Row): Row {
  const out: Row = {}
  for (const [k, v] of Object.entries(row)) {
    if (v === null || v === undefined || k === 'created_at' || k === 'updated_at') continue
    out[k] = TIMESTAMP_COLS.has(k) ? iso(v) : v
  }
  return out
}

export function item(row: Row, type: string, PK: string, SK: string, fallbackTs: string, extra: Row = {}): Item {
  const createdAt = iso(row.created_at) ?? iso(row.updated_at) ?? fallbackTs
  const updatedAt = iso(row.updated_at) ?? createdAt
  const it: Item = { PK, SK, type, ...attrs(row), createdAt, updatedAt }
  for (const [k, v] of Object.entries(extra)) if (v !== undefined && v !== null) it[k] = v
  return it
}

export function slugPointers(posts: Item[], label: string): Item[] {
  const seen = new Map<string, number>()
  for (const p of posts) {
    if (typeof p.slug !== 'string' || !p.slug) throw new Error(`${label}: ${posts.filter(x => !x.slug).length} post(s) without slug`)
    seen.set(p.slug, (seen.get(p.slug) ?? 0) + 1)
  }
  const dups = [...seen.values()].filter(n => n > 1).length
  if (dups) throw new Error(`${label}: ${dups} duplicated slug(s); fix them in the source first`)
  return posts.map(p => ({ PK: 'BLOG', SK: `SLUG#${p.slug}`, type: 'slug', id: p.id, createdAt: p.createdAt, updatedAt: p.updatedAt }))
}

// ── it-portfolio ──────────────────────────────────────────────────────────

export function transformIt(t: Record<string, Row[]>, ts: string): Item[] {
  const out: Item[] = []

  const profiles = [...(t.profile ?? [])].sort((a, b) => String(b.updated_at ?? '').localeCompare(String(a.updated_at ?? '')))
  if (profiles.length > 1) console.warn(`  profile: ${profiles.length} rows, keeping the most recently updated`)
  if (profiles[0]) out.push(item(profiles[0], 'profile', 'SITE', 'PROFILE', ts))

  const site: [string, string, string][] = [
    ['social_links', 'socialLink', 'SOCIAL'], ['fields', 'field', 'FIELD'], ['education', 'education', 'EDU'],
    ['experience', 'experience', 'EXP'], ['skills', 'skill', 'SKILL'], ['certifications', 'certification', 'CERT'],
  ]
  for (const [table, type, prefix] of site)
    for (const r of t[table] ?? []) out.push(item(r, type, 'SITE', `${prefix}#${r.id}`, ts))

  const cats = new Map<string, string[]>()
  for (const pc of t.project_categories ?? []) {
    const k = String(pc.project_id)
    cats.set(k, [...(cats.get(k) ?? []), String(pc.category)])
  }
  for (const r of t.projects ?? [])
    out.push(item(r, 'project', 'SITE', `PROJECT#${r.id}`, ts, { categories: cats.get(String(r.id)) ?? [] }))

  const posts = (t.blog_posts ?? []).map(r => {
    const published = r.published === true
    return item(r, 'blogPost', 'BLOG', `POST#${r.id}`, ts, published
      ? { GSI1PK: 'BLOG#PUBLISHED', GSI1SK: iso(r.published_at) ?? iso(r.created_at) ?? ts }
      : {})
  })
  out.push(...posts, ...slugPointers(posts, 'it blog_posts'))

  for (const r of t.contact_messages ?? []) {
    const m = item(r, 'message', 'MESSAGE', `MSG#${r.id}`, ts)
    out.push({ ...m, GSI1PK: 'MESSAGE', GSI1SK: m.createdAt })
  }
  return out
}

// ── photography-portfolio ─────────────────────────────────────────────────

export function transformPhoto(t: Record<string, Row[]>, ts: string, includeAnalytics: boolean): Item[] {
  const out: Item[] = []

  const catById = new Map<string, Row>()
  for (const r of t.categories ?? []) {
    catById.set(String(r.id), r)
    out.push(item(r, 'category', 'CATEGORY', `CAT#${r.id}`, ts))
  }
  const catAttrs = (r: Row) => {
    const c = r.category_id ? catById.get(String(r.category_id)) : undefined
    return { category_name: c?.name, category_slug: c?.slug }
  }

  for (const r of t.portfolio_items ?? []) {
    const it = item(r, 'portfolioItem', 'PORTFOLIO', `ITEM#${r.id}`, ts, catAttrs(r))
    if (r.status === 'published') Object.assign(it, { GSI1PK: 'PORTFOLIO#PUBLISHED', GSI1SK: it.createdAt })
    out.push(it)
  }

  const posts = (t.blog_posts ?? []).map(r => {
    const it = item(r, 'blogPost', 'BLOG', `POST#${r.id}`, ts, catAttrs(r))
    if (r.status === 'published' && !r.deleted_at) Object.assign(it, { GSI1PK: 'BLOG#PUBLISHED', GSI1SK: it.createdAt })
    return it
  })
  out.push(...posts, ...slugPointers(posts, 'photo blog_posts'))

  for (const r of t.testimonials ?? []) {
    const it = item(r, 'testimonial', 'TESTIMONIAL', `T#${r.id}`, ts)
    if (r.status === 'published') Object.assign(it, { GSI1PK: 'TESTIMONIAL#PUBLISHED', GSI1SK: it.createdAt })
    out.push(it)
  }

  if (includeAnalytics)
    for (const r of t.analytics_events ?? []) {
      const it = item(r, 'analyticsEvent', 'ANALYTICS', '', ts)
      out.push({ ...it, SK: `EVT#${it.createdAt}#${r.id}` })
    }
  return out
}

// ── CLI ───────────────────────────────────────────────────────────────────

function loadTables(app: App): { tables: Record<string, Row[]>, exportedAt: string } {
  const summary = readJson<{ exportedAt: string, tables: Record<string, unknown> }>(join(dataDir(app), 'export-summary.json'))
  const tables: Record<string, Row[]> = {}
  for (const name of Object.keys(summary.tables)) {
    const p = join(dataDir(app), `${name}.json`)
    if (existsSync(p)) tables[name] = readJson<Row[]>(p)
  }
  return { tables, exportedAt: summary.exportedAt }
}

{
  const app = parseApp()
  const { tables, exportedAt } = loadTables(app)
  const includeAnalytics = hasFlag('--include-analytics')
  const items = app === 'it' ? transformIt(tables, exportedAt) : transformPhoto(tables, exportedAt, includeAnalytics)

  const keys = new Set<string>()
  for (const i of items) {
    const k = `${i.PK}|${i.SK}`
    if (keys.has(k)) throw new Error(`Duplicate key for type ${i.type}`)
    keys.add(k)
  }
  writeJson(join(dataDir(app), 'items.json'), items)

  const byType: Record<string, number> = {}
  for (const i of items) byType[i.type] = (byType[i.type] ?? 0) + 1
  const sourceCounts = Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, v.length]))
  writeJson(join(dataDir(app), 'transform-summary.json'), { sourceCounts, byType, includeAnalytics })
  console.log('  source rows:', JSON.stringify(sourceCounts))
  console.log('  items by type:', JSON.stringify(byType))
  if (app === 'photo' && !includeAnalytics && tables.analytics_events?.length)
    console.log(`  analytics_events: ${tables.analytics_events.length} rows NOT included (pass --include-analytics to keep)`)
}
