export interface User {
  id: number
  name: string
  email: string
  user_type: 'desk_seeker' | 'workspace_provider'
  bio?: string
  created_at: string
  updated_at: string
}

export interface WorkspaceProvider {
  id: number
  business_name: string
  description?: string
  website?: string
  phone?: string
  is_verified: boolean
  user_name?: string
  user_bio?: string
}

export interface Workspace {
  id: number
  name: string
  description?: string
  type: 'desk' | 'meeting_room' | 'private_office' | 'coworking_space'
  capacity: number
  hourly_rate: number
  daily_rate?: number
  monthly_rate?: number
  address: string
  city: string
  state?: string
  country: string
  postal_code?: string
  amenities: string[]
  images: string[]
  is_active: boolean
  provider: WorkspaceProvider
  created_at: string
  updated_at: string
}

export interface WorkspaceFilters {
  search?: string
  type?: string
  city?: string
  min_price?: number
  max_price?: number
  capacity?: number
  sort_by?: 'created_at' | 'name' | 'hourly_rate' | 'capacity'
  sort_order?: 'asc' | 'desc'
  page?: number
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: PaginationLink[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

export interface PaginationLink {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// Workspace type display names
export const WORKSPACE_TYPES = {
  desk: 'Hot Desk',
  meeting_room: 'Meeting Room',
  private_office: 'Private Office',
  coworking_space: 'Coworking Space',
} as const

// Common amenities list
export const COMMON_AMENITIES = [
  'High-speed WiFi',
  'Printing services',
  'Coffee/tea',
  'Natural light',
  'Air conditioning',
  'Parking',
  'Kitchen access',
  'Phone booths',
  'Video conferencing',
  'Whiteboards',
  'Lockers',
  'Reception services',
  'Catering services',
  '24/7 access',
  'Security',
  'Cleaning services',
] as const

export type WorkspaceType = keyof typeof WORKSPACE_TYPES
export type CommonAmenity = typeof COMMON_AMENITIES[number]