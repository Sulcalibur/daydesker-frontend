import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  
  // Computed properties
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isProvider = computed(() => user.value?.user_type === 'workspace_provider')
  const isSeeker = computed(() => user.value?.user_type === 'desk_seeker')
  
  // Actions
  const setUser = (userData: User) => {
    user.value = userData
  }
  
  const setToken = (tokenValue: string) => {
    token.value = tokenValue
    // Store in secure cookie
    const tokenCookie = useCookie('auth-token', {
      httpOnly: false, // Note: httpOnly true only works server-side
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    tokenCookie.value = tokenValue
  }
  
  const clearAuth = () => {
    user.value = null
    token.value = null
    const tokenCookie = useCookie('auth-token')
    tokenCookie.value = null
  }
  
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }
  
  // Initialize auth state from cookie on store creation
  const initializeAuth = async () => {
    const tokenCookie = useCookie('auth-token')
    if (tokenCookie.value) {
      token.value = tokenCookie.value
      // If we have a token but no user data, fetch it
      if (!user.value) {
        try {
          await fetchUserData()
        } catch (error) {
          console.warn('Failed to fetch user data during initialization:', error)
          // Clear invalid token
          clearAuth()
        }
      }
    }
  }
  
  // Fetch user data using the current token
  const fetchUserData = async () => {
    if (!token.value) {
      throw new Error('No authentication token')
    }
    
    try {
      setLoading(true)
      const { getUser } = useApi()
      const userData = await getUser()
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }
  
  // Initialize auth state immediately when store is created
  // Only run on client-side to avoid SSR issues
  if (process.client) {
    initializeAuth()
  }
  
  // Get dashboard route based on user type
  const getDashboardRoute = () => {
    if (!user.value) return '/auth/login'
    return isProvider.value ? '/dashboard/provider' : '/dashboard/seeker'
  }
  
  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    
    // Computed
    isAuthenticated,
    isProvider,
    isSeeker,
    
    // Actions
    setUser,
    setToken,
    clearAuth,
    setLoading,
    initializeAuth,
    fetchUserData,
    getDashboardRoute
  }
})