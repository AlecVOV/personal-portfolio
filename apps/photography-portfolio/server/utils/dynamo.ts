// DynamoDB access (single-table design, see docs/data-model.md). Credentials come from the
// Amplify compute role in production and the local AWS profile in dev — never from env keys.
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, TransactWriteCommand,
  type QueryCommandInput, type TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb'

export type DbItem = Record<string, any> & { PK: string, SK: string, type: string }

let doc: DynamoDBDocumentClient | undefined

export function ddb() {
  doc ??= DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: useRuntimeConfig().appRegion }),
    { marshallOptions: { removeUndefinedValues: true } },
  )
  return doc
}

export const tableName = () => useRuntimeConfig().appTableName as string

export async function dbGet(PK: string, SK: string): Promise<DbItem | undefined> {
  const res = await ddb().send(new GetCommand({ TableName: tableName(), Key: { PK, SK } }))
  return res.Item as DbItem | undefined
}

/** Query every page. */
export async function dbQuery(input: Omit<QueryCommandInput, 'TableName'>): Promise<DbItem[]> {
  const items: DbItem[] = []
  let ExclusiveStartKey: Record<string, any> | undefined
  do {
    const res = await ddb().send(new QueryCommand({ ...input, TableName: tableName(), ExclusiveStartKey }))
    items.push(...((res.Items ?? []) as DbItem[]))
    ExclusiveStartKey = res.LastEvaluatedKey
  } while (ExclusiveStartKey)
  return items
}

export async function dbCount(input: Omit<QueryCommandInput, 'TableName' | 'Select'>): Promise<number> {
  let count = 0
  let ExclusiveStartKey: Record<string, any> | undefined
  do {
    const res = await ddb().send(new QueryCommand({ ...input, TableName: tableName(), Select: 'COUNT', ExclusiveStartKey }))
    count += res.Count ?? 0
    ExclusiveStartKey = res.LastEvaluatedKey
  } while (ExclusiveStartKey)
  return count
}

/** Newest-first list of a sparse "published" GSI1 partition. */
export const dbPublished = (GSI1PK: string) =>
  dbQuery({ IndexName: 'GSI1', KeyConditionExpression: 'GSI1PK = :pk', ExpressionAttributeValues: { ':pk': GSI1PK }, ScanIndexForward: false })

export async function dbPut(item: DbItem, mode: 'create' | 'replace' | 'upsert' = 'upsert') {
  try {
    await ddb().send(new PutCommand({
      TableName: tableName(),
      Item: item,
      ...(mode === 'create' && { ConditionExpression: 'attribute_not_exists(PK)' }),
      ...(mode === 'replace' && { ConditionExpression: 'attribute_exists(PK)' }),
    }))
  } catch (e: any) {
    if (e?.name === 'ConditionalCheckFailedException')
      throw createError({ statusCode: mode === 'create' ? 409 : 404, message: mode === 'create' ? 'Already exists' : 'Not found' })
    throw e
  }
}

export async function dbDelete(PK: string, SK: string) {
  try {
    await ddb().send(new DeleteCommand({ TableName: tableName(), Key: { PK, SK }, ConditionExpression: 'attribute_exists(PK)' }))
  } catch (e: any) {
    if (e?.name === 'ConditionalCheckFailedException') throw createError({ statusCode: 404, message: 'Not found' })
    throw e
  }
}

type TxItem = NonNullable<TransactWriteCommandInput['TransactItems']>[number]
type TxOp =
  | { put: DbItem, create?: boolean }
  | { delete: { PK: string, SK: string } }

/** All-or-nothing write. A failed `create` condition becomes `conflictMessage` (409). */
export async function dbTransact(ops: TxOp[], conflictMessage = 'Conflict') {
  const TableName = tableName()
  const TransactItems: TxItem[] = ops.map(op => 'put' in op
    ? { Put: { TableName, Item: op.put, ...(op.create && { ConditionExpression: 'attribute_not_exists(PK)' }) } }
    : { Delete: { TableName, Key: op.delete } })
  try {
    await ddb().send(new TransactWriteCommand({ TransactItems }))
  } catch (e: any) {
    if (e?.name === 'TransactionCanceledException') throw createError({ statusCode: 409, message: conflictMessage })
    throw e
  }
}

export const nowIso = () => new Date().toISOString()

/** Set or clear the sparse GSI1 "published" keys on an item. */
export function withPublished<T extends DbItem>(item: T, GSI1PK: string, published: boolean): T {
  const { GSI1PK: _pk, GSI1SK: _sk, ...rest } = item
  return (published ? { ...rest, GSI1PK, GSI1SK: item.createdAt } : rest) as T
}

const INTERNAL = new Set(['PK', 'SK', 'GSI1PK', 'GSI1SK', 'type', 'ttl', 'createdAt', 'updatedAt', 'category_name', 'category_slug'])

/** API shape: the old Supabase row shape the Vue pages already use. */
export function toApi(item: DbItem): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(item)) if (!INTERNAL.has(k)) out[k] = v
  out.created_at = item.createdAt
  out.updated_at = item.updatedAt
  if (item.category_id) out.categories = { id: item.category_id, name: item.category_name, slug: item.category_slug }
  return out
}

export const newestFirst = (a: DbItem, b: DbItem) => String(b.createdAt).localeCompare(String(a.createdAt))
