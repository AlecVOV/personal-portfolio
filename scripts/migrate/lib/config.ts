import 'dotenv/config'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export type App = 'it' | 'photo'

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
export const REPO_ROOT = join(ROOT, '..', '..')

function env(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing ${name} in scripts/migrate/.env`)
  return v
}

/** `--app it|photo` (required). */
export function parseApp(argv = process.argv): App {
  const i = argv.indexOf('--app')
  const v = i >= 0 ? argv[i + 1] : undefined
  if (v !== 'it' && v !== 'photo') throw new Error('Usage: --app <it|photo>')
  return v
}

export const hasFlag = (flag: string, argv = process.argv) => argv.includes(flag)

export interface AppConfig {
  app: App
  supabaseUrl: () => string
  supabaseKey: () => string
  tableName: () => string
  /** S3 key prefix, no trailing slash */
  prefix: string
  /** Source tables, exported in this order */
  tables: string[]
  /** App source folder, scanned for hard-coded media URLs */
  sourceDir: string
}

export const APPS: Record<App, AppConfig> = {
  it: {
    app: 'it',
    supabaseUrl: () => env('IT_SUPABASE_URL'),
    supabaseKey: () => env('IT_SUPABASE_SERVICE_KEY'),
    tableName: () => env('IT_TABLE_NAME'),
    prefix: 'it',
    tables: [
      'profile', 'social_links', 'fields', 'education', 'experience', 'skills',
      'certifications', 'projects', 'project_categories', 'blog_posts', 'contact_messages',
    ],
    sourceDir: join(REPO_ROOT, 'apps', 'it-portfolio'),
  },
  photo: {
    app: 'photo',
    supabaseUrl: () => env('PHOTO_SUPABASE_URL'),
    supabaseKey: () => env('PHOTO_SUPABASE_SERVICE_KEY'),
    tableName: () => env('PHOTO_TABLE_NAME'),
    prefix: 'photo',
    tables: ['categories', 'portfolio_items', 'blog_posts', 'testimonials', 'analytics_events'],
    sourceDir: join(REPO_ROOT, 'apps', 'photography-portfolio'),
  },
}

export const region = () => process.env.APP_REGION || 'ap-southeast-1'
export const mediaBucket = () => env('MEDIA_BUCKET')
export const mediaBaseUrl = () => env('MEDIA_BASE_URL').replace(/\/+$/, '')
export const cloudinaryCreds = () => ({
  cloud_name: env('CLOUDINARY_CLOUD_NAME'),
  api_key: env('CLOUDINARY_API_KEY'),
  api_secret: env('CLOUDINARY_API_SECRET'),
})

// ── data/<app>/ helpers ────────────────────────────────────────────────────

export const dataDir = (app: App) => join(ROOT, 'data', app)
export const filesDir = (app: App) => join(dataDir(app), 'files')

export function writeJson(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2))
}

export function readJson<T>(path: string): T {
  if (!existsSync(path)) throw new Error(`Missing ${path} — run the previous step first`)
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

export type Row = Record<string, unknown>

/** A file to move to S3. `urls` = every URL form that points at it (rows + code). */
export interface FileEntry {
  source: 'supabase' | 'cloudinary'
  /** Relative to data/<app>/files/ */
  localPath: string
  /** Target key inside the media bucket */
  key: string
  urls: string[]
  contentType?: string
  bytes?: number
}

export interface Item {
  PK: string
  SK: string
  type: string
  [k: string]: unknown
}
