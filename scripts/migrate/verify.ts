// Compare source vs DynamoDB and look for leftover old media URLs.
//   npx tsx verify.ts --app <it|photo>
// Offline admin check, so a full-table Scan is fine here (never in a request path).
// Logs counts, types and keys only — never attribute values.
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { join } from 'node:path'
import { APPS, dataDir, mediaBucket, parseApp, readJson, region, type FileEntry, type Item } from './lib/config.js'
import { strings } from './lib/urls.js'

const app = parseApp()
const TableName = APPS[app].tableName()
const expected = readJson<Item[]>(join(dataDir(app), 'items.final.json'))
const { sourceCounts } = readJson<{ sourceCounts: Record<string, number> }>(join(dataDir(app), 'transform-summary.json'))

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: region() }))
const actual: Item[] = []
let ExclusiveStartKey: Record<string, unknown> | undefined
do {
  const res = await doc.send(new ScanCommand({ TableName, ExclusiveStartKey }))
  actual.push(...((res.Items ?? []) as Item[]))
  ExclusiveStartKey = res.LastEvaluatedKey
} while (ExclusiveStartKey)

const count = (xs: Item[]) => xs.reduce<Record<string, number>>((m, i) => ({ ...m, [i.type]: (m[i.type] ?? 0) + 1 }), {})
const exp = count(expected), act = count(actual)
let ok = true
console.log('  source rows:', JSON.stringify(sourceCounts))
console.log('  type             expected  dynamodb')
for (const t of [...new Set([...Object.keys(exp), ...Object.keys(act)])].sort()) {
  const mark = exp[t] === act[t] ? '' : '  <-- MISMATCH'
  if (mark) ok = false
  console.log(`  ${t.padEnd(16)} ${String(exp[t] ?? 0).padStart(8)}  ${String(act[t] ?? 0).padStart(8)}${mark}`)
}

const actualKeys = new Set(actual.map(i => `${i.PK}|${i.SK}`))
const missing = expected.filter(i => !actualKeys.has(`${i.PK}|${i.SK}`))
if (missing.length) { ok = false; console.log(`  missing keys (${missing.length}):`, missing.map(i => `${i.PK}/${i.SK}`).join(', ')) }

const OLD = /supabase\.co|cloudinary\.com/
const stale = actual.filter(i => [...strings(i)].some(s => OLD.test(s)))
if (stale.length) {
  ok = false
  console.log(`  items still holding old URLs (${stale.length}):`, stale.map(i => `${i.type} ${i.PK}/${i.SK}`).join(', '))
} else console.log('  old URLs (supabase.co / cloudinary.com): none')

const manifest = readJson<FileEntry[]>(join(dataDir(app), 'files.json'))
const s3 = new S3Client({ region: region() })
const absent: string[] = []
for (const f of manifest) {
  try { await s3.send(new HeadObjectCommand({ Bucket: mediaBucket(), Key: f.key })) } catch { absent.push(f.key) }
}
if (absent.length) { ok = false; console.log(`  S3 objects missing (${absent.length}):`, absent.slice(0, 20).join(', ')) }
else console.log(`  S3: all ${manifest.length} files present`)

console.log(ok ? '  VERIFY OK' : '  VERIFY FAILED')
process.exitCode = ok ? 0 : 1
