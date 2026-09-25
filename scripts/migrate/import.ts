// Write items.final.json into the app's DynamoDB table.
//   npx tsx import.ts --app <it|photo>            (DEFAULT: dry run, validates only)
//   npx tsx import.ts --app <it|photo> --apply    (BatchWriteItem, chunks of 25)
// Keys are deterministic (original UUIDs), so re-runs overwrite instead of duplicating. Logs counts only.
import { DescribeTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { BatchWriteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { join } from 'node:path'
import { APPS, dataDir, hasFlag, parseApp, readJson, region, type Item } from './lib/config.js'

const app = parseApp()
const apply = hasFlag('--apply')
const TableName = APPS[app].tableName()
const items = readJson<Item[]>(join(dataDir(app), 'items.final.json'))

// ── Validate ─────────────────────────────────────────────────────────────
const problems: string[] = []
const keys = new Set<string>()
items.forEach((i, n) => {
  if (typeof i.PK !== 'string' || !i.PK || typeof i.SK !== 'string' || !i.SK) problems.push(`#${n} (${i.type}): missing PK/SK`)
  if (('GSI1PK' in i) !== ('GSI1SK' in i)) problems.push(`#${n} (${i.type}): GSI1PK/GSI1SK must be set together`)
  if (!i.type || !i.createdAt || !i.updatedAt) problems.push(`#${n} (${i.type}): missing type/createdAt/updatedAt`)
  const size = Buffer.byteLength(JSON.stringify(i))
  if (size > 350_000) problems.push(`#${n} (${i.type}): ~${Math.round(size / 1024)} KB, over the 400 KB item limit`)
  const k = `${i.PK}|${i.SK}`
  if (keys.has(k)) problems.push(`#${n} (${i.type}): duplicate key`)
  keys.add(k)
})
if (problems.length) {
  console.error(`  ${problems.length} problem(s):\n  ` + problems.join('\n  '))
  process.exit(1)
}

const byType: Record<string, number> = {}
for (const i of items) byType[i.type] = (byType[i.type] ?? 0) + 1
console.log(`  table ${TableName}: ${items.length} items valid`, JSON.stringify(byType))

const ddb = new DynamoDBClient({ region: region() })
const table = await ddb.send(new DescribeTableCommand({ TableName }))
if (table.Table?.TableStatus !== 'ACTIVE') throw new Error(`Table ${TableName} is ${table.Table?.TableStatus}`)

const chunks: Item[][] = []
for (let i = 0; i < items.length; i += 25) chunks.push(items.slice(i, i + 25))

if (!apply) {
  console.log(`  DRY RUN — ${chunks.length} batch(es) would be written. Re-run with --apply to write.`)
  process.exit(0)
}

// ── Write ────────────────────────────────────────────────────────────────
const doc = DynamoDBDocumentClient.from(ddb, { marshallOptions: { removeUndefinedValues: true } })
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
let written = 0
for (const chunk of chunks) {
  let requests = chunk.map(Item => ({ PutRequest: { Item } }))
  for (let attempt = 0; requests.length; attempt++) {
    if (attempt > 8) throw new Error(`Gave up after retries; ${written} items written so far`)
    if (attempt) await sleep(Math.min(100 * 2 ** attempt, 5000))
    const res = await doc.send(new BatchWriteCommand({ RequestItems: { [TableName]: requests } }))
    const left = (res.UnprocessedItems?.[TableName] ?? []) as typeof requests
    written += requests.length - left.length
    requests = left
  }
}
console.log(`  written: ${written}/${items.length}`)
