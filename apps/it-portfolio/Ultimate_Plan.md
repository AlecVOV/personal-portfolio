# Ultimate Plan: Supabase CMS Migration for Nuxt 3 Portfolio

> **Author:** Alec Le  
> **Date:** March 31, 2026  
> **Last Updated:** April 1, 2026 (Phase 4 Complete)  
> **Stack:** Nuxt 3 · Vue 3 Composition API · Supabase (PostgreSQL + Storage + Auth) · Tailwind CSS  
> **Scope:** Migrate all hardcoded portfolio data to Supabase, build an admin CMS, keep `@nuxt/content` for the blog.  
> **Admin UUID:** `90e9161b-8e88-42b0-9c61-4b1ee9f6e750`

### Progress Overview

| Phase | Status | Completed On |
|-------|--------|--------------|
| Phase 1: Database & Storage Architecture | ✅ **COMPLETE** | April 1, 2026 |
| Phase 2: Nuxt & Supabase Integration | ✅ **COMPLETE** | April 1, 2026 |
| Phase 3: Authentication & Security | ✅ **COMPLETE** | April 1, 2026 |
| Phase 4: Admin CMS UI Development | ✅ **COMPLETE** | April 1, 2026 |
| Phase 4.5: Blog CMS (Supabase Migration) | ✅ Complete | — |
| Phase 5: Deployment & CI/CD | ⬜ Not Started | — |

---

## Table of Contents

1. [Phase 1: Database & Storage Architecture](#phase-1-database--storage-architecture)
2. [Phase 2: Nuxt & Supabase Integration](#phase-2-nuxt--supabase-integration)
3. [Phase 3: Authentication & Security](#phase-3-authentication--security)
4. [Phase 4: Admin CMS UI Development](#phase-4-admin-cms-ui-development)
5. [Phase 4.5: Blog CMS (Supabase Migration)](#phase-45-blog-cms-supabase-migration)
6. [Phase 5: Deployment & CI/CD](#phase-5-deployment--cicd)
7. [Appendix: File Tree After Migration](#appendix-file-tree-after-migration)

---

## Phase 1: Database & Storage Architecture ✅ COMPLETE

### 1.1 Entity-Relationship Overview

```
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│   profile     │    │   fields     │    │   education      │
│ (singleton)   │    │              │    │                  │
└──────────────┘    └──────────────┘    └──────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│  experience   │    │   skills     │    │  certifications  │
│              │    │              │    │                  │
└──────────────┘    └──────────────┘    └──────────────────┘

┌──────────────┐    ┌──────────────────────┐
│   projects   │───<│  project_categories  │ (junction table)
│              │    └──────────────────────┘
└──────────────┘

┌──────────────┐
│ social_links │
└──────────────┘
```

### 1.2 SQL — Create Tables

Run these in order in **Supabase SQL Editor** (Dashboard → SQL Editor → New Query).

```sql
-- ============================================================
-- 1. PROFILE (singleton — one row for the site owner)
-- ============================================================
CREATE TABLE public.profile (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT NOT NULL,            -- 'Alec Le'
  title      TEXT NOT NULL,            -- 'Machine Learning Engineer'
  bio        TEXT,                      -- About Me paragraph(s), supports markdown/HTML
  avatar_url TEXT,                      -- Supabase Storage path
  resume_url TEXT,                      -- Supabase Storage path to PDF
  email_1    TEXT,
  email_2    TEXT,
  phone      TEXT,
  location   TEXT,
  map_embed  TEXT,                      -- Google Maps iframe src
  cv_url     TEXT,                      -- Supabase Storage path to CV PDF
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. SOCIAL LINKS
-- ============================================================
CREATE TABLE public.social_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform   TEXT NOT NULL,            -- 'LinkedIn', 'Photography', 'GitHub'
  url        TEXT NOT NULL,
  icon_name  TEXT,                      -- component name reference, e.g. 'IconLinkedin'
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. FIELDS OF INTEREST
-- ============================================================
CREATE TABLE public.fields (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. EDUCATION
-- ============================================================
CREATE TABLE public.education (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  degree      TEXT NOT NULL,
  school      TEXT NOT NULL,
  year        TEXT NOT NULL,            -- '2022-2026'
  description TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. EXPERIENCE
-- ============================================================
CREATE TABLE public.experience (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  company     TEXT NOT NULL,
  period      TEXT NOT NULL,            -- '2025 - Now'
  description TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. SKILLS
-- ============================================================
CREATE TABLE public.skills (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  icon_url   TEXT NOT NULL,             -- CDN URL or Supabase Storage path
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. CERTIFICATIONS
-- ============================================================
CREATE TABLE public.certifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  issuer      TEXT NOT NULL,
  date        TEXT NOT NULL,            -- 'April 2024'
  link        TEXT NOT NULL,
  badge_url   TEXT,                     -- Optional badge image in Storage
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. PROJECTS
-- ============================================================
CREATE TABLE public.projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url   TEXT,                     -- Supabase Storage path for thumbnail
  demo_url    TEXT,
  github_url  TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. PROJECT CATEGORIES (junction / many-to-many)
-- ============================================================
CREATE TABLE public.project_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category   TEXT NOT NULL              -- 'Machine Learning', 'Data Visualization', etc.
);

CREATE INDEX idx_project_categories_project ON public.project_categories(project_id);
CREATE INDEX idx_project_categories_name    ON public.project_categories(category);

-- ============================================================
-- 10. HELPER: Auto-update `updated_at` trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profile
  BEFORE UPDATE ON public.profile
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_projects
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### 1.3 SQL — Row Level Security (RLS)

**Policy model:**
- **Public (anon):** `SELECT` only.
- **Authenticated admin:** Full `SELECT`, `INSERT`, `UPDATE`, `DELETE`.

We match the admin by their fixed `auth.uid()`. The admin UUID has been set to `90e9161b-8e88-42b0-9c61-4b1ee9f6e750`.

```sql
-- ============================================================
-- Enable RLS on every table
-- ============================================================
ALTER TABLE public.profile            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- MACRO: Create policies for a table
-- We'll write them explicitly for clarity.
-- ============================================================

-- Admin UUID: 90e9161b-8e88-42b0-9c61-4b1ee9f6e750

-- ---------- profile ----------
CREATE POLICY "Public read profile"  ON public.profile FOR SELECT                  USING (true);
CREATE POLICY "Admin full profile"   ON public.profile FOR ALL    TO authenticated USING (auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

-- ---------- social_links ----------
CREATE POLICY "Public read social"   ON public.social_links FOR SELECT                  USING (true);
CREATE POLICY "Admin full social"    ON public.social_links FOR ALL    TO authenticated USING (auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

-- ---------- fields ----------
CREATE POLICY "Public read fields"   ON public.fields FOR SELECT                  USING (true);
CREATE POLICY "Admin full fields"    ON public.fields FOR ALL    TO authenticated USING (auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

-- ---------- education ----------
CREATE POLICY "Public read edu"      ON public.education FOR SELECT                  USING (true);
CREATE POLICY "Admin full edu"       ON public.education FOR ALL    TO authenticated USING (auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

-- ---------- experience ----------
CREATE POLICY "Public read exp"      ON public.experience FOR SELECT                  USING (true);
CREATE POLICY "Admin full exp"       ON public.experience FOR ALL    TO authenticated USING (auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

-- ---------- skills ----------
CREATE POLICY "Public read skills"   ON public.skills FOR SELECT                  USING (true);
CREATE POLICY "Admin full skills"    ON public.skills FOR ALL    TO authenticated USING (auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

-- ---------- certifications ----------
CREATE POLICY "Public read certs"    ON public.certifications FOR SELECT                  USING (true);
CREATE POLICY "Admin full certs"     ON public.certifications FOR ALL    TO authenticated USING (auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

-- ---------- projects ----------
CREATE POLICY "Public read projects" ON public.projects FOR SELECT                  USING (true);
CREATE POLICY "Admin full projects"  ON public.projects FOR ALL    TO authenticated USING (auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

-- ---------- project_categories ----------
CREATE POLICY "Public read cats"     ON public.project_categories FOR SELECT                  USING (true);
CREATE POLICY "Admin full cats"      ON public.project_categories FOR ALL    TO authenticated USING (auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);
```

> **Note — Role-based alternative:** Instead of hardcoding your UUID, create a `user_roles` table and match against `role = 'admin'`. For a single-user portfolio this is overkill, but it scales if needed.

### 1.4 SQL — Supabase Storage Buckets

```sql
-- Run in the SQL Editor or create via Dashboard → Storage → New Bucket

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',     'avatars',     true),   -- profile avatar
  ('resumes',     'resumes',     true),   -- resume PDF
  ('projects',    'projects',    true),   -- project thumbnails
  ('certificates','certificates',true),   -- cert badge images
  ('cv',          'cv',          true);   -- CV PDF documents
```

**Storage RLS policies (per bucket):**

```sql
-- === AVATARS BUCKET ===
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Admin upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

CREATE POLICY "Admin update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

CREATE POLICY "Admin delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

-- === RESUMES BUCKET ===
CREATE POLICY "Public read resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes');

CREATE POLICY "Admin upload resumes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

CREATE POLICY "Admin update resumes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

CREATE POLICY "Admin delete resumes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

-- === PROJECTS BUCKET ===
CREATE POLICY "Public read projects media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'projects');

CREATE POLICY "Admin upload projects media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'projects' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

CREATE POLICY "Admin update projects media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'projects' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

CREATE POLICY "Admin delete projects media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'projects' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

-- === CERTIFICATES BUCKET ===
CREATE POLICY "Public read certificates media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');

CREATE POLICY "Admin upload certificates media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'certificates' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

CREATE POLICY "Admin update certificates media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'certificates' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

CREATE POLICY "Admin delete certificates media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'certificates' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

-- === CV BUCKET ===
CREATE POLICY "Public read cv"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cv');

CREATE POLICY "Admin upload cv"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cv' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

CREATE POLICY "Admin update cv"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'cv' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);

CREATE POLICY "Admin delete cv"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cv' AND auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid);
```

### 1.5 Seed Data ✅ COMPLETE

All existing hardcoded data from `usePortfolioData.ts` has been migrated to Supabase via SQL INSERT statements. The full seed SQL is saved in `supabase/sql_command.sql`.

**Data seeded:**

| Table | Records |
|-------|--------:|
| `profile` | 1 (singleton — Alec Le) |
| `social_links` | 3 (LinkedIn, Photography, Resume) |
| `fields` | 4 (ML, Data Science, Software Eng, Cloud) |
| `education` | 1 (RMIT University, 2022-2026) |
| `experience` | 2 (ML Engineer Intern, Student Tutor) |
| `skills` | 9 (Python, TensorFlow, PyTorch, etc.) |
| `certifications` | 17 (Google, IBM, DeepLearning.AI, etc.) |
| `projects` | 15 (with 21 category associations) |
| **Total** | **52 rows + 21 junction rows** |

**Storage buckets created:** `avatars`, `resumes`, `projects`, `certificates`, `cv` (5 buckets, all public, with admin-only write RLS).

> **Reference:** Full SQL commands are preserved in `supabase/sql_command.sql` for reproducibility.

---

## Phase 2: Nuxt & Supabase Integration ✅ COMPLETE

### 2.1 Install Dependencies

```bash
npm install @nuxtjs/supabase
```

### 2.2 Configure `nuxt.config.ts`

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@nuxtjs/supabase',  // <-- ADD
  ],

  // Supabase module config
  supabase: {
    redirect: false,  // We handle redirects manually via middleware
    redirectOptions: {
      login: '/admin/login',
      callback: '/admin/confirm',
      exclude: ['/', '/blog/*'],  // Public pages don't trigger auth redirects
    },
  },

  // ... rest of your existing config unchanged ...
})
```

### 2.3 Environment Variables

Create/update `.env`:

```env
# Supabase (required by @nuxtjs/supabase)
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...           # anon/public key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... # ONLY for server-side seed scripts, never expose

# Existing keys...
NUXT_PUBLIC_SITE_URL=https://your-domain.com
NUXT_SITE_NAME=Le Hoang Triet Thong Portfolio
# ...
```

> The `@nuxtjs/supabase` module auto-reads `SUPABASE_URL` and `SUPABASE_KEY`. No manual `runtimeConfig` wiring needed.

### 2.4 Updated TypeScript Types

```ts
// types/portfolio.ts — updated with DB-aligned types

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

// Keep existing types: ContactForm, ValidationResult, Section, etc.
```

### 2.5 Composables Architecture

Create **two** composable layers:

1. **`composables/useSupabaseData.ts`** — Public data fetching (read-only, cached).
2. **`composables/useAdminCrud.ts`** — Admin CRUD operations (authenticated, write).

#### 2.5.1 `useSupabaseData.ts` — Public Data Fetching

```ts
// composables/useSupabaseData.ts
import type { Profile, SocialLink, Project, Skill, Education, Experience, Certification, Field } from '~/types/portfolio'

export const useSupabaseData = () => {
  const client = useSupabaseClient()

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
    getPublicUrl,
  }
}
```

#### 2.5.2 Usage in `pages/index.vue` (replacing hardcoded data)

```vue
<script setup lang="ts">
// Replaces: const { fields, education, ... } = usePortfolioData()
const {
  fetchProfile,
  fetchSocialLinks,
  fetchFields,
  fetchEducation,
  fetchExperience,
  fetchSkills,
  fetchCertifications,
  fetchProjects,
  getPublicUrl,
} = useSupabaseData()

// Parallel data fetching with useAsyncData for SSR + caching
const { data: profile }        = await useAsyncData('profile',        fetchProfile)
const { data: socialLinks }    = await useAsyncData('socialLinks',    fetchSocialLinks)
const { data: fields }         = await useAsyncData('fields',         fetchFields)
const { data: education }      = await useAsyncData('education',      fetchEducation)
const { data: experience }     = await useAsyncData('experience',     fetchExperience)
const { data: skills }         = await useAsyncData('skills',         fetchSkills)
const { data: certifications } = await useAsyncData('certifications', fetchCertifications)
const { data: projects }       = await useAsyncData('projects',       fetchProjects)

// Computed: extract unique categories from DB projects
const projectCategories = computed(() => {
  const cats = new Set<string>()
  projects.value?.forEach(p => p.categories?.forEach(c => cats.add(c)))
  return [...cats].sort()
})
</script>
```

#### 2.5.3 `useAdminCrud.ts` — Admin CRUD Operations

```ts
// composables/useAdminCrud.ts
export const useAdminCrud = <T extends Record<string, any>>(tableName: string) => {
  const client = useSupabaseClient()

  const getAll = async (orderBy = 'sort_order'): Promise<T[]> => {
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .order(orderBy)
    if (error) throw error
    return data as T[]
  }

  const getById = async (id: string): Promise<T | null> => {
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as T
  }

  const create = async (record: Partial<T>): Promise<T> => {
    const { data, error } = await client
      .from(tableName)
      .insert(record)
      .select()
      .single()
    if (error) throw error
    return data as T
  }

  const update = async (id: string, record: Partial<T>): Promise<T> => {
    const { data, error } = await client
      .from(tableName)
      .update(record)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as T
  }

  const remove = async (id: string): Promise<void> => {
    const { error } = await client
      .from(tableName)
      .delete()
      .eq('id', id)
    if (error) throw error
  }

  return { getAll, getById, create, update, remove }
}
```

#### 2.5.4 `useStorageUpload.ts` — File Upload Helper

```ts
// composables/useStorageUpload.ts
export const useStorageUpload = () => {
  const client = useSupabaseClient()

  /**
   * Upload a file to a Supabase Storage bucket.
   * Returns the public URL on success.
   */
  const uploadFile = async (
    bucket: string,
    filePath: string,
    file: File
  ): Promise<string> => {
    // Upsert: overwrite if same path exists
    const { error } = await client.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true })

    if (error) throw error

    const { data } = client.storage.from(bucket).getPublicUrl(filePath)
    return data.publicUrl
  }

  const deleteFile = async (bucket: string, filePath: string): Promise<void> => {
    const { error } = await client.storage
      .from(bucket)
      .remove([filePath])
    if (error) throw error
  }

  return { uploadFile, deleteFile }
}
```

---

## Phase 3: Authentication & Security ✅ COMPLETE

### 3.1 Create Admin Account ✅ DONE (in Phase 1)

Admin account already created. UUID `90e9161b-8e88-42b0-9c61-4b1ee9f6e750` is set in all RLS policies.

> **Important:** Do **not** enable public sign-ups. Go to **Authentication → Settings → Auth Providers** and disable "Allow new users to sign up" so the login page only works for your pre-created account.

### 3.2 Login Page

```
pages/
  admin/
    login.vue      ← Public login form
    index.vue      ← CMS dashboard (protected)
    projects.vue   ← CRUD for projects (protected)
    ...
```

```vue
<!-- pages/admin/login.vue -->
<template>
  <div class="min-h-screen bg-eerie-black flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-gradient-jet rounded-2xl p-8 shadow-xl">
      <h1 class="text-2xl font-bold text-white text-center mb-6">Admin Login</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-sm text-gray-300 mb-1">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-yellow"
          />
        </div>

        <div>
          <label for="password" class="block text-sm text-gray-300 mb-1">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-yellow"
          />
        </div>

        <p v-if="errorMsg" class="text-red-400 text-sm">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-orange-yellow text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })   // No sidebar/nav for login page

const client = useSupabaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMsg.value = error.message
    loading.value = false
    return
  }

  await navigateTo('/admin')
}
</script>
```

### 3.3 Auth Middleware (Route Guard)

```ts
// middleware/admin-auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()

  // If not authenticated, redirect to login
  if (!user.value) {
    return navigateTo('/admin/login')
  }
})
```

Apply the middleware to all admin pages **except** login:

```vue
<!-- pages/admin/index.vue (and all other admin pages) -->
<script setup lang="ts">
definePageMeta({
  middleware: ['admin-auth'],
  layout: 'admin',              // Use a dedicated admin layout
})
</script>
```

### 3.4 Admin Layout

```vue
<!-- layouts/admin.vue -->
<template>
  <div class="min-h-screen bg-eerie-black text-white">
    <!-- Admin Top Bar -->
    <header class="bg-gradient-jet border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin" class="text-xl font-bold text-orange-yellow">
          CMS Dashboard
        </NuxtLink>
        <nav class="hidden md:flex gap-4 text-sm">
          <NuxtLink to="/admin/profile"        class="hover:text-orange-yellow transition-colors">Profile</NuxtLink>
          <NuxtLink to="/admin/projects"       class="hover:text-orange-yellow transition-colors">Projects</NuxtLink>
          <NuxtLink to="/admin/certifications" class="hover:text-orange-yellow transition-colors">Certifications</NuxtLink>
          <NuxtLink to="/admin/experience"     class="hover:text-orange-yellow transition-colors">Experience</NuxtLink>
          <NuxtLink to="/admin/education"      class="hover:text-orange-yellow transition-colors">Education</NuxtLink>
          <NuxtLink to="/admin/skills"         class="hover:text-orange-yellow transition-colors">Skills</NuxtLink>
          <NuxtLink to="/admin/fields"         class="hover:text-orange-yellow transition-colors">Fields</NuxtLink>
          <NuxtLink to="/admin/social-links"   class="hover:text-orange-yellow transition-colors">Social Links</NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <NuxtLink to="/" target="_blank" class="text-sm text-gray-400 hover:text-white">
          View Site ↗
        </NuxtLink>
        <button @click="handleLogout" class="text-sm text-red-400 hover:text-red-300">
          Sign Out
        </button>
      </div>
    </header>

    <!-- Page Content -->
    <main class="p-6 md:p-8 max-w-7xl mx-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()

const handleLogout = async () => {
  await client.auth.signOut()
  await navigateTo('/admin/login')
}
</script>
```

---

## Phase 4: Admin CMS UI Development

### 4.1 Page Structure

```
pages/admin/
  login.vue              ← Phase 3 (public)
  index.vue              ← Dashboard overview
  profile.vue            ← Edit profile (singleton form)
  projects.vue           ← Projects list + CRUD
  certifications.vue     ← Certifications list + CRUD
  experience.vue         ← Experience list + CRUD
  education.vue          ← Education list + CRUD
  skills.vue             ← Skills list + CRUD
  fields.vue             ← Fields list + CRUD
  social-links.vue       ← Social links list + CRUD
```

### 4.2 Reusable Admin Components

```
components/admin/
  DataTable.vue          ← Generic sortable table with edit/delete actions
  FormModal.vue          ← Slide-over or modal wrapping a <form>
  FileUpload.vue         ← Drag & drop file upload component
  ConfirmDialog.vue      ← "Are you sure?" confirmation modal
  SortHandle.vue         ← Drag handle for reordering sort_order
```

### 4.3 Example: Projects CRUD Page

```vue
<!-- pages/admin/projects.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Projects</h1>
      <button
        @click="openCreate"
        class="px-4 py-2 bg-orange-yellow text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        + Add Project
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-gray-400">Loading projects...</div>

    <!-- Projects Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="text-xs text-gray-400 uppercase border-b border-gray-700">
          <tr>
            <th class="px-4 py-3">Order</th>
            <th class="px-4 py-3">Image</th>
            <th class="px-4 py-3">Title</th>
            <th class="px-4 py-3">Categories</th>
            <th class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="project in projects" :key="project.id" class="hover:bg-jet/50">
            <td class="px-4 py-3 text-gray-400">{{ project.sort_order }}</td>
            <td class="px-4 py-3">
              <img
                v-if="project.image_url"
                :src="getPublicUrl('projects', project.image_url)"
                class="w-16 h-12 object-cover rounded"
                :alt="project.title"
              />
              <span v-else class="text-gray-600">No image</span>
            </td>
            <td class="px-4 py-3 font-medium">{{ project.title }}</td>
            <td class="px-4 py-3">
              <span
                v-for="cat in project.categories"
                :key="cat"
                class="inline-block px-2 py-0.5 mr-1 mb-1 text-xs bg-gray-700 rounded"
              >
                {{ cat }}
              </span>
            </td>
            <td class="px-4 py-3 space-x-2">
              <button @click="openEdit(project)" class="text-blue-400 hover:text-blue-300">Edit</button>
              <button @click="confirmDelete(project)" class="text-red-400 hover:text-red-300">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        @click.self="showModal = false"
      >
        <div class="bg-gradient-jet rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold mb-4">
            {{ isEditing ? 'Edit Project' : 'New Project' }}
          </h2>

          <form @submit.prevent="handleSave" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Title *</label>
              <input v-model="form.title" required
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>

            <div>
              <label class="block text-sm text-gray-300 mb-1">Description *</label>
              <textarea v-model="form.description" required rows="3"
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-300 mb-1">GitHub URL *</label>
                <input v-model="form.github_url" type="url" required
                  class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
              </div>
              <div>
                <label class="block text-sm text-gray-300 mb-1">Demo URL</label>
                <input v-model="form.demo_url" type="url"
                  class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
              </div>
            </div>

            <div>
              <label class="block text-sm text-gray-300 mb-1">Categories (comma-separated)</label>
              <input v-model="categoriesInput" placeholder="Machine Learning, Data Visualization"
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>

            <div>
              <label class="block text-sm text-gray-300 mb-1">Thumbnail Image</label>
              <input type="file" accept="image/*" @change="handleFileSelect"
                class="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-yellow file:text-white hover:file:bg-orange-600" />
              <img
                v-if="previewUrl"
                :src="previewUrl"
                class="mt-2 w-32 h-24 object-cover rounded"
                alt="Preview"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-300 mb-1">Sort Order</label>
              <input v-model.number="form.sort_order" type="number" min="0"
                class="w-full px-4 py-2 bg-jet rounded-lg text-white focus:ring-2 focus:ring-orange-yellow focus:outline-none" />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="showModal = false"
                class="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="saving"
                class="px-4 py-2 bg-orange-yellow rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/portfolio'

definePageMeta({
  middleware: ['admin-auth'],
  layout: 'admin',
})

const { getAll, create, update, remove } = useAdminCrud<Project>('projects')
const { uploadFile, deleteFile } = useStorageUpload()
const { getPublicUrl } = useSupabaseData()
const client = useSupabaseClient()

// ── State ──────────────────────────────────────────
const projects = ref<Project[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  title: '',
  description: '',
  github_url: '',
  demo_url: '',
  sort_order: 0,
})
const categoriesInput = ref('')
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

// ── Load Data ──────────────────────────────────────
const loadProjects = async () => {
  loading.value = true
  // Fetch with categories
  const { data, error } = await client
    .from('projects')
    .select('*, project_categories(category)')
    .order('sort_order')

  if (!error && data) {
    projects.value = data.map((p: any) => ({
      ...p,
      categories: p.project_categories?.map((pc: any) => pc.category) ?? [],
    }))
  }
  loading.value = false
}

await loadProjects()

// ── Modal Helpers ──────────────────────────────────
const resetForm = () => {
  form.title = ''
  form.description = ''
  form.github_url = ''
  form.demo_url = ''
  form.sort_order = 0
  categoriesInput.value = ''
  selectedFile.value = null
  previewUrl.value = null
  editingId.value = null
}

const openCreate = () => {
  resetForm()
  isEditing.value = false
  showModal.value = true
}

const openEdit = (project: Project) => {
  isEditing.value = true
  editingId.value = project.id
  form.title = project.title
  form.description = project.description
  form.github_url = project.github_url
  form.demo_url = project.demo_url ?? ''
  form.sort_order = project.sort_order
  categoriesInput.value = project.categories?.join(', ') ?? ''
  previewUrl.value = project.image_url ? getPublicUrl('projects', project.image_url) : null
  showModal.value = true
}

// ── File Handling ──────────────────────────────────
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

// ── Save (Create or Update) ────────────────────────
const handleSave = async () => {
  saving.value = true
  try {
    let imageUrl: string | undefined

    // Upload image if a new file was selected
    if (selectedFile.value) {
      const timestamp = Date.now()
      const safeName = selectedFile.value.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `${timestamp}-${safeName}`
      await uploadFile('projects', filePath, selectedFile.value)
      imageUrl = filePath   // Store the relative path, not the full URL
    }

    const record: Record<string, any> = {
      title: form.title,
      description: form.description,
      github_url: form.github_url,
      demo_url: form.demo_url || null,
      sort_order: form.sort_order,
    }
    if (imageUrl) record.image_url = imageUrl

    let projectId: string

    if (isEditing.value && editingId.value) {
      await update(editingId.value, record)
      projectId = editingId.value
    } else {
      const created = await create(record)
      projectId = created.id
    }

    // ── Sync categories ────────────────────────────
    // Delete existing categories and re-insert
    await client.from('project_categories').delete().eq('project_id', projectId)

    const categories = categoriesInput.value
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)

    if (categories.length > 0) {
      await client.from('project_categories').insert(
        categories.map(category => ({ project_id: projectId, category }))
      )
    }

    showModal.value = false
    await loadProjects()
  } catch (err) {
    console.error('Save error:', err)
    alert('Failed to save project. Check the console for details.')
  } finally {
    saving.value = false
  }
}

// ── Delete ─────────────────────────────────────────
const confirmDelete = async (project: Project) => {
  if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return

  try {
    // Delete image from storage if it exists
    if (project.image_url) {
      await deleteFile('projects', project.image_url)
    }
    await remove(project.id)
    await loadProjects()
  } catch (err) {
    console.error('Delete error:', err)
    alert('Failed to delete project.')
  }
}
</script>
```

### 4.4 Simpler CRUD Pages Pattern

For tables like `certifications`, `skills`, `experience`, `education`, `fields`, and `social_links`, follow the same pattern but with simpler forms (no file upload, fewer fields). Here is the skeleton:

```vue
<!-- Example: pages/admin/certifications.vue (outline) -->
<script setup lang="ts">
import type { Certification } from '~/types/portfolio'

definePageMeta({ middleware: ['admin-auth'], layout: 'admin' })

const { getAll, create, update, remove } = useAdminCrud<Certification>('certifications')

const items = ref<Certification[]>([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)

const form = reactive({
  name: '',
  issuer: '',
  date: '',
  link: '',
  badge_url: '',
  sort_order: 0,
})

const load = async () => {
  loading.value = true
  items.value = await getAll()
  loading.value = false
}

await load()

const handleSave = async () => {
  saving.value = true
  try {
    if (isEditing.value && editingId.value) {
      await update(editingId.value, { ...form })
    } else {
      await create({ ...form })
    }
    showModal.value = false
    await load()
  } finally {
    saving.value = false
  }
}

const handleDelete = async (item: Certification) => {
  if (!confirm(`Delete "${item.name}"?`)) return
  await remove(item.id)
  await load()
}

// ... openCreate(), openEdit() same pattern as projects
</script>
```

### 4.5 Profile Page (Singleton — no list, just a form)

```vue
<!-- pages/admin/profile.vue -->
<script setup lang="ts">
import type { Profile } from '~/types/portfolio'

definePageMeta({ middleware: ['admin-auth'], layout: 'admin' })

const client = useSupabaseClient()
const { uploadFile } = useStorageUpload()

const profile = ref<Profile | null>(null)
const saving = ref(false)

// Load existing profile
const { data } = await client.from('profile').select('*').single()
if (data) profile.value = data as Profile

const form = reactive({
  full_name: profile.value?.full_name ?? '',
  title: profile.value?.title ?? '',
  bio: profile.value?.bio ?? '',
  email_1: profile.value?.email_1 ?? '',
  email_2: profile.value?.email_2 ?? '',
  phone: profile.value?.phone ?? '',
  location: profile.value?.location ?? '',
  map_embed: profile.value?.map_embed ?? '',
})

const avatarFile = ref<File | null>(null)
const resumeFile = ref<File | null>(null)

const handleSave = async () => {
  saving.value = true
  try {
    const record: Record<string, any> = { ...form }

    if (avatarFile.value) {
      const url = await uploadFile('avatars', 'avatar.webp', avatarFile.value)
      record.avatar_url = 'avatar.webp'
    }
    if (resumeFile.value) {
      const url = await uploadFile('resumes', 'resume.pdf', resumeFile.value)
      record.resume_url = 'resume.pdf'
    }

    if (profile.value) {
      // Update existing
      await client.from('profile').update(record).eq('id', profile.value.id)
    } else {
      // Insert first time
      await client.from('profile').insert(record)
    }

    alert('Profile saved!')
  } catch (err) {
    console.error(err)
    alert('Failed to save profile.')
  } finally {
    saving.value = false
  }
}
</script>
```

### 4.6 Dashboard Overview

```vue
<!-- pages/admin/index.vue -->
<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold">Dashboard</h1>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <NuxtLink
        v-for="stat in stats"
        :key="stat.label"
        :to="stat.link"
        class="p-6 bg-gradient-jet rounded-xl hover:ring-2 hover:ring-orange-yellow/50 transition-all"
      >
        <p class="text-3xl font-bold text-orange-yellow">{{ stat.count }}</p>
        <p class="text-gray-400 text-sm mt-1">{{ stat.label }}</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin-auth'], layout: 'admin' })

const client = useSupabaseClient()

// Fetch counts in parallel
const [
  { count: projectCount },
  { count: certCount },
  { count: skillCount },
  { count: expCount },
] = await Promise.all([
  client.from('projects').select('*', { count: 'exact', head: true }),
  client.from('certifications').select('*', { count: 'exact', head: true }),
  client.from('skills').select('*', { count: 'exact', head: true }),
  client.from('experience').select('*', { count: 'exact', head: true }),
])

const stats = [
  { label: 'Projects', count: projectCount ?? 0, link: '/admin/projects' },
  { label: 'Certifications', count: certCount ?? 0, link: '/admin/certifications' },
  { label: 'Skills', count: skillCount ?? 0, link: '/admin/skills' },
  { label: 'Experience', count: expCount ?? 0, link: '/admin/experience' },
]
</script>
```

---

## Phase 4.5: Blog CMS (Supabase Migration)

> **Goal:** Migrate the blog from file-based `@nuxt/content` (markdown files in `content/blog/`) to a Supabase `blog_posts` table, and build an admin CMS page for creating/editing/deleting blog posts with a rich text or markdown editor.

### 4.5.1 Database: `blog_posts` Table

```sql
-- Create the blog_posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,          -- markdown or HTML body
  image_url TEXT,                  -- thumbnail/cover image (stored in Supabase Storage)
  category TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public: read only published posts
CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT
  USING (published = true);

-- Admin: full access
CREATE POLICY "Admin full access to blog_posts"
  ON blog_posts FOR ALL
  USING (auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750')
  WITH CHECK (auth.uid() = '90e9161b-8e88-42b0-9c61-4b1ee9f6e750');

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 4.5.2 Storage Bucket

Create a `blog-images` public bucket in Supabase Storage for blog cover images / inline images.

### 4.5.3 TypeScript Type

Add to `types/portfolio.ts`:

```ts
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
```

### 4.5.4 Composable: `useSupabaseData` Update

Add a `fetchBlogPosts` function to `composables/useSupabaseData.ts`:

```ts
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
```

### 4.5.5 Admin CMS Page: `pages/admin/blog.vue`

Full CRUD page with:
- Table listing all posts (published & drafts), showing title, category, published status, date
- Create/Edit modal with fields: title, slug (auto-generated from title), excerpt, category, cover image upload, published toggle, published_at date picker
- **Content editor**: Use a `<textarea>` for markdown input with a preview pane, or optionally integrate a markdown editor library (e.g., `@vueup/vue-quill`, `md-editor-v3`, or `milkdown`)
- Delete with confirmation

```vue
<!-- pages/admin/blog.vue (outline) -->
<script setup lang="ts">
import type { BlogPostDB } from '~/types/portfolio'

definePageMeta({ middleware: ['admin-auth'], layout: 'admin' })

const { getAll, create, update, remove } = useAdminCrud<BlogPostDB>('blog_posts')
const { uploadFile, deleteFile } = useStorageUpload()
const { getPublicUrl } = useSupabaseData()

const items = ref<BlogPostDB[]>([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)

const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  published: false,
  published_at: '',
})
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const load = async () => {
  loading.value = true
  items.value = await getAll('created_at')   // order by created_at
  loading.value = false
}

await load()

// Auto-generate slug from title
const generateSlug = () => {
  form.slug = form.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const handleSave = async () => {
  saving.value = true
  try {
    let imageUrl: string | undefined

    if (selectedFile.value) {
      const timestamp = Date.now()
      const safeName = selectedFile.value.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `${timestamp}-${safeName}`
      await uploadFile('blog-images', filePath, selectedFile.value)
      imageUrl = filePath
    }

    const record: Record<string, any> = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content,
      category: form.category || null,
      published: form.published,
      published_at: form.published ? (form.published_at || new Date().toISOString()) : null,
    }
    if (imageUrl) record.image_url = imageUrl

    if (isEditing.value && editingId.value) {
      await update(editingId.value, record)
    } else {
      await create(record)
    }

    showModal.value = false
    await load()
  } catch (err) {
    console.error('Save error:', err)
    alert('Failed to save blog post.')
  } finally {
    saving.value = false
  }
}
</script>
```

### 4.5.6 Update Public Blog Pages

Replace `@nuxt/content` queries in:
- `pages/blog/index.vue` → use `fetchBlogPosts()` from `useSupabaseData`
- `pages/blog/[slug].vue` → use `fetchBlogPostBySlug(slug)` from `useSupabaseData`
- Render `content` field as markdown (use a markdown renderer like `markdown-it` or `vue-markdown-render`)

### 4.5.7 Admin Layout & Dashboard Update

- Add "Blog" link to the admin nav bar in `layouts/admin.vue`
- Add blog post count to the dashboard stats in `pages/admin/index.vue`

### 4.5.8 Optional: Seed Existing Blog Post

Migrate the existing `content/blog/my-first-blog-post.md` into the new `blog_posts` table as seed data.

### 4.5.9 Cleanup

- Remove `@nuxt/content` module from `nuxt.config.ts` and `package.json`
- Delete `content/blog/` directory
- Remove `@nuxt/content`-specific code from blog pages

### 4.5.10 Implementation Steps Summary

| Step | Task | Priority | Status |
|------|------|----------|--------|
| 15a | Run SQL to create `blog_posts` table + RLS + trigger | High | ✅ |
| 15b | Create `blog-images` storage bucket | High | ✅ |
| 15c | Add `BlogPostDB` type to `types/portfolio.ts` | High | ✅ |
| 15d | Add `fetchBlogPosts` + `fetchBlogPostBySlug` to `useSupabaseData.ts` | High | ✅ |
| 15e | Build `pages/admin/blog.vue` CRUD page | High | ✅ |
| 15f | Update `pages/blog/index.vue` to fetch from Supabase | High | ✅ |
| 15g | Update `pages/blog/[slug].vue` to fetch from Supabase + render markdown | High | ✅ |
| 15h | Add Blog link to admin layout + dashboard stats | Medium | ✅ |
| 15i | Seed existing blog post into `blog_posts` table | Low | ⬜ |
| 15j | Remove `@nuxt/content` module and `content/` directory | Low | ✅ |

---

## Phase 5: Deployment & CI/CD

### 5.1 Environment Variable Management

| Variable | Where Used | Secret? |
|---|---|---|
| `SUPABASE_URL` | Client + Server | No |
| `SUPABASE_KEY` (anon) | Client + Server | No (safe to expose, RLS protects data) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only (seed scripts) | **YES — Never expose to client** |
| `NUXT_PUBLIC_SITE_URL` | SEO meta | No |
| `NUXT_WEB3FORMS_ACCESS_KEY_1` | Contact form | No (client-side by design) |

### 5.2 `.env` File Hygiene

```bash
# .env (local development — NOT committed to git)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbG...
# SUPABASE_SERVICE_ROLE_KEY only if running seed scripts locally
```

Ensure `.env` is in `.gitignore`:

```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

### 5.3 Recommended Deployment: Vercel + Supabase

**Why Vercel:** Native Nuxt 3 support (zero-config via `nuxt build`), edge functions, preview deployments per branch.

**Setup:**

1. **Connect Repo:** Link your GitHub repository to Vercel.
2. **Set Environment Variables** in Vercel Dashboard → Settings → Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `NUXT_PUBLIC_SITE_URL` (your production domain)
   - All `NUXT_WEB3FORMS_*` and `NUXT_CONTACT_*` variables
3. **Build Command:** `npm run build` (default).
4. **Output Directory:** `.output` (auto-detected by Vercel for Nuxt 3).

### 5.4 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx nuxt typecheck       # Type checking
      # - run: npm run lint            # Uncomment if ESLint is configured

  build:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
          NUXT_PUBLIC_SITE_URL: ${{ vars.NUXT_PUBLIC_SITE_URL }}

  # Vercel handles the actual deployment via its GitHub integration.
  # This pipeline ensures code quality before Vercel picks up the push.
```

### 5.5 Supabase Database Migrations (Optional but Recommended)

For schema version control, use the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize (one-time, creates supabase/ directory)
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF

# Pull current schema as a baseline migration
supabase db pull

# Future changes: create a new migration
supabase migration new add_some_column

# Apply migrations to remote
supabase db push
```

This gives you Git-tracked `.sql` migration files under `supabase/migrations/`.

---

## Appendix: File Tree After Migration

```
Web Portfolio/
├── .env                          # Local env vars (gitignored)
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD pipeline
├── nuxt.config.ts                # Updated with @nuxtjs/supabase
├── package.json
├── tailwind.config.ts
├── tsconfig.json
│
├── assets/css/main.css
│
├── components/
│   ├── ContactInfo.vue           # UPDATED: reads from profile prop, not hardcoded
│   ├── ErrorBoundary.vue
│   ├── Icon*.vue                 # Unchanged
│   ├── LoadingSpinner.vue
│   ├── Sidebar.vue               # UPDATED: receives profile + socialLinks as props
│   ├── SocialLinks.vue           # UPDATED: receives socialLinks as prop
│   └── admin/                    # NEW: reusable admin UI components
│       ├── ConfirmDialog.vue
│       ├── DataTable.vue
│       ├── FileUpload.vue
│       └── FormModal.vue
│
├── composables/
│   ├── useAdminCrud.ts           # NEW: generic CRUD for admin
│   ├── useErrorHandler.ts        # Unchanged
│   ├── useFormValidation.ts      # Unchanged
│   ├── usePerformance.ts         # Unchanged
│   ├── usePortfolio.ts           # Unchanged (navigation state)
│   ├── usePortfolioData.ts       # DEPRECATED → replaced by useSupabaseData
│   ├── useStorageUpload.ts       # NEW: file upload to Supabase Storage
│   └── useSupabaseData.ts        # NEW: public read-only data fetching
│
├── content/blog/                 # Unchanged — still uses @nuxt/content
│   └── my-first-blog-post.md
│
├── layouts/
│   ├── default.vue               # Public layout (implicit, current behavior)
│   └── admin.vue                 # NEW: admin layout with sidebar nav
│
├── middleware/
│   └── admin-auth.ts             # NEW: auth guard for /admin/*
│
├── pages/
│   ├── index.vue                 # UPDATED: fetches from Supabase via useAsyncData
│   ├── blog/
│   │   ├── index.vue
│   │   └── [slug].vue
│   └── admin/                    # NEW: CMS pages
│       ├── login.vue
│       ├── index.vue             # Dashboard
│       ├── profile.vue
│       ├── projects.vue
│       ├── certifications.vue
│       ├── experience.vue
│       ├── education.vue
│       ├── skills.vue
│       ├── fields.vue
│       └── social-links.vue
│
├── public/                       # Static assets (shrinks as images move to Storage)
│   ├── robots.txt
│   └── images/
│
├── server/tsconfig.json
│
├── supabase/                     # NEW: Supabase CLI project (optional)
│   ├── config.toml
│   └── migrations/
│       └── 001_initial_schema.sql
│
└── types/
    ├── blog.ts
    └── portfolio.ts              # UPDATED: DB-aligned interfaces
```

---

## Implementation Order (Recommended)

| Step | Task | Est. Complexity | Status |
|------|------|-----------------|--------|
| 1 | Create Supabase project + run all Phase 1 SQL | Low | ✅ Done |
| 2 | Seed existing hardcoded data into tables | Low | ✅ Done |
| 3 | `npm install @nuxtjs/supabase`, configure `nuxt.config.ts` + `.env` | Low | ✅ Done |
| 4 | Write `useSupabaseData.ts` composable | Medium | ✅ Done |
| 5 | Update `pages/index.vue` to use `useAsyncData` + Supabase | Medium | ✅ Done |
| 6 | Update `Sidebar.vue`, `ContactInfo.vue`, `SocialLinks.vue` to accept props | Low | ✅ Done |
| 7 | Test public site reads from Supabase — **milestone: feature parity** | — | ✅ Done |
| 8 | Set up Supabase Auth + create admin user | Low | ✅ Done |
| 9 | Write `middleware/admin-auth.ts` | Low | ✅ Done |
| 10 | Create `layouts/admin.vue` | Low | ✅ Done |
| 11 | Write `useAdminCrud.ts` + `useStorageUpload.ts` | Medium | ✅ Done |
| 12 | Build `/admin/projects.vue` (most complex — file upload + categories) | High | ⬜ |
| 13 | Build remaining admin CRUD pages (template off projects) | Medium | ⬜ |
| 14 | Build `/admin/profile.vue` (singleton) | Medium | ⬜ |
| 15 | Build Dashboard overview `/admin/index.vue` | Low | ⬜ |
| 16 | Delete `usePortfolioData.ts`, remove hardcoded data | Low | ⬜ |
| 17 | Set up GitHub Actions CI/CD + Vercel env vars | Low | ⬜ |
| 18 | Final QA: test all CRUD, RLS policies, mobile responsiveness | — | ⬜ |

---

> **End of Plan.** Each phase is self-contained and can be implemented and tested independently. Phases 1–4.5 are complete — next up is Phase 5 (deployment & CI/CD).
