export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // If already authenticated, redirect to appropriate dashboard
  if (authStore.isAuthenticated) {
    const dashboardRoute = authStore.getDashboardRoute()
    return navigateTo(dashboardRoute)
  }
})