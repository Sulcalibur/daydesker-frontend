export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // First check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }
  
  // If authenticated but not a provider, redirect to appropriate dashboard
  if (!authStore.isProvider) {
    if (authStore.isSeeker) {
      return navigateTo('/dashboard/seeker')
    }
    // If user type is unknown, redirect to login
    return navigateTo('/auth/login')
  }
})