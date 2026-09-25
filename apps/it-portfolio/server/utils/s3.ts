// S3 media under it/<bucket>/ (buckets mirror the old Supabase Storage buckets). The browser
// uploads directly with presigned PUT URLs; keys are unique so CloudFront can cache forever.
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const MEDIA_PREFIX = 'it/'
export const BUCKETS = ['avatars', 'resumes', 'cv', 'projects', 'blog-images', 'certificates', 'skills'] as const
export type Bucket = typeof BUCKETS[number]
export const FILE_TYPES: Record<string, string> = {
  'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
  'image/svg+xml': 'svg', 'application/pdf': 'pdf',
}
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
const CACHE_CONTROL = 'public, max-age=31536000, immutable'

let client: S3Client | undefined
export const s3 = () => (client ??= new S3Client({ region: useRuntimeConfig().appRegion }))
export const mediaBucket = () => useRuntimeConfig().appMediaBucket as string

export const mediaUrl = (key: string) =>
  `${useRuntimeConfig().public.mediaBaseUrl}/${key.split('/').map(encodeURIComponent).join('/')}`

export const bucketParam = (v: unknown) => oneOf(v, 'bucket', BUCKETS)

/** Image/file attribute: keep https URLs; turn a bucket-relative path into its CloudFront URL. */
export function mediaField(v: unknown, name: string, bucket: Bucket, required = false): string | undefined {
  const s = str(v, name, { required, max: 2048 })
  if (!s) return undefined
  if (/^https:\/\/[^\s<>"']+$/.test(s)) return s
  if (/^[A-Za-z0-9][A-Za-z0-9._\-/]*$/.test(s) && !s.includes('..')) return mediaUrl(`${MEDIA_PREFIX}${bucket}/${s}`)
  throw bad(`${name} is invalid`)
}

export async function presignPut(key: string, contentType: string, size: number) {
  const url = await getSignedUrl(s3(), new PutObjectCommand({
    Bucket: mediaBucket(), Key: key, ContentType: contentType, ContentLength: size, CacheControl: CACHE_CONTROL,
  }), { expiresIn: 300 })
  return { key, url, headers: { 'Content-Type': contentType, 'Cache-Control': CACHE_CONTROL }, publicUrl: mediaUrl(key) }
}

export async function listMedia(prefix: string) {
  const out: { key: string, bytes: number, lastModified: string }[] = []
  let ContinuationToken: string | undefined
  do {
    const res = await s3().send(new ListObjectsV2Command({ Bucket: mediaBucket(), Prefix: prefix, ContinuationToken }))
    for (const o of res.Contents ?? []) if (o.Key) out.push({ key: o.Key, bytes: o.Size ?? 0, lastModified: o.LastModified?.toISOString() ?? '' })
    ContinuationToken = res.NextContinuationToken
  } while (ContinuationToken)
  return out
}

export async function deleteMedia(key: string) {
  if (!key.startsWith(MEDIA_PREFIX) || key.includes('..')) throw bad('Invalid key')
  await s3().send(new DeleteObjectCommand({ Bucket: mediaBucket(), Key: key }))
}
