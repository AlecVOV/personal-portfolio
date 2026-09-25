// Public site data from the server API (DynamoDB behind /api/*).
import type { Profile, SocialLink, Project, Skill, Education, Experience, Certification, Field, BlogPostDB } from '~/types/portfolio'

export interface SiteData {
  profile: Profile | null
  socialLinks: SocialLink[]
  fields: Field[]
  education: Education[]
  experience: Experience[]
  skills: Skill[]
  certifications: Certification[]
  projects: Project[]
}

export const useSiteData = () => {
  const base = useRuntimeConfig().public.mediaBaseUrl

  /** Every home-page section in one request (one DynamoDB Query). */
  const fetchSite = () => $fetch<SiteData>('/api/site')

  const fetchBlogPosts = (): Promise<BlogPostDB[]> =>
    $fetch<BlogPostDB[]>('/api/blog').catch((error) => {
      console.error('Error fetching blog posts:', error)
      return []
    })

  const fetchBlogPostBySlug = (slug: string): Promise<BlogPostDB | null> =>
    $fetch<BlogPostDB>(`/api/blog/${encodeURIComponent(slug)}`).catch(() => null)

  /** Full URLs pass through; bucket-relative paths map to it/<bucket>/<path> on CloudFront. */
  const getPublicUrl = (bucket: string, path: string): string => {
    if (!path) return ''
    if (/^https?:\/\//.test(path)) return path
    return `${base}/it/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`
  }

  return { fetchSite, fetchBlogPosts, fetchBlogPostBySlug, getPublicUrl }
}
