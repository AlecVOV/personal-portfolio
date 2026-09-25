// CloudFront URL for a key in the media bucket, e.g. mediaUrl('photo/legacy/x.jpg').
export const useMediaUrl = () => {
  const base = useRuntimeConfig().public.mediaBaseUrl
  return (key: string) => `${base}/${key.split('/').map(encodeURIComponent).join('/')}`
}
