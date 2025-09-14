// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // App configuration
  app: {
    head: {
      title: 'DayDeskr - Find Your Perfect Workspace',
      meta: [
        { name: 'description', content: 'Discover and book flexible workspaces, hot desks, meeting rooms, and private offices. Perfect for remote workers, freelancers, and teams.' },
        { name: 'keywords', content: 'coworking, workspace, hot desk, meeting room, private office, remote work, freelancer' },
        { name: 'author', content: 'DayDeskr' },
        { property: 'og:title', content: 'DayDeskr - Find Your Perfect Workspace' },
        { property: 'og:description', content: 'Discover and book flexible workspaces, hot desks, meeting rooms, and private offices.' },
        { property: 'og:type', content: 'website' }
      ]
    }
  },

  modules: [
    '@nuxt/fonts',
    '@nuxt/icon', 
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt'
  ],

  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://daydeskr-api-production.up.railway.app',
    }
  },

  // Tailwind CSS configuration
  tailwindcss: {
    exposeConfig: false,
    viewer: true,
  },

  // Image optimization
  image: {
    quality: 80,
    format: ['webp', 'jpeg'],
    domains: ['images.unsplash.com'],
  },

  // Font configuration
  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
    ]
  },

  // Development configuration
  ssr: true,
  nitro: {
    prerender: {
      routes: ['/sitemap.xml']
    }
  },

  // Performance optimizations
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true
  }
})