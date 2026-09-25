// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@nuxtjs/google-fonts',
    '@vueuse/motion/nuxt',
    '@nuxtjs/supabase'
  ],

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    redirect: false,
    types: false
  },
  
  css: [
    '~/assets/css/main.css',
    '~/assets/css/animations.css'
  ],
  runtimeConfig: {
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    public: {
      web3formsKey1: process.env.NUXT_PUBLIC_WEB3FORMS_KEY1 || '',
      web3formsKey2: process.env.NUXT_PUBLIC_WEB3FORMS_KEY2 || '',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      cloudinaryCloudName: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    }
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