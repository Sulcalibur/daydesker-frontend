// Currency formatting
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Date formatting
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateString)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date)
}

// Pluralize helper
export const pluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return `${count} ${singular}`
  return `${count} ${plural || `${singular}s`}`
}

// Truncate text with ellipsis
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

// Generate slug from text
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Check if string is valid URL
export const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString)
    return true
  } catch {
    return false
  }
}

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Clamp number between min and max
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

// Format capacity text
export const formatCapacity = (capacity: number): string => {
  if (capacity === 1) return '1 person'
  return `${capacity} people`
}

// Get workspace type display name
export const getWorkspaceTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    desk: 'Hot Desk',
    meeting_room: 'Meeting Room',
    private_office: 'Private Office',
    coworking_space: 'Coworking Space',
  }
  return types[type] || type
}

// Calculate price range display
export const formatPriceRange = (
  hourlyRate: number,
  dailyRate?: number,
  monthlyRate?: number
): string => {
  const prices = [
    `${formatCurrency(hourlyRate)}/hr`,
    dailyRate ? `${formatCurrency(dailyRate)}/day` : null,
    monthlyRate ? `${formatCurrency(monthlyRate)}/mo` : null,
  ].filter(Boolean)

  if (prices.length === 1) return prices[0]
  return `From ${formatCurrency(hourlyRate)}/hr`
}

// Parse amenities string to array
export const parseAmenities = (amenities: string | string[]): string[] => {
  if (Array.isArray(amenities)) return amenities
  if (!amenities) return []
  
  try {
    return JSON.parse(amenities)
  } catch {
    // If JSON parsing fails, treat as comma-separated string
    return amenities.split(',').map(item => item.trim()).filter(Boolean)
  }
}

// Format address for display
export const formatAddress = (
  address: string,
  city: string,
  state?: string,
  country?: string,
  postalCode?: string
): string => {
  const parts = [address, city, state, country, postalCode].filter(Boolean)
  return parts.join(', ')
}

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}