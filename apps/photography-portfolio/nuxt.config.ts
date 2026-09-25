// https://nuxt.com/docs/api/configuration/nuxt-config
// Env vars are read at BUILD time (Amplify bakes them in) — redeploy after changing any.
const PUBLIC_CACHE = { 'cache-control': 's-maxage=300, stale-while-revalidate=86400' }
const NO_STORE = { 'cache-control': 'no-store' }

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@vueuse/motion/nuxt',
    'nuxt-auth-utils',
  ],

  // Session is loaded in the browser only, so public SSR HTML (cached by the CDN) never
  // contains session data. Admin pages are client-rendered.
  auth: { loadStrategy: 'client-only' },

  css: [
    '~/assets/css/main.css',
    '~/assets/css/animations.css'
  ],
  runtimeConfig: {
    appRegion: process.env.APP_REGION || 'ap-southeast-1',
    appTableName: process.env.APP_TABLE_NAME || '',
    appMediaBucket: process.env.APP_MEDIA_BUCKET || '',
    cognitoUserPoolId: process.env.APP_COGNITO_USER_POOL_ID || '',
    cognitoClientId: process.env.APP_COGNITO_CLIENT_ID || '',
    adminSub: process.env.APP_ADMIN_SUB || '',
    sesFromEmail: process.env.SES_FROM_EMAIL || '',
    contactToEmail: process.env.CONTACT_TO_EMAIL || '',
    session: {
      name: 'photo-admin',
      password: process.env.NUXT_SESSION_PASSWORD || '',
      maxAge: 60 * 60 * 8,
      cookie: { sameSite: 'lax' },
    },
    public: {
      mediaBaseUrl: (process.env.NUXT_PUBLIC_MEDIA_BASE_URL || '').replace(/\/+$/, ''),
    }
  },

  routeRules: {
    // Public pages + public read APIs: let the CDN absorb traffic.
    '/': { headers: PUBLIC_CACHE },
    '/about': { headers: PUBLIC_CACHE },
    '/faq': { headers: PUBLIC_CACHE },
    '/portfolio/**': { headers: PUBLIC_CACHE },
    '/blog/**': { headers: PUBLIC_CACHE },
    '/api/**': { headers: NO_STORE },
    '/api/blog': { headers: PUBLIC_CACHE },
    '/api/portfolio': { headers: PUBLIC_CACHE },
    '/api/testimonials': { headers: PUBLIC_CACHE },
    '/api/categories': { headers: PUBLIC_CACHE },
    // Admin: client-rendered, never cached.
    '/admin/**': { ssr: false, headers: NO_STORE },
  },

  nitro: {
    awsAmplify: { runtime: 'nodejs20.x' },
  },

  googleFonts: {
    families: {
      'Playfair+Display': [400, 500, 600, 700],
      'Montserrat': [300, 400, 500, 600]
    },
    display: 'swap'
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Photography Portfolio',
      meta: [
        { name: 'description', content: 'Professional photography portfolio showcasing stunning visuals and artistic excellence' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/web_icon.png' }
      ]
    }
  }
})
