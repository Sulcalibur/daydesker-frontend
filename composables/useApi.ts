import type { 
  Workspace, 
  WorkspaceFilters, 
  PaginatedResponse, 
  ApiResponse 
} from '~/types'

export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl

  // Generic API fetch wrapper with error handling
  const apiFetch = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    try {
      const response = await $fetch<T>(`${apiBaseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
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

  return {
    apiFetch,
    getWorkspaces,
    getWorkspace,
    getWorkspaceCities,
    getWorkspaceTypes,
  }
}