export interface Profile {
  id: string
  full_name: string
  title: string
  bio: string | null
  avatar_url: string | null
  resume_url: string | null
  cv_url: string | null
  email_1: string | null
  email_2: string | null
  phone: string | null
  location: string | null
  map_embed: string | null
}

export interface SocialLink {
  id: string
  platform: string
  url: string
  icon_name: string | null
  sort_order: number
}

export interface Project {
  id: string
  title: string
  description: string
  image_url: string | null
  demo_url: string | null
  github_url: string
  sort_order: number
  categories?: string[]               // populated via join
  project_categories?: { category: string }[]  // raw Supabase shape
}

export interface Skill {
  id: string
  name: string
  icon_url: string
  sort_order: number
}

export interface Education {
  id: string
  degree: string
  school: string
  year: string
  description: string | null
  sort_order: number
}

export interface Experience {
  id: string
  title: string
  company: string
  period: string
  description: string | null
  sort_order: number
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  link: string
  badge_url: string | null
  sort_order: number
}

export interface Field {
  id: string
  title: string
  description: string
  sort_order: number
}


export interface BlogPost {
  title: string
  excerpt: string
  image: string
  date: string
  category: string
  url?: string
}

export interface BlogPostDB {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  image_url: string | null
  category: string | null
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ContactForm {
  name: string
  email: string
  message: string
}

// Form validation types
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// Navigation types
export type Section = 'About' | 'Resume' | 'Portfolio' | 'Blog' | 'Contact'

// API response types
export interface FormSubmissionResponse {
  success: boolean
  message: string
}

// Error types
export interface AppError {
  message: string
  code?: string
  details?: any
}

export interface ContactForm {
  name: string
  email: string
  message: string
}
