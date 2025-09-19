<template>
  <div class="message-search">
    <!-- Search Header -->
    <div class="search-header bg-white border-b border-gray-200 p-4">
      <div class="flex items-center gap-3">
        <button 
          @click="$emit('close')"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon class="w-5 h-5 text-gray-600" />
        </button>
        <h2 class="text-lg font-semibold text-gray-900">Search Messages</h2>
      </div>
    </div>

    <!-- Search Input -->
    <div class="search-input p-4 bg-white border-b border-gray-200">
      <div class="relative">
        <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search messages..."
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @keydown.enter="handleSearch"
          @focus="showSuggestions = true"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
        >
          <XIcon class="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <!-- Search Suggestions -->
      <div 
        v-if="showSuggestions && suggestions.length > 0"
        class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
      >
        <div
          v-for="suggestion in suggestions"
          :key="suggestion"
          @click="selectSuggestion(suggestion)"
          class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
        >
          <SearchIcon class="inline w-4 h-4 mr-2 text-gray-400" />
          {{ suggestion }}
        </div>
        <div class="border-t border-gray-100 p-2">
          <button
            @click="clearSearchHistory"
            class="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear search history
          </button>
        </div>
      </div>
    </div>

    <!-- Advanced Filters -->
    <div class="filters p-4 bg-gray-50 border-b border-gray-200">
      <button
        @click="showAdvancedFilters = !showAdvancedFilters"
        class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-3"
      >
        <FilterIcon class="w-4 h-4" />
        Advanced Filters
        <ChevronDownIcon 
          :class="['w-4 h-4 transition-transform', showAdvancedFilters ? 'rotate-180' : '']"
        />
      </button>

      <div v-if="showAdvancedFilters" class="space-y-4">
        <!-- Message Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
          <select
            v-model="localFilters.messageType"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All types</option>
            <option value="text">Text messages</option>
            <option value="image">Images</option>
            <option value="file">Files</option>
            <option value="system">System messages</option>
          </select>
        </div>

        <!-- Date Range Filter -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              v-model="localFilters.dateFrom"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              v-model="localFilters.dateTo"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Additional Filters -->
        <div class="space-y-2">
          <label class="flex items-center gap-2">
            <input
              v-model="localFilters.hasAttachments"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">Has attachments</span>
          </label>
          <label class="flex items-center gap-2">
            <input
              v-model="localFilters.hasReactions"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">Has reactions</span>
          </label>
          <label class="flex items-center gap-2">
            <input
              v-model="localFilters.isEdited"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">Edited messages</span>
          </label>
        </div>

        <!-- Filter Actions -->
        <div class="flex gap-2 pt-2">
          <button
            @click="applyFilters"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Apply Filters
          </button>
          <button
            @click="resetFilters"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div class="search-results flex-1 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="isSearching" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Searching...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 text-center">
        <div class="text-red-600 mb-2">{{ error }}</div>
        <button
          @click="handleSearch"
          class="text-blue-600 hover:text-blue-700 text-sm"
        >
          Try again
        </button>
      </div>

      <!-- No Results -->
      <div v-else-if="!hasResults && searchQuery" class="p-8 text-center">
        <SearchIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
        <p class="text-gray-600">Try adjusting your search terms or filters</p>
      </div>

      <!-- Search Results List -->
      <div v-else-if="hasResults" class="divide-y divide-gray-200">
        <div
          v-for="result in searchResults"
          :key="result.message.id"
          @click="$emit('select-message', result.message)"
          class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <!-- Message Header -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <img
                :src="result.message.sender.avatar_url || '/default-avatar.png'"
                :alt="result.message.sender.name"
                class="w-6 h-6 rounded-full"
              />
              <span class="font-medium text-gray-900 text-sm">
                {{ result.message.sender.name }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatDate(result.message.created_at) }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <FileIcon v-if="result.message.attachments?.length" class="w-4 h-4 text-gray-400" />
              <HeartIcon v-if="result.message.reactions?.length" class="w-4 h-4 text-red-400" />
              <EditIcon v-if="result.message.is_edited" class="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <!-- Message Content -->
          <div class="text-sm text-gray-700 mb-2">
            <div 
              v-html="highlightSearchTerms(formatSearchSnippet(result.message.content), result.highlights)"
              class="line-clamp-2"
            ></div>
          </div>

          <!-- Context Messages -->
          <div v-if="result.context.before.length || result.context.after.length" class="text-xs text-gray-500">
            <span v-if="result.context.before.length">
              {{ result.context.before.length }} message(s) before
            </span>
            <span v-if="result.context.before.length && result.context.after.length"> • </span>
            <span v-if="result.context.after.length">
              {{ result.context.after.length }} message(s) after
            </span>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMorePages" class="p-4 text-center border-t border-gray-200">
          <button
            @click="loadMoreResults"
            :disabled="isSearching"
            class="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 text-sm"
          >
            {{ isSearching ? 'Loading...' : 'Load more results' }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-8 text-center">
        <SearchIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Search Messages</h3>
        <p class="text-gray-600">Enter a search term to find messages across all conversations</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  SearchIcon,
  XIcon,
  ArrowLeftIcon,
  FilterIcon,
  ChevronDownIcon,
  FileIcon,
  HeartIcon,
  EditIcon
} from 'lucide-vue-next'
import { useMessageSearch } from '~/composables/useMessageSearch'
import type { Message } from '~/composables/useMessaging'
import type { SearchFilters } from '~/composables/useMessageSearch'

// Props
interface Props {
  conversationId?: number
  initialQuery?: string
}

const props = withDefaults(defineProps<Props>(), {
  conversationId: undefined,
  initialQuery: ''
})

// Emits
interface Emits {
  close: []
  'select-message': [message: Message]
}

const emit = defineEmits<Emits>()

// Composables
const {
  searchResults,
  isSearching,
  error,
  searchQuery,
  filters,
  pagination,
  searchHistory,
  hasResults,
  hasMorePages,
  searchMessages,
  loadMoreResults,
  quickSearch,
  advancedSearch,
  clearSearch,
  searchInConversation,
  getSearchSuggestions,
  highlightSearchTerms,
  formatSearchSnippet,
  clearSearchHistory
} = useMessageSearch()

// Local state
const showSuggestions = ref(false)
const showAdvancedFilters = ref(false)
const localFilters = ref<Partial<SearchFilters>>({
  messageType: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  hasAttachments: undefined,
  hasReactions: undefined,
  isEdited: undefined
})

// Computed
const suggestions = computed(() => {
  return getSearchSuggestions(searchQuery.value)
})

// Methods
const handleSearch = () => {
  showSuggestions.value = false
  if (props.conversationId) {
    searchInConversation(props.conversationId, searchQuery.value)
  } else {
    searchMessages({ query: searchQuery.value })
  }
}

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  handleSearch()
}

const applyFilters = () => {
  const searchFilters: Partial<SearchFilters> = {
    query: searchQuery.value,
    ...localFilters.value
  }
  
  if (props.conversationId) {
    searchFilters.conversationId = props.conversationId
  }
  
  advancedSearch(searchFilters)
  showAdvancedFilters.value = false
}

const resetFilters = () => {
  localFilters.value = {
    messageType: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    hasAttachments: undefined,
    hasReactions: undefined,
    isEdited: undefined
  }
  applyFilters()
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 24 * 7) {
    return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

// Click outside to hide suggestions
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.search-input')) {
    showSuggestions.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (props.initialQuery) {
    searchQuery.value = props.initialQuery
    handleSearch()
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for conversation changes
watch(() => props.conversationId, (newConversationId) => {
  if (newConversationId && searchQuery.value) {
    searchInConversation(newConversationId, searchQuery.value)
  }
})
</script>

<style scoped>
.message-search {
  @apply flex flex-col h-full;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(mark) {
  @apply bg-yellow-200 px-1 rounded;
}
</style>