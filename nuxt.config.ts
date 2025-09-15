// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@pinia/nuxt'
  ],
  
  // Configure for Cloudflare Pages
  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      routes: ['/workspaces/1', '/workspaces/2', '/workspaces/3', '/workspaces/4', '/workspaces/5', '/workspaces/6']
    }
  },
  
  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'https://daydeskr-api-production.up.railway.app',
    }
  },
  
  // Font configuration
  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
    ]
  }
})
