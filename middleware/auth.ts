export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/search',
    '/messages' // Allow messages page for development
  ]
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(to.path) || to.path.startsWith('/auth/')
  
  // If accessing a public route, allow access immediately
  if (isPublicRoute) {
    return
  }
  
  // For protected routes, wait for auth initialization to complete
  // This ensures we have the correct authentication state before deciding
  if (authStore.isLoading) {
    await authStore.initializeAuth()
  }
  
  // Now check authentication status after initialization is complete
  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }
})