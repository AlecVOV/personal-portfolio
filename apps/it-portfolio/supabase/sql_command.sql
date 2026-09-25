-- ============================================================
-- 1. PROFILE (singleton — one row for the site owner)
-- ============================================================
CREATE TABLE public.profile (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT NOT NULL,
  title      TEXT NOT NULL,
  bio        TEXT,
  avatar_url TEXT,
  resume_url TEXT,
  email_1    TEXT,
  email_2    TEXT,
  phone      TEXT,
  location   TEXT,
  map_embed  TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. SOCIAL LINKS
-- ============================================================
CREATE TABLE public.social_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform   TEXT NOT NULL,
  url        TEXT NOT NULL,
  icon_name  TEXT,
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
  year        TEXT NOT NULL,
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
  period      TEXT NOT NULL,
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
  icon_url   TEXT NOT NULL,
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
  date        TEXT NOT NULL,
  link        TEXT,
  badge_url   TEXT,
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
  image_url   TEXT,
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
  category   TEXT NOT NULL
);

CREATE INDEX idx_project_categories_project ON public.project_categories(project_id);
CREATE INDEX idx_project_categories_name    ON public.project_categories(category);

-- ============================================================
-- 10. HELPER: Auto-update updated_at trigger
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
-- PUBLIC READ (anonymous users can read all data)
-- ============================================================
CREATE POLICY "Public read profile"  ON public.profile            FOR SELECT USING (true);
CREATE POLICY "Public read social"   ON public.social_links       FOR SELECT USING (true);
CREATE POLICY "Public read fields"   ON public.fields             FOR SELECT USING (true);
CREATE POLICY "Public read edu"      ON public.education          FOR SELECT USING (true);
CREATE POLICY "Public read exp"      ON public.experience         FOR SELECT USING (true);
CREATE POLICY "Public read skills"   ON public.skills             FOR SELECT USING (true);
CREATE POLICY "Public read certs"    ON public.certifications     FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON public.projects           FOR SELECT USING (true);
CREATE POLICY "Public read cats"     ON public.project_categories FOR SELECT USING (true);

-- ============================================================
-- 10. BLOG POSTS (table created via Supabase dashboard)
-- ============================================================
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read blog"  ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admin full blog"   ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- 11. CONTACT MESSAGES (guest form submissions)
-- ============================================================
CREATE TABLE public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name  TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  message     TEXT NOT NULL,
  replied     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (guests via contact form)
CREATE POLICY "Anyone insert messages" ON public.contact_messages FOR INSERT TO anon WITH CHECK (true);
-- Only admins can view & mark as replied
CREATE POLICY "Admin manage messages"  ON public.contact_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- ⚠️  IMPORTANT: Adding a new admin account
-- ============================================================
-- Whenever you create a new admin user (Supabase Auth → Add User),
-- you MUST update the is_admin() function below with their UUID.
-- Then run the full is_admin() block again to apply.
--
--   1. Go to Supabase Dashboard → Authentication → Users
--   2. Copy the new user's UUID
--   3. Add it to the list inside is_admin() below
--   4. Run: SELECT public.is_admin();       -- to verify
--
-- ============================================================
-- ADMIN FULL ACCESS (all admin accounts)
-- ============================================================

-- Helper: all admin UUIDs
-- 896276db-96b3-475f-9fd4-e0696a620115
-- b5f9d31b-fffa-4cf0-8486-53da759b0844
-- 90e9161b-8e88-42b0-9c61-4b1ee9f6e750
-- 7c16f2dc-b12b-470c-aeed-905f53018574

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
BEGIN
  RETURN auth.uid() IN (
    '896276db-96b3-475f-9fd4-e0696a620115'::uuid,
    'b5f9d31b-fffa-4cf0-8486-53da759b0844'::uuid,
    '90e9161b-8e88-42b0-9c61-4b1ee9f6e750'::uuid,
    '7c16f2dc-b12b-470c-aeed-905f53018574'::uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admin full profile"   ON public.profile            FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full social"    ON public.social_links       FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full fields"    ON public.fields             FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full edu"       ON public.education          FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full exp"       ON public.experience         FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full skills"    ON public.skills             FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full certs"     ON public.certifications     FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full projects"  ON public.projects           FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full cats"      ON public.project_categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',      'avatars',      true),
  ('resumes',      'resumes',      true),
  ('projects',     'projects',     true),
  ('certificates', 'certificates', true);

-- ============================================================
-- STORAGE: Public can read all buckets, only admins can write
-- ============================================================

-- Public read for all buckets
CREATE POLICY "Public read avatars"       ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public read resumes"       ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Public read projects"      ON storage.objects FOR SELECT USING (bucket_id = 'projects');
CREATE POLICY "Public read certificates"  ON storage.objects FOR SELECT USING (bucket_id = 'certificates');

-- Admin INSERT (upload) — all 4 admins
CREATE POLICY "Admin upload avatars"      ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars'      AND public.is_admin());
CREATE POLICY "Admin upload resumes"      ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes'      AND public.is_admin());
CREATE POLICY "Admin upload projects"     ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'projects'     AND public.is_admin());
CREATE POLICY "Admin upload certificates" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates' AND public.is_admin());

-- Admin UPDATE (overwrite)
CREATE POLICY "Admin update avatars"      ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars'      AND public.is_admin());
CREATE POLICY "Admin update resumes"      ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resumes'      AND public.is_admin());
CREATE POLICY "Admin update projects"     ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'projects'     AND public.is_admin());
CREATE POLICY "Admin update certificates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'certificates' AND public.is_admin());

-- Admin DELETE
CREATE POLICY "Admin delete avatars"      ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars'      AND public.is_admin());
CREATE POLICY "Admin delete resumes"      ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes'      AND public.is_admin());
CREATE POLICY "Admin delete projects"     ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'projects'     AND public.is_admin());
CREATE POLICY "Admin delete certificates" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'certificates' AND public.is_admin());

-- CV bucket
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('cv', 'cv', true);
CREATE POLICY "Public read cv"       ON storage.objects FOR SELECT USING (bucket_id = 'cv');
CREATE POLICY "Admin upload cv"      ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cv' AND public.is_admin());
CREATE POLICY "Admin update cv"      ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'cv' AND public.is_admin());
CREATE POLICY "Admin delete cv"      ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cv' AND public.is_admin());



INSERT INTO public.profile (full_name, title, bio, avatar_url, resume_url, email_1, email_2, phone, location, map_embed)
VALUES (
  'Alec Le',
  'Machine Learning Engineer',
  'I''m have an undergraduate degree in Computer Science – AI, complemented by specialized coursework in Data Science and Artificial Intelligence. My academic journey gives me a theoretical grounding in cloud computing, machine learning, and software development, while my hands-on projects have challenged me to apply that knowledge in real-world scenarios.

Here you can explore my world, from an none fancy IT Developer to a person that have great passion in seeking knowledge by exploring new technologies and world insight about AI and related domain when applying up-to-date technologies into it.',
  'my_image2.jpg',
  'LeHoangTrietThong_Resume.pdf',
  'lhtthong.forwork@gmail.com',
  'lhtthong.forwork@outlook.com',
  '+84 947 685 335',
  'Phu Thanh Ward, Ho Chi Minh City',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62708.14387673113!2d106.58612376222044!3d10.79146507555257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752bf733e69175%3A0xd8d63453733325fe!2sT%C3%A2n%20Ph%C3%BA%2C%20Ho%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1741602034108!5m2!1sen!2s'
);


INSERT INTO public.social_links (platform, url, icon_name, sort_order) VALUES
  ('LinkedIn',    'https://www.linkedin.com/in/lehoangtrietthong/', 'IconLinkedin',     1),
  ('Photography', 'https://chilonthon-photohub.vercel.app/',        'IconPhotography',  2);

INSERT INTO public.fields (title, description, sort_order) VALUES
  ('Machine Learning',  'Currently exploring various ML algorithms and their applications, eager to apply this knowledge in a real-world industry.', 1),
  ('Cloud Computing',   'Learning about cloud platforms like AWS, excited to work with cloud technologies in a professional setting to deploy the best practise model pipline.', 2),
  ('Deep Learning',     'Diving into neural networks and deep learning architectures, keen to contribute to innovative projects as an intern.', 3),
  ('Data Engineering',  'Understanding data pipelines and processing systems, looking forward to gaining hands-on experience in data engineering during an internship.', 4);

INSERT INTO public.education (degree, school, year, description, sort_order) VALUES
  ('Bachelor of Computer Science, Majoring in Artificial Intelligence',
   'Swinburne University of Technology',
   '2022-2026',
   'Mastered AI fundamentals at Swinburne Vietnam, delivering impactful solutions in collaboration with industry partners.',
   1);

INSERT INTO public.experience (title, company, period, description, sort_order) VALUES
  ('AL/ML Ambassador',
   'AWS Study Group',
   '2025 - Now',
   'Actively participated in workshops and events to foster growth and collaboration within the AWS community.',
   1),
  ('Member of AIO 2024',
   'AI Vietnam',
   '2024-2025',
   'Intensive 1-year program with diverse projects in image processing, natural language processing, and data science, showcasing practical skills from python, algorithms, machine learning, and real-world project applications.',
   2);

INSERT INTO public.skills (name, icon_url, sort_order) VALUES
  ('Python',         'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/Python-Light.svg',        1),
  ('AWS',            'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/AWS-Light.svg',           2),
  ('Github',         'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/Github-Light.svg',        3),
  ('Git',            'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/Git.svg',                 4),
  ('LaTeX',          'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/LaTeX-Light.svg',         5),
  ('Stack Overflow', 'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/StackOverflow-Light.svg', 6),
  ('Nuxt',           'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/NuxtJS-Light.svg',        7),
  ('Vite',           'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/Vite-Light.svg',          8),
  ('Vue',            'https://cdn.jsdelivr.net/gh/tandpfun/skill-icons/icons/VueJS-Light.svg',         9);


INSERT INTO public.certifications (name, issuer, date, link, sort_order) VALUES
  ('CCNA: Introduction to Networks',                                        'Cisco',              'April 2024',    'https://www.credly.com/badges/ea475619-7376-44f1-9bba-162b836b9c48',                1),
  ('Programming for Everybody (Getting Started with Python)',               'University of Michigan', 'October 2024',  'https://coursera.org/share/5ee62f4961be5e83b3d118d4ef28e6a6',                     2),
  ('AWS Academy Graduate - AWS Academy Cloud Foundations',                  'Amazon Web Services', 'October 2024',  'https://www.credly.com/badges/988c98b4-6507-4e49-b2d2-6093db2310fa',               3),
  ('Getting Started with Data Analytics on AWS',                            'Amazon Web Services', 'December 2024', 'https://coursera.org/share/d50e9b9c27fafd6c418db51ff6c888f9',                      4),
  ('Optimizing Your Workflow with GitHub Copilot and VS Code',              'Microsoft',          'January 2025',  'https://www.coursera.org/account/accomplishments/verify/YBWSR92GPAJ8',             5),
  ('Generative AI for Software Developers',                                 'Microsoft',          'January 2025',  'https://www.coursera.org/account/accomplishments/specialization/9CB53RS5NSHP',     6),
  ('Introduction to Generative AI for Developers With Copilot',             'Microsoft',          'January 2025',  'https://www.coursera.org/account/accomplishments/verify/MZR1Q0AOHTWY',             7),
  ('GitHub Copilot for Project Management',                                 'Microsoft',          'January 2025',  'https://www.coursera.org/account/accomplishments/verify/DMGSURXKUNU3',             8),
  ('Boost Your Productivity with GitHub Copilot',                           'Microsoft',          'January 2025',  'https://www.coursera.org/account/accomplishments/verify/HILQUP63LI3V',             9),
  ('Foundations of Software Testing and Validation',                        'University of Leeds','January 2025',  'https://www.coursera.org/account/accomplishments/verify/0IG2WUQ0FEYX',             10),
  ('Preview Cloud Computing Terms Every Beginner Should Know',              'LinkedIn Learning',  'January 2025',  'https://lnkd.in/ggGxWyQm',                                                        11),
  ('AWS Educate Introduction to Cloud 101',                                 'AWS Educate',        'January 2025',  'https://www.credly.com/badges/5dba24be-3931-406f-9a36-5b6b2617983e',               12),
  ('AWS Educate Getting Started with Storage',                              'AWS Educate',        'January 2025',  'https://www.credly.com/badges/53778c52-ddf0-4526-9bd6-5e80b0eb9686',               13),
  ('Programming with JavaScript',                                           'Meta',               'February 2025', 'https://www.coursera.org/account/accomplishments/verify/UBMKWRTFHD55',             14),
  ('Migrating to the AWS Cloud',                                            'Amazon Web Services', 'February 2025', 'https://www.coursera.org/account/accomplishments/verify/BJ7IR8L23Z6B',             15),
  ('AWS Cloud Technical Essentials',                                        'Amazon Web Services', 'February 2025', 'https://www.coursera.org/account/accomplishments/verify/TWEQ110OPW4C',             16),
  ('Introduction to Data Analytics',                                        'IBM',                'February 2025', 'https://www.coursera.org/account/accomplishments/verify/I1F8C74GWSN2',             17);



-- === PROJECT 1 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('Queensland Road Safety Analysis', 'An analysis and visualization of road safety data in Queensland, Australia.', 'Queensland Road Safety Analysis.png', NULL, 'https://github.com/AlecVOV/My-Side-Project/tree/main/Queensland%20Road%20Safety%20Analysis', 1)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Data Visualization']) FROM p;

-- === PROJECT 2 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('IBM Employee Attrition & Performance Analysis', 'An analysis using Python and visualization using PowerBI.', 'IBM.webp', NULL, 'https://github.com/AlecVOV/My-Side-Project/tree/main/IBM%20Employee%20Attrition%20%26%20Performance%20Analysis', 2)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Predictive Modeling', 'Business Intelligence']) FROM p;

-- === PROJECT 3 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('Apply ML for Used Car Price Estimation for Eureka Motors', 'A set of machine learning models to estimate used car prices for Eureka Motors.', 'Car_Prediction.png', NULL, 'https://github.com/AlecVOV/My-Side-Project/tree/main/Apply%20ML%20for%20Used%20Car%20Price%20Estimation%20for%20Eureka%20Motors', 3)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Machine Learning']) FROM p;

-- === PROJECT 4 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('Web Scraping Project', 'A python script to scrape data from a website and store it in a CSV file.', 'web-scraping.jpg', NULL, 'https://github.com/AlecVOV/Self-Project/tree/main/Web%20Scrawing%20Python', 4)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Web Scraping']) FROM p;

-- === PROJECT 5 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('Snake Game Project', 'Fully functional snake game built with GenAI (Amazon Q).', 'snake_game_logo.webp', NULL, 'https://github.com/AlecVOV/Self-Project/tree/main/Snake%20Game%20Project', 5)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Generative AI']) FROM p;

-- === PROJECT 6 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('Ice Cream Website', 'Complete Assignment 2 of COS10005 unit.', 'Ice Cream Website.png', NULL, 'https://github.com/AlecVOV/Projects/tree/main/Ice%20Cream%20Website', 6)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Front End Development']) FROM p;

-- === PROJECT 7 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('Recruitment Website For HR', 'Complete website for COS10026 Unit', 'Recruitment Website For HR.png', NULL, 'https://github.com/AlecVOV/Projects/tree/main/Recruitment%20Website%20For%20HR', 7)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Front End Development']) FROM p;

-- === PROJECT 8 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('Software Vulnerability Detection by Reconnaise.ai', 'A fully functional website can detect vulnerable PHP code using 6 machine learning models implementation', 'Sofware Vulnerability Detection.png', NULL, 'https://github.com/AlecVOV/Projects/tree/main/Software%20Vulnerability%20Detection%20(Reconnaise.ai)', 8)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Machine Learning']) FROM p;

-- === PROJECT 9 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('Koala Analysis', 'A side project for practice about Koala analysis.', 'Koala Analysis.png', NULL, 'https://github.com/AlecVOV/My-Side-Project/tree/main/Koala%20Morphological%20Characteristics%20and%20Demographics%20Analysis', 9)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Data Analysis']) FROM p;

-- === PROJECT 10 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('KPIs and Sales Profit of OfficeWorld', 'Side project using PowerBI to create dashboard', 'KPIs Sale OfficeWorld.png', NULL, 'https://github.com/AlecVOV/My-Side-Project/tree/main/KPIs%20and%20Sales%20Profit%20of%20OfficeWorld', 10)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Data Visualization']) FROM p;

-- === PROJECT 11 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('Predictive Model with Tax Revenue and Guest Night', 'Basic data mining and implementation MLs to predict cost', 'Tax Revenue and Hotel.png', NULL, 'https://github.com/AlecVOV/My-Side-Project/tree/main/Predictive%20Model%20with%20Tax%20Revenue%20and%20Guest%20Night', 11)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Machine Learning', 'Data Mining']) FROM p;

-- === PROJECT 12 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('Tea-related Business Analysis with Tableau', 'Comprehensive data analysis and visualization of tea business operations across multiple US states using Tableau', 'Tea-Related-Bizniz.png', NULL, 'https://github.com/AlecVOV/My-Side-Project/tree/main/Tea-related%20Business%20Analysis%20with%20Tableau', 12)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Data Visualization']) FROM p;

-- === PROJECT 13 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('Applied Predictive Analytics with Dead Stock', 'Analyzes inventory data from Australian warehouses to predict which items are likely to become dead stock.', 'Dead Stock Analysis.png', NULL, 'https://github.com/AlecVOV/My-Side-Project/tree/main/Applied%20Predictive%20Analytics%20with%20Dead%20Stock', 13)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Data Analysis', 'Machine Learning']) FROM p;

-- === PROJECT 14 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('Ho Chi Minh Real Estate Analysis', 'The project investigates how apartment prices (per m²) with linear regression.', 'Real Estate Pricing Analysis.png', NULL, 'https://github.com/AlecVOV/My-Side-Project/tree/main/Ho%20Chi%20Minh%20Real%20Estate%20Analysis', 14)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Data Cleaning', 'Data Visualization', 'Machine Learning']) FROM p;

-- === PROJECT 15 ===
WITH p AS (
  INSERT INTO public.projects (title, description, image_url, demo_url, github_url, sort_order)
  VALUES ('EcoCharge Solutions Analysis Dashboard', 'A Dasbroad about EcoCharge to discover pattern about green energy.', 'EcoCharge Solutions.png', NULL, 'https://github.com/AlecVOV/My-Side-Project/tree/main/EcoCharge%20Solutions%20Analysis%20Dashboard', 15)
  RETURNING id
)
INSERT INTO public.project_categories (project_id, category) SELECT id, unnest(ARRAY['Data Visualization']) FROM p;



-- Check row counts
SELECT 'profile' AS table_name, count(*) FROM public.profile
UNION ALL SELECT 'social_links',       count(*) FROM public.social_links
UNION ALL SELECT 'fields',             count(*) FROM public.fields
UNION ALL SELECT 'education',          count(*) FROM public.education
UNION ALL SELECT 'experience',         count(*) FROM public.experience
UNION ALL SELECT 'skills',             count(*) FROM public.skills
UNION ALL SELECT 'certifications',     count(*) FROM public.certifications
UNION ALL SELECT 'projects',           count(*) FROM public.projects
UNION ALL SELECT 'project_categories', count(*) FROM public.project_categories;


-- Verify projects + categories join
SELECT p.title, array_agg(pc.category) AS categories
FROM public.projects p
LEFT JOIN public.project_categories pc ON pc.project_id = p.id
GROUP BY p.id, p.title
ORDER BY p.sort_order;

-- Add column for CV 
ALTER TABLE public.profile ADD COLUMN cv_url TEXT;


UPDATE public.profile
SET cv_url = 'LeHoangTrietThong_CV.pdf'
WHERE full_name = 'Alec Le';


-- This runs as the service role (admin), so it always works.
-- To truly test anon, use Option B below.
SELECT count(*) FROM public.projects;


# READ test (should return all projects) ✅
curl.exe "https://YOUR_PROJECT_REF.supabase.co/rest/v1/projects?select=*" `
   -H "apikey: YOUR_SUPABASE_ANON_KEY" `
   -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"


# WRITE test (should FAIL with 403 or empty result) ❌
curl.exe -X POST "https://YOUR_PROJECT_REF.supabase.co/rest/v1/projects" `
  -H "apikey: YOUR_SUPABASE_ANON_KEY" `
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"HACK\",\"description\":\"test\",\"github_url\":\"http://test.com\"}'


-- Public read
CREATE POLICY "Public read blog-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- Admin upload
CREATE POLICY "Admin upload blog-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());

-- Admin update
CREATE POLICY "Admin update blog-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_admin());

-- Admin delete
CREATE POLICY "Admin delete blog-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_admin());