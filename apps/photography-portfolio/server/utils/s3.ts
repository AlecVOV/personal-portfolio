// S3 media under the app's own prefix. The browser uploads directly with presigned PUT URLs.
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const MEDIA_PREFIX = 'photo/'
export const UPLOAD_PREFIX = 'photo/uploads/'
export const IMAGE_TYPES: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif' }
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024
const CACHE_CONTROL = 'public, max-age=31536000, immutable'

let client: S3Client | undefined
export const s3 = () => (client ??= new S3Client({ region: useRuntimeConfig().appRegion }))
export const mediaBucket = () => useRuntimeConfig().appMediaBucket as string

export const mediaUrl = (key: string) =>
  `${useRuntimeConfig().public.mediaBaseUrl}/${key.split('/').map(encodeURIComponent).join('/')}`

export interface PresignedUpload { key: string, url: string, headers: Record<string, string>, publicUrl: string }

/** Presigned PUT; the browser must send exactly `headers`. */
export async function presignPut(key: string, contentType: string, size: number): Promise<PresignedUpload> {
  if (!key.startsWith(UPLOAD_PREFIX)) throw createError({ statusCode: 400, message: 'Invalid key' })
  const url = await getSignedUrl(s3(), new PutObjectCommand({
    Bucket: mediaBucket(), Key: key, ContentType: contentType, ContentLength: size, CacheControl: CACHE_CONTROL,
  }), { expiresIn: 300 })
  return { key, url, headers: { 'Content-Type': contentType, 'Cache-Control': CACHE_CONTROL }, publicUrl: mediaUrl(key) }
}

export async function listMedia() {
  const out: { key: string, bytes: number, lastModified: string }[] = []
  let ContinuationToken: string | undefined
  do {
    const res = await s3().send(new ListObjectsV2Command({ Bucket: mediaBucket(), Prefix: MEDIA_PREFIX, ContinuationToken }))
    for (const o of res.Contents ?? []) if (o.Key) out.push({ key: o.Key, bytes: o.Size ?? 0, lastModified: o.LastModified?.toISOString() ?? '' })
    ContinuationToken = res.NextContinuationToken
  } while (ContinuationToken)
  return out
}

export async function deleteMedia(key: string) {
  if (!key.startsWith(MEDIA_PREFIX) || key.includes('..')) throw createError({ statusCode: 400, message: 'Invalid key' })
  await s3().send(new DeleteObjectCommand({ Bucket: mediaBucket(), Key: key }))
}

/** "photo/uploads/2026/abc.webp" -> "photo/uploads/2026/abc.thumb.webp" */
export const thumbKeyFor = (key: string) => key.replace(/(\.[a-z0-9]+)$/i, '.thumb$1')
