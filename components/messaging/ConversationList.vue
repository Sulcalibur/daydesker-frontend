<script setup lang="ts">
import type { Conversation } from '~/composables/useMessaging'
import { useMessagingStore } from '~/stores/messaging'

interface Props {
  conversations: Conversation[]
  activeConversationId?: number
  loading?: boolean
}

interface Emits {
  (e: 'select', conversation: Conversation): void
  (e: 'create'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// Store
const messagingStore = useMessagingStore()

// Get conversation title
const getConversationTitle = (conversation: Conversation) => {
  if (conversation.title) {
    return conversation.title
  }
  
  // For direct messages, show participant names (excluding current user)
  if (conversation.type === 'direct') {
    // In a real app, this would fetch user names
    const otherParticipants = conversation.participants.filter(id => id !== 1) // Assuming current user ID is 1
    return otherParticipants.length > 0 ? `User ${otherParticipants[0]}` : 'Direct Message'
  }
  
  return `Group Chat (${conversation.participants.length} members)`
}

// Get last message preview
const getLastMessagePreview = (conversationId: number) => {
  const messages = messagingStore.getMessagesForConversation(conversationId)
  const lastMessage = messages[messages.length - 1]
  
  if (!lastMessage) {
    return 'No messages yet'
  }
  
  let preview = lastMessage.content
  if (preview.length > 50) {
    preview = preview.substring(0, 50) + '...'
  }
  
  // Add type indicator for non-text messages
  if (lastMessage.type !== 'text') {
    const typeIcon = {
      image: '📷',
      file: '📎',
      system: 'ℹ️'
    }[lastMessage.type] || ''
    preview = `${typeIcon} ${preview}`
  }
  
  return preview
}

// Get unread count for conversation
const getUnreadCount = (conversationId: number) => {
  return messagingStore.getUnreadCount(conversationId)
}

// Format last message time
const formatLastMessageTime = (timestamp?: string) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'now'
  } else if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  } else if (diffInHours < 168) { // 7 days
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

// Handle conversation selection
const selectConversation = (conversation: Conversation) => {
  emit('select', conversation)
}

// Handle create new conversation
const createConversation = () => {
  emit('create')
}
</script>

<template>
  <div class="h-full flex flex-col bg-white border-r border-gray-200">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">
          Messages
        </h2>
        <button
          @click="createConversation"
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          title="New conversation"
        >
          <Icon name="lucide:plus" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="p-4 border-b border-gray-200">
      <div class="relative">
        <Icon 
          name="lucide:search" 
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
        />
        <input
          type="text"
          placeholder="Search conversations..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
      </div>
    </div>

    <!-- Conversations List -->
    <div class="flex-1 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="loading" class="p-4">
        <div v-for="i in 3" :key="i" class="mb-4 animate-pulse">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="conversations.length === 0" class="p-8 text-center">
        <Icon name="lucide:message-circle" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No conversations yet
        </h3>
        <p class="text-gray-500 mb-4">
          Start a new conversation to begin messaging.
        </p>
        <button
          @click="createConversation"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Start Conversation
        </button>
      </div>

      <!-- Conversation Items -->
      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          @click="selectConversation(conversation)"
          class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          :class="{
            'bg-blue-50 border-r-2 border-blue-500': activeConversationId === conversation.id
          }"
        >
          <div class="flex items-center gap-3">
            <!-- Avatar -->
            <div class="relative flex-shrink-0">
              <div 
                class="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium"
                :class="{
                  'bg-blue-500 text-white': conversation.type === 'direct',
                  'bg-green-500 text-white': conversation.type === 'group'
                }"
              >
                <Icon 
                  :name="conversation.type === 'direct' ? 'lucide:user' : 'lucide:users'"
                  class="w-5 h-5"
                />
              </div>
              
              <!-- Online Status (for direct messages) -->
              <div 
                v-if="conversation.type === 'direct'"
                class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"
              ></div>
            </div>

            <!-- Conversation Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-sm font-medium text-gray-900 truncate">
                  {{ getConversationTitle(conversation) }}
                </h3>
                <span class="text-xs text-gray-500 flex-shrink-0">
                  {{ formatLastMessageTime(conversation.last_message_at) }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-600 truncate">
                  {{ getLastMessagePreview(conversation.id) }}
                </p>
                
                <!-- Unread Badge -->
                <div 
                  v-if="getUnreadCount(conversation.id) > 0"
                  class="flex-shrink-0 ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full min-w-[20px] text-center"
                >
                  {{ getUnreadCount(conversation.id) > 99 ? '99+' : getUnreadCount(conversation.id) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>