export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // If not authenticated, redirect to login
  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }
  
  // If authenticated but no user data, the store will handle fetching
  // This is handled by the useAuth composable in components
})