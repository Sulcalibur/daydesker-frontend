import type { LoginCredentials, RegisterData, User } from '~/types'
import { useAuthStore } from '~/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()
  const { login: apiLogin, register: apiRegister, logout: apiLogout, getUser: apiGetUser, updateProfile: apiUpdateProfile } = useApi()
  
  // Initialize auth state on composable creation (client-side only)
  onMounted(() => {
    // If we have a token but no user, fetch user data
    if (authStore.token && !authStore.user) {
      authStore.fetchUserData().catch((error) => {
        console.warn('Failed to fetch user data on mount:', error)
      })
    }
  })
  
  const login = async (credentials: LoginCredentials) => {
    try {
      authStore.setLoading(true)
      const response = await apiLogin(credentials)
      
      authStore.setUser(response.user)
      authStore.setToken(response.token)
      
      // Redirect to appropriate dashboard
      const dashboardRoute = authStore.getDashboardRoute()
      await navigateTo(dashboardRoute)
      
      return response
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }
  
  const register = async (data: RegisterData) => {
    try {
      authStore.setLoading(true)
      const response = await apiRegister(data)
      
      authStore.setUser(response.user)
      authStore.setToken(response.token)
      
      // Redirect to appropriate dashboard
      const dashboardRoute = authStore.getDashboardRoute()
      await navigateTo(dashboardRoute)
      
      return response
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }
  
  const logout = async () => {
    try {
      authStore.setLoading(true)
      
      // Call API logout if we have a token
      if (authStore.token) {
        try {
          await apiLogout()
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error)
        }
      }
      
      // Clear local auth state
      authStore.clearAuth()
      
      // Redirect to login
      await navigateTo('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear auth state on error
      authStore.clearAuth()
      await navigateTo('/')
    } finally {
      authStore.setLoading(false)
    }
  }
  
  const fetchUser = async () => {
    try {
      return await authStore.fetchUserData()
    } catch (error) {
      console.error('Fetch user error:', error)
      // If fetching user fails, clear auth state
      authStore.clearAuth()
      throw error
    }
  }
  
  const updateProfile = async (data: Partial<User>) => {
    try {
      authStore.setLoading(true)
      const updatedUser = await apiUpdateProfile(data)
      authStore.setUser(updatedUser)
      return updatedUser
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }
  
  // Check if user has required role
  const hasRole = (role: 'desk_seeker' | 'workspace_provider') => {
    return authStore.user?.user_type === role
  }
  
  // Check if user is verified
  const isVerified = computed(() => authStore.user?.is_verified ?? false)
  
  return {
    // State from store
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isProvider: authStore.isProvider,
    isSeeker: authStore.isSeeker,
    isLoading: authStore.isLoading,
    isVerified,
    
    // Actions
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    hasRole,
    
    // Utility
    getDashboardRoute: authStore.getDashboardRoute
  }
}