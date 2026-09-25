// Uploads to S3 (it/<bucket>/) with presigned PUT URLs. Raster images are resized in the browser
// first (max 2560px long edge, WebP with JPEG fallback); PDFs and SVGs are uploaded as-is.
const MAX_EDGE = 2560
const QUALITY = 0.85

async function encode(bitmap: ImageBitmap, type: string): Promise<Blob | null> {
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, QUALITY))
  return blob && blob.type === type ? blob : null
}

async function prepare(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp|heic|heif|avif|bmp)$/.test(file.type)) return file
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => {
    throw new Error('This image format cannot be read by the browser. Use JPEG, PNG or WebP.')
  })
  try {
    return (await encode(bitmap, 'image/webp')) ?? (await encode(bitmap, 'image/jpeg')) ?? file
  } finally {
    bitmap.close()
  }
}

export interface BucketFile { name: string, key: string, url: string }

export const useStorageUpload = () => {
  const base = useRuntimeConfig().public.mediaBaseUrl

  /** Returns the new bucket-relative path (the server stores it as a CloudFront URL). */
  const uploadFile = async (bucket: string, _filePath: string, file: File): Promise<string> => {
    const blob = await prepare(file)
    const p = await $fetch<{ url: string, headers: Record<string, string>, path: string }>('/api/admin/media/presign', {
      method: 'POST', body: { bucket, contentType: blob.type, size: blob.size },
    })
    const res = await fetch(p.url, { method: 'PUT', headers: p.headers, body: blob })
    if (!res.ok) throw new Error(`Upload failed (${res.status})`)
    return p.path
  }

  const listFiles = (bucket: string) => $fetch<BucketFile[]>('/api/admin/media', { query: { bucket } })

  /** Accepts a bucket-relative path or one of our CloudFront URLs; external URLs are ignored. */
  const deleteFile = async (bucket: string, pathOrUrl: string): Promise<void> => {
    let key: string
    if (/^https?:\/\//.test(pathOrUrl)) {
      if (!base || !pathOrUrl.startsWith(`${base}/`)) return
      key = decodeURIComponent(pathOrUrl.slice(base.length + 1))
    } else {
      key = `it/${bucket}/${pathOrUrl}`
    }
    await $fetch('/api/admin/media', { method: 'DELETE', body: { key } })
  }

  return { uploadFile, listFiles, deleteFile }
}
