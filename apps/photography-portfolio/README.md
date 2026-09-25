# 📸 LensCraft Photography Portfolio

A modern, full-stack photography portfolio website with a powerful CMS (Content Management System) built with Nuxt 3, Supabase, and Cloudinary.

![Nuxt 3](https://img.shields.io/badge/Nuxt-3.x-00DC82?style=flat&logo=nuxt.js&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-3448C5?style=flat&logo=cloudinary&logoColor=white)

## ✨ Features

### 🎨 Public Website

- **Responsive Design** - Beautiful UI that works on all devices
- **Dark Mode Support** - Seamless light/dark theme switching
- **Portfolio Gallery** - Filterable image gallery with categories
- **Blog System** - SEO-friendly blog with markdown support
- **Testimonials** - Auto-rotating client reviews carousel
- **Contact Form** - Integrated with Web3Forms
- **Smooth Animations** - VueUse Motion for engaging transitions
- **SEO Optimized** - Server-side rendering for better search rankings

### 🛠️ Admin CMS

- **Blog Management** - Create, edit, publish, hide, and delete blog posts
- **Portfolio Management** - Upload and organize portfolio items by category
- **Testimonials Management** - Manage client reviews and ratings
- **Category System** - Organize content with custom categories
- **Authentication** - Secure admin access with Supabase Auth
- **Draft System** - Save drafts and publish when ready
- **Markdown Editor** - Rich text editing with live preview
- **Image Management** - Easy image uploads via Cloudinary

## 🚀 Tech Stack

### Frontend

- **[Nuxt 3](https://nuxt.com/)** - Vue.js framework with SSR
- **[Vue 3](https://vuejs.org/)** - Progressive JavaScript framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[VueUse Motion](https://motion.vueuse.org/)** - Animation library
- **[Marked](https://marked.js.org/)** - Markdown parser

### Backend & Database

- **[Supabase](https://supabase.com/)** - PostgreSQL database with built-in auth
- **[Nuxt Supabase](https://supabase.nuxtjs.org/)** - Supabase integration for Nuxt

### Storage & Deployment

- **[Cloudinary](https://cloudinary.com/)** - Image optimization and CDN
- **[Vercel](https://vercel.com/)** - Deployment platform (recommended)

### Additional Tools

- **[Web3Forms](https://web3forms.com/)** - Contact form API
- **[@nuxtjs/google-fonts](https://google-fonts.nuxtjs.org/)** - Font integration
- **[@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)** - Beautiful prose styling

## 📁 Project Structure

```
photography-portfolio/
├── assets/              # CSS and static assets
├── components/          # Vue components
│   ├── Admin/          # Admin CMS components
│   ├── App/            # App-wide components (Header, Footer)
│   ├── About/          # About section components
│   ├── Blog/           # Blog components
│   ├── Home/           # Homepage components
│   └── Portfolio/      # Portfolio components
├── composables/        # Vue composables
├── layouts/            # Nuxt layouts
│   ├── admin.vue      # Admin panel layout
│   └── default.vue    # Public site layout
├── middleware/         # Route middleware
│   └── auth.ts        # Authentication middleware
├── pages/             # Nuxt pages (routes)
│   ├── admin/         # Admin pages
│   ├── blog/          # Blog pages
│   ├── portfolio/     # Portfolio pages
│   └── index.vue      # Homepage
├── server/            # Server API routes
│   └── api/           # API endpoints
├── public/            # Public static files
├── .env               # Environment variables
├── nuxt.config.ts     # Nuxt configuration
├── tailwind.config.js # Tailwind configuration
└── package.json       # Dependencies
```

## 🎨 Customization

### Update Site Information

Edit content in these files:

- index.vue - Homepage content
- Header.vue - Navigation
- Footer.vue - Footer content
- AboutSection.vue - About section

## 📝 Database Schema

### Tables Overview

- **categories** - Content categories (Wedding, Portrait, etc.)
- **blog_posts** - Blog articles with markdown content
- **portfolio_items** - Portfolio images and descriptions
- **testimonials** - Client reviews and ratings

### Relationships

- `blog_posts.category_id` → `categories.id`
- `portfolio_items.category_id` → `categories.id`

## 🔧 API Routes

### Blog

- `GET /api/blog` - Get all blog posts
- `POST /api/blog` - Create blog post
- `GET /api/blog/:id` - Get single blog post
- `PUT /api/blog/:id` - Update blog post
- `DELETE /api/blog/:id` - Delete blog post

### Portfolio

- `GET /api/portfolio` - Get all portfolio items
- `POST /api/portfolio` - Create portfolio item
- `PUT /api/portfolio/:id` - Update portfolio item
- `DELETE /api/portfolio/:id` - Delete portfolio item

### Testimonials

- `GET /api/testimonials` - Get all testimonials
- `POST /api/testimonials` - Create testimonial
- `PUT /api/testimonials/:id` - Update testimonial
- `DELETE /api/testimonials/:id` - Delete testimonial

### Categories

- `GET /api/categories` - Get all categories
