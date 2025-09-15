export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // First check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }
  
  // If authenticated but not a seeker, redirect to appropriate dashboard
  if (!authStore.isSeeker) {
    if (authStore.isProvider) {
      return navigateTo('/dashboard/provider')
    }
    // If user type is unknown, redirect to login
    return navigateTo('/auth/login')
  }
})