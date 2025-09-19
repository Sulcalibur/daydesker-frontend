export default defineNuxtPlugin(async () => {
  // Initialize the auth store and await token restoration and user data fetching
  const authStore = useAuthStore()
  
  // Wait for auth initialization to complete before continuing
  await authStore.initializeAuth()
  
  console.log('🔐 Auth plugin loaded, store initialization completed')
})