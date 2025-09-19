import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import type { Message } from './useMessaging'

export interface SearchFilters {
  query: string
  conversationId?: number
  senderId?: number
  messageType?: 'text' | 'image' | 'file' | 'system'
  dateFrom?: string
  dateTo?: string
  hasAttachments?: boolean
  hasReactions?: boolean
  isEdited?: boolean
}

export interface SearchResult {
  message: Message
  highlights: string[]
  context: {
    before: Message[]
    after: Message[]
  }
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export const useMessageSearch = () => {
  const searchResults: Ref<SearchResult[]> = ref([])
  const isSearching = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const filters: Ref<SearchFilters> = ref({
    query: '',
    conversationId: undefined,
    senderId: undefined,
    messageType: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    hasAttachments: undefined,
    hasReactions: undefined,
    isEdited: undefined
  })
  
  const pagination = ref({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  })

  const searchHistory: Ref<string[]> = ref([])
  const maxHistoryItems = 10

  // Computed properties
  const hasResults = computed(() => searchResults.value.length > 0)
  const hasMorePages = computed(() => pagination.value.page < pagination.value.total_pages)
  const isFirstPage = computed(() => pagination.value.page === 1)
  const isLastPage = computed(() => pagination.value.page >= pagination.value.total_pages)

  // Search messages
  const searchMessages = async (searchFilters?: Partial<SearchFilters>, page = 1) => {
    try {
      isSearching.value = true
      error.value = null

      // Update filters if provided
      if (searchFilters) {
        filters.value = { ...filters.value, ...searchFilters }
      }

      // Don't search if no query
      if (!filters.value.query.trim()) {
        searchResults.value = []
        pagination.value = { page: 1, per_page: 20, total: 0, total_pages: 0 }
        return
      }

      const searchParams = {
        ...filters.value,
        page,
        per_page: pagination.value.per_page
      }

      // Remove undefined values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key as keyof typeof searchParams] === undefined) {
          delete searchParams[key as keyof typeof searchParams]
        }
      })

      const response = await $fetch<{
        success: boolean
        data: SearchResponse
      }>('/api/messages/search', {
        method: 'GET',
        query: searchParams
      })

      if (response.success) {
        if (page === 1) {
          searchResults.value = response.data.results
        } else {
          // Append results for pagination
          searchResults.value.push(...response.data.results)
        }

        pagination.value = {
          page: response.data.page,
          per_page: response.data.per_page,
          total: response.data.total,
          total_pages: response.data.total_pages
        }

        // Add to search history
        addToSearchHistory(filters.value.query)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to search messages'
      console.error('Error searching messages:', err)
    } finally {
      isSearching.value = false
    }
  }

  // Load more results (pagination)
  const loadMoreResults = async () => {
    if (hasMorePages.value && !isSearching.value) {
      await searchMessages(undefined, pagination.value.page + 1)
    }
  }

  // Quick search (debounced)
  let searchTimeout: NodeJS.Timeout
  const quickSearch = (query: string, debounceMs = 300) => {
    clearTimeout(searchTimeout)
    searchQuery.value = query
    
    searchTimeout = setTimeout(() => {
      searchMessages({ query })
    }, debounceMs)
  }

  // Advanced search with filters
  const advancedSearch = async (searchFilters: Partial<SearchFilters>) => {
    await searchMessages(searchFilters, 1)
  }

  // Clear search results
  const clearSearch = () => {
    searchResults.value = []
    searchQuery.value = ''
    filters.value = {
      query: '',
      conversationId: undefined,
      senderId: undefined,
      messageType: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      hasAttachments: undefined,
      hasReactions: undefined,
      isEdited: undefined
    }
    pagination.value = { page: 1, per_page: 20, total: 0, total_pages: 0 }
    error.value = null
  }

  // Search within conversation
  const searchInConversation = async (conversationId: number, query: string) => {
    await searchMessages({ query, conversationId }, 1)
  }

  // Search by message type
  const searchByType = async (messageType: SearchFilters['messageType'], query = '') => {
    await searchMessages({ query, messageType }, 1)
  }

  // Search by date range
  const searchByDateRange = async (dateFrom: string, dateTo: string, query = '') => {
    await searchMessages({ query, dateFrom, dateTo }, 1)
  }

  // Search messages with attachments
  const searchWithAttachments = async (query = '') => {
    await searchMessages({ query, hasAttachments: true }, 1)
  }

  // Search messages with reactions
  const searchWithReactions = async (query = '') => {
    await searchMessages({ query, hasReactions: true }, 1)
  }

  // Add to search history
  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return
    
    // Remove if already exists
    const index = searchHistory.value.indexOf(query)
    if (index > -1) {
      searchHistory.value.splice(index, 1)
    }
    
    // Add to beginning
    searchHistory.value.unshift(query)
    
    // Limit history size
    if (searchHistory.value.length > maxHistoryItems) {
      searchHistory.value = searchHistory.value.slice(0, maxHistoryItems)
    }
    
    // Save to localStorage
    try {
      localStorage.setItem('messageSearchHistory', JSON.stringify(searchHistory.value))
    } catch (err) {
      console.warn('Failed to save search history:', err)
    }
  }

  // Load search history from localStorage
  const loadSearchHistory = () => {
    try {
      const saved = localStorage.getItem('messageSearchHistory')
      if (saved) {
        searchHistory.value = JSON.parse(saved)
      }
    } catch (err) {
      console.warn('Failed to load search history:', err)
    }
  }

  // Clear search history
  const clearSearchHistory = () => {
    searchHistory.value = []
    try {
      localStorage.removeItem('messageSearchHistory')
    } catch (err) {
      console.warn('Failed to clear search history:', err)
    }
  }

  // Get search suggestions
  const getSearchSuggestions = (query: string): string[] => {
    if (!query.trim()) return searchHistory.value
    
    return searchHistory.value.filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Highlight search terms in text
  const highlightSearchTerms = (text: string, terms: string[]): string => {
    if (!terms.length) return text
    
    let highlightedText = text
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>')
    })
    
    return highlightedText
  }

  // Format search result snippet
  const formatSearchSnippet = (content: string, maxLength = 150): string => {
    if (content.length <= maxLength) return content
    
    const truncated = content.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...'
  }

  // Initialize search history on mount
  loadSearchHistory()

  // Watch for search query changes
  watch(searchQuery, (newQuery) => {
    if (newQuery.trim()) {
      quickSearch(newQuery)
    } else {
      clearSearch()
    }
  })

  return {
    searchResults: readonly(searchResults),
    isSearching: readonly(isSearching),
    error: readonly(error),
    searchQuery,
    filters: readonly(filters),
    pagination: readonly(pagination),
    searchHistory: readonly(searchHistory),
    hasResults,
    hasMorePages,
    isFirstPage,
    isLastPage,
    searchMessages,
    loadMoreResults,
    quickSearch,
    advancedSearch,
    clearSearch,
    searchInConversation,
    searchByType,
    searchByDateRange,
    searchWithAttachments,
    searchWithReactions,
    addToSearchHistory,
    loadSearchHistory,
    clearSearchHistory,
    getSearchSuggestions,
    highlightSearchTerms,
    formatSearchSnippet
  }
}