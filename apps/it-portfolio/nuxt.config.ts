export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss', 
    '@nuxtjs/supabase'
  ],
  
  // Supabase module config
  supabase: {
    redirect: false,  // We use middleware/admin-auth.ts for route protection
    types: '~/types/portfolio.ts',
  },
  
  // CSS configuration
  css: ['~/assets/css/main.css'],
    app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: process.env.NUXT_SITE_NAME || 'Le Hoang Triet Thong Portfolio',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: process.env.NUXT_SITE_DESCRIPTION || 'Computer Science student specializing in AI and Data Science' },
        { name: 'keywords', content: 'Machine Learning, AI, Data Science, AWS, Python, Portfolio' },
        { name: 'author', content: 'Alec Le' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: process.env.NUXT_SITE_NAME || 'Le Hoang Triet Thong Portfolio' },
        { property: 'og:description', content: process.env.NUXT_SITE_DESCRIPTION || 'Computer Science student specializing in AI and Data Science' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: process.env.NUXT_PUBLIC_SITE_URL || 'https://your-domain.com' },
        { property: 'og:image', content: '/my_image2.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: process.env.NUXT_SITE_NAME || 'Le Hoang Triet Thong Portfolio' },
        { name: 'twitter:description', content: process.env.NUXT_SITE_DESCRIPTION || 'Computer Science student specializing in AI and Data Science' }
      ],
      link: [
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
        },
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/website_icon.svg'
        },
        {
          rel: 'canonical',
          href: process.env.NUXT_PUBLIC_SITE_URL || 'https://your-domain.com'
        }
      ]
    }
  },
  
  // Build optimizations
  nitro: {
    compressPublicAssets: true,
    minify: true
  },    // Runtime config
  runtimeConfig: {
    // Server-side only (not exposed to client)
    resendApiKey: process.env.RESEND_API_KEY,
    // Public keys (client-side accessible) - moved Web3Forms to public since it's used client-side
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://your-domain.com',
      siteName: process.env.NUXT_SITE_NAME || 'Le Hoang Triet Thong Portfolio',
      siteDescription: process.env.NUXT_SITE_DESCRIPTION || 'Computer Science student specializing in AI and Data Science',
      enableAnalytics: process.env.NUXT_ENABLE_ANALYTICS === 'true',
      enableErrorReporting: process.env.NUXT_ENABLE_ERROR_REPORTING === 'true',
      // Web3Forms configuration (client-side accessible)
      web3FormsAccessKey1: process.env.NUXT_WEB3FORMS_ACCESS_KEY_1,
      web3FormsAccessKey2: process.env.NUXT_WEB3FORMS_ACCESS_KEY_2,
      contactEmail1: process.env.NUXT_CONTACT_EMAIL_1,
      contactEmail2: process.env.NUXT_CONTACT_EMAIL_2
    }
  },
  
  // Performance optimizations
  experimental: {
    payloadExtraction: false
  },


  content: {
    documentDriven: false,
    markdown: {
      toc: {
        depth: 3,
        searchDepth: 3
      }
    },
    // Syntax highlighting configuration
    highlight: {
      theme: {
        default: 'github-dark',
        dark: 'github-dark',
        light: 'github-light'
      },
      preload: ['typescript', 'javascript', 'python', 'bash', 'json', 'vue', 'html', 'css']
    }
  }
})