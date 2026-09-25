// Browser-side resize (no image Lambda) + direct upload to S3 via presigned PUT URLs.
// Full image: max 2560px long edge; thumbnail: max 800px. WebP, falling back to JPEG.
const FULL_EDGE = 2560
const THUMB_EDGE = 800
const QUALITY = 0.85

interface Presigned { key: string, url: string, headers: Record<string, string>, publicUrl: string }

async function encode(bitmap: ImageBitmap, maxEdge: number, type: string): Promise<Blob | null> {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, QUALITY))
  return blob && blob.type === type ? blob : null
}

async function resize(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => {
    throw new Error('This image format cannot be read by the browser. Use JPEG, PNG or WebP.')
  })
  try {
    for (const type of ['image/webp', 'image/jpeg']) {
      const full = await encode(bitmap, FULL_EDGE, type)
      const thumb = full && await encode(bitmap, THUMB_EDGE, type)
      if (full && thumb) return { full, thumb, type }
    }
    throw new Error('Could not resize the image in this browser.')
  } finally {
    bitmap.close()
  }
}

async function put(target: Presigned, blob: Blob) {
  const res = await fetch(target.url, { method: 'PUT', headers: target.headers, body: blob })
  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
}

export const useImageUpload = () => {
  const uploading = ref(false)

  /** Resize + upload one image. Returns the CloudFront URLs. */
  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
    uploading.value = true
    try {
      const { full, thumb, type } = await resize(file)
      const p = await $fetch<{ full: Presigned, thumb?: Presigned }>('/api/media/presign', {
        method: 'POST', body: { contentType: type, size: full.size, thumbSize: thumb.size },
      })
      await Promise.all([put(p.full, full), p.thumb && put(p.thumb, thumb)])
      return { key: p.full.key, url: p.full.publicUrl, thumbUrl: p.thumb?.publicUrl ?? p.full.publicUrl }
    } finally {
      uploading.value = false
    }
  }

  return { upload, uploading }
}
