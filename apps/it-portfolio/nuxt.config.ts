// Env vars are read at BUILD time (Amplify bakes them in) — redeploy after changing any.
const PUBLIC_CACHE = { 'cache-control': 's-maxage=300, stale-while-revalidate=86400' }
const NO_STORE = { 'cache-control': 'no-store' }

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-auth-utils',
  ],

  // Session is loaded in the browser only, so public SSR HTML (cached by the CDN) never
  // contains session data. Admin pages are client-rendered.
  auth: { loadStrategy: 'client-only' },

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

  routeRules: {
    // Public pages + public read APIs: let the CDN absorb traffic.
    '/': { headers: PUBLIC_CACHE },
    '/blog/**': { headers: PUBLIC_CACHE },
    '/api/**': { headers: NO_STORE },
    '/api/site': { headers: PUBLIC_CACHE },
    '/api/blog': { headers: PUBLIC_CACHE },
    '/api/blog/**': { headers: PUBLIC_CACHE },
    // Admin: client-rendered, never cached.
    '/admin/**': { ssr: false, headers: NO_STORE },
  },

  // Build optimizations
  nitro: {
    compressPublicAssets: true,
    minify: true,
    awsAmplify: { runtime: 'nodejs20.x' },
  },

  // Runtime config
  runtimeConfig: {
    // Server-side only (not exposed to client)
    appRegion: process.env.APP_REGION || 'ap-southeast-1',
    appTableName: process.env.APP_TABLE_NAME || '',
    appMediaBucket: process.env.APP_MEDIA_BUCKET || '',
    cognitoUserPoolId: process.env.APP_COGNITO_USER_POOL_ID || '',
    cognitoClientId: process.env.APP_COGNITO_CLIENT_ID || '',
    adminSub: process.env.APP_ADMIN_SUB || '',
    sesFromEmail: process.env.SES_FROM_EMAIL || '',
    contactToEmail: process.env.CONTACT_TO_EMAIL || '',
    session: {
      name: 'it-admin',
      password: process.env.NUXT_SESSION_PASSWORD || '',
      maxAge: 60 * 60 * 8,
      cookie: { sameSite: 'lax' },
    },
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://your-domain.com',
      siteName: process.env.NUXT_SITE_NAME || 'Le Hoang Triet Thong Portfolio',
      siteDescription: process.env.NUXT_SITE_DESCRIPTION || 'Computer Science student specializing in AI and Data Science',
      enableAnalytics: process.env.NUXT_ENABLE_ANALYTICS === 'true',
      enableErrorReporting: process.env.NUXT_ENABLE_ERROR_REPORTING === 'true',
      mediaBaseUrl: (process.env.NUXT_PUBLIC_MEDIA_BASE_URL || '').replace(/\/+$/, ''),
    }
  },

  // Performance optimizations
  experimental: {
    payloadExtraction: false
  },
})
