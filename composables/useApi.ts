import type { 
  Workspace, 
  WorkspaceFilters, 
  PaginatedResponse, 
  ApiResponse,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User
} from '~/types'

export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl

  // Generic API fetch wrapper with authentication and error handling
  const apiFetch = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    try {
      const token = useCookie('auth-token')
      
      const response = await $fetch<T>(`${apiBaseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token.value && { 'Authorization': `Bearer ${token.value}` }),
          ...options.headers,
        },
        onResponseError({ response }) {
          if (response.status === 401) {
            // Handle unauthorized - clear token and redirect to login
            const tokenCookie = useCookie('auth-token')
            tokenCookie.value = null
            navigateTo('/auth/login')
          }
        }
      })

      return response
    } catch (error) {
      console.error(`API Error at ${endpoint}:`, error)
      throw createError({
        statusCode: error?.statusCode || 500,
        statusMessage: error?.data?.message || 'An error occurred',
        data: error?.data
      })
    }
  }

  // Fetch paginated list of workspaces
  const getWorkspaces = async (
    filters: WorkspaceFilters = {}
  ): Promise<PaginatedResponse<Workspace>> => {
    const params = new URLSearchParams()
    
    // Add filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const query = params.toString() ? `?${params.toString()}` : ''
    return await apiFetch<PaginatedResponse<Workspace>>(`/api/workspaces${query}`)
  }

  // Fetch single workspace by ID
  const getWorkspace = async (id: number): Promise<Workspace> => {
    return await apiFetch<Workspace>(`/api/workspaces/${id}`)
  }

  // Get unique cities for filter dropdown
  const getWorkspaceCities = async (): Promise<string[]> => {
    try {
      const response = await apiFetch<PaginatedResponse<Workspace>>('/api/workspaces?per_page=1000')
      const cities = [...new Set(response.data.map(workspace => workspace.city))]
      return cities.sort()
    } catch (error) {
      console.error('Error fetching cities:', error)
      return []
    }
  }

  // Get workspace types for filter dropdown
  const getWorkspaceTypes = (): Array<{ value: string; label: string }> => {
    return [
      { value: 'desk', label: 'Hot Desk' },
      { value: 'meeting_room', label: 'Meeting Room' },
      { value: 'private_office', label: 'Private Office' },
      { value: 'coworking_space', label: 'Coworking Space' },
    ]
  }

  // Authentication API methods
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return await apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    return await apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  const logout = async (): Promise<void> => {
    return await apiFetch<void>('/api/auth/logout', {
      method: 'POST'
    })
  }

  const getUser = async (): Promise<User> => {
    return await apiFetch<User>('/api/user')
  }

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    return await apiFetch<User>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  const forgotPassword = async (email: string): Promise<{ message: string }> => {
    return await apiFetch<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  const resetPassword = async (data: { token: string; email: string; password: string; password_confirmation: string }): Promise<{ message: string }> => {
    return await apiFetch<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  return {
    apiFetch,
    // Workspace methods
    getWorkspaces,
    getWorkspace,
    getWorkspaceCities,
    getWorkspaceTypes,
    // Authentication methods
    login,
    register,
    logout,
    getUser,
    updateProfile,
    forgotPassword,
    resetPassword,
  }
}