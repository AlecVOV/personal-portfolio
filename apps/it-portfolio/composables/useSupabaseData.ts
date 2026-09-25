// composables/useSupabaseData.ts
import type { Profile, SocialLink, Project, Skill, Education, Experience, Certification, Field, BlogPostDB } from '~/types/portfolio'

export const useSupabaseData = () => {
  const client = useSupabaseClient()

  const fetchBlogPosts = async (): Promise<BlogPostDB[]> => {
  const { data, error } = await client
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (error) { console.error('Error fetching blog posts:', error); return [] }
    return data as BlogPostDB[]
  }

  const fetchBlogPostBySlug = async (slug: string): Promise<BlogPostDB | null> => {
    const { data, error } = await client
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error) { console.error('Error fetching blog post:', error); return null }
    return data as BlogPostDB
  }

  // ── Profile (singleton) ──────────────────────────
  const fetchProfile = async (): Promise<Profile | null> => {
    const { data, error } = await client
      .from('profile')
      .select('*')
      .single()

    if (error) { console.error('Error fetching profile:', error); return null }
    return data as Profile
  }

  // ── Social Links ─────────────────────────────────
  const fetchSocialLinks = async (): Promise<SocialLink[]> => {
    const { data, error } = await client
      .from('social_links')
      .select('*')
      .order('sort_order')

    if (error) { console.error('Error fetching social links:', error); return [] }
    return data as SocialLink[]
  }

  // ── Fields of Interest ───────────────────────────
  const fetchFields = async (): Promise<Field[]> => {
    const { data, error } = await client
      .from('fields')
      .select('*')
      .order('sort_order')

    if (error) { console.error('Error fetching fields:', error); return [] }
    return data as Field[]
  }

  // ── Education ────────────────────────────────────
  const fetchEducation = async (): Promise<Education[]> => {
    const { data, error } = await client
      .from('education')
      .select('*')
      .order('sort_order')

    if (error) { console.error('Error fetching education:', error); return [] }
    return data as Education[]
  }

  // ── Experience ───────────────────────────────────
  const fetchExperience = async (): Promise<Experience[]> => {
    const { data, error } = await client
      .from('experience')
      .select('*')
      .order('sort_order')

    if (error) { console.error('Error fetching experience:', error); return [] }
    return data as Experience[]
  }

  // ── Skills ───────────────────────────────────────
  const fetchSkills = async (): Promise<Skill[]> => {
    const { data, error } = await client
      .from('skills')
      .select('*')
      .order('sort_order')

    if (error) { console.error('Error fetching skills:', error); return [] }
    return data as Skill[]
  }

  // ── Certifications ──────────────────────────────
  const fetchCertifications = async (): Promise<Certification[]> => {
    const { data, error } = await client
      .from('certifications')
      .select('*')
      .order('sort_order')

    if (error) { console.error('Error fetching certifications:', error); return [] }
    return data as Certification[]
  }

  // ── Projects (with categories join) ─────────────
  const fetchProjects = async (): Promise<Project[]> => {
    const { data, error } = await client
      .from('projects')
      .select(`
        *,
        project_categories ( category )
      `)
      .order('sort_order')

    if (error) { console.error('Error fetching projects:', error); return [] }

    // Flatten the joined categories into a string array
    return (data as Project[]).map(p => ({
      ...p,
      categories: p.project_categories?.map(pc => pc.category) ?? [],
    }))
  }

  

  // ── Storage URL helper ──────────────────────────
  const getPublicUrl = (bucket: string, path: string): string => {
    const { data } = client.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  return {
    fetchProfile,
    fetchSocialLinks,
    fetchFields,
    fetchEducation,
    fetchExperience,
    fetchSkills,
    fetchCertifications,
    fetchProjects,
    fetchBlogPosts,
    fetchBlogPostBySlug,
    getPublicUrl,
  }
}