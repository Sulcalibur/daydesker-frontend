<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import type { Conversation, Message } from '~/composables/useMessaging'
import { useMessaging } from '~/composables/useMessaging'
import { useMessageReplies } from '~/composables/useMessageReplies'
import { useMessagingStore } from '~/stores/messaging'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'

interface Props {
  conversation?: Conversation
  currentUserId?: number
}

const props = withDefaults(defineProps<Props>(), {
  currentUserId: 1 // Mock current user ID
})

// Composables and stores
const { sendMessage, subscribeToConversation } = useMessaging()
const { setReplyContext, clearReplyContext, replyContext } = useMessageReplies()
const messagingStore = useMessagingStore()

// Refs
const messagesContainer = ref<HTMLElement>()
const isLoading = ref(false)
const isLoadingMore = ref(false)

// Computed
const messages = computed(() => {
  if (!props.conversation) return []
  return messagingStore.getMessagesForConversation(props.conversation.id)
})

const conversationTitle = computed(() => {
  if (!props.conversation) return 'Select a conversation'
  
  if (props.conversation.title) {
    return props.conversation.title
  }
  
  if (props.conversation.type === 'direct') {
    const otherParticipants = props.conversation.participants.filter(id => id !== props.currentUserId)
    return otherParticipants.length > 0 ? `User ${otherParticipants[0]}` : 'Direct Message'
  }
  
  return `Group Chat (${props.conversation.participants.length} members)`
})

const participantCount = computed(() => {
  return props.conversation?.participants.length || 0
})

const typingUsers = computed(() => {
  if (!props.conversation) return []
  return messagingStore.getTypingUsers(props.conversation.id)
    .filter(userId => userId !== props.currentUserId)
})

// Methods
const scrollToBottom = async (smooth = true) => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }
}

const handleSendMessage = async (content: string, type: Message['type']) => {
  if (!props.conversation) return
  
  try {
    isLoading.value = true
    const replyToId = replyContext.value?.id
    await sendMessage(props.conversation.id, content, type, replyToId)
    
    // Clear reply context after sending
    if (replyToId) {
      clearReplyContext()
    }
    
    await scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
    // TODO: Show error toast
  } finally {
    isLoading.value = false
  }
}

const handleReply = (message: Message) => {
  setReplyContext(message)
}

const handleTyping = (isTyping: boolean) => {
  if (!props.conversation) return
  
  if (isTyping) {
    messagingStore.setUserTyping(props.conversation.id, props.currentUserId)
  } else {
    messagingStore.setUserStoppedTyping(props.conversation.id, props.currentUserId)
  }
}

// Handle attachment deletion
const handleDeleteAttachment = async (attachmentId: number) => {
  try {
    const response = await $fetch(`/api/message-attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.success) {
      // Refresh messages to update the UI
      await messaging.fetchMessages(props.conversation!.id)
    }
  } catch (error) {
    console.error('Failed to delete attachment:', error)
  }
}

// Handle file uploaded event
const handleFileUploaded = (attachments: any[]) => {
  // Refresh messages to show the new attachment
  messaging.fetchMessages(props.conversation!.id)
}

const loadMoreMessages = async () => {
  if (!props.conversation || isLoadingMore.value) return
  
  try {
    isLoadingMore.value = true
    // TODO: Implement pagination
    console.log('Loading more messages...')
  } catch (error) {
    console.error('Failed to load more messages:', error)
  } finally {
    isLoadingMore.value = false
  }
}

// Watch for conversation changes
watch(
  () => props.conversation,
  async (newConversation, oldConversation) => {
    if (newConversation && newConversation.id !== oldConversation?.id) {
      // Subscribe to the new conversation
      subscribeToConversation(newConversation.id)
      
      // Scroll to bottom when switching conversations
      await scrollToBottom(false)
    }
  },
  { immediate: true }
)

// Watch for new messages and scroll to bottom
watch(
  messages,
  async (newMessages, oldMessages) => {
    if (newMessages.length > oldMessages.length) {
      await scrollToBottom()
    }
  },
  { deep: true }
)

// Scroll to bottom on mount
onMounted(() => {
  scrollToBottom(false)
})
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
      <div v-if="conversation" class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Avatar -->
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
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
          
          <!-- Conversation Info -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              {{ conversationTitle }}
            </h2>
            <p class="text-sm text-gray-500">
              {{ conversation.type === 'group' ? `${participantCount} members` : 'Online' }}
            </p>
            <!-- Workspace Context -->
            <div v-if="conversation.workspace" class="flex items-center gap-1 mt-1">
              <Icon name="lucide:building" class="w-3 h-3 text-blue-500" />
              <span class="text-xs text-blue-600 font-medium">
                {{ conversation.workspace.name }} ({{ conversation.workspace.type }})
              </span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Call"
          >
            <Icon name="lucide:phone" class="w-5 h-5" />
          </button>
          <button
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Video call"
          >
            <Icon name="lucide:video" class="w-5 h-5" />
          </button>
          <button
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="More options"
          >
            <Icon name="lucide:more-vertical" class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <!-- No Conversation Selected -->
      <div v-else class="text-center">
        <h2 class="text-lg font-semibold text-gray-900">
          Select a conversation
        </h2>
        <p class="text-sm text-gray-500">
          Choose a conversation from the sidebar to start messaging
        </p>
      </div>
    </div>

    <!-- Messages Area -->
    <div 
      v-if="conversation"
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-1"
    >
      <!-- Load More Button -->
      <div v-if="messages.length > 0" class="text-center mb-4">
        <button
          @click="loadMoreMessages"
          :disabled="isLoadingMore"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <Icon 
            v-if="isLoadingMore"
            name="lucide:loader-2" 
            class="w-4 h-4 animate-spin inline mr-2" 
          />
          {{ isLoadingMore ? 'Loading...' : 'Load more messages' }}
        </button>
      </div>

      <!-- Messages -->
      <div v-if="messages.length > 0">
        <MessageBubble
          v-for="(message, index) in messages"
          :key="message.id"
          :message="message"
          :messages="messages"
          :is-own="message.sender_id === currentUserId"
          :show-avatar="message.sender_id !== messages[index - 1]?.sender_id"
          :show-timestamp="true"
          :show-reply-button="true"
          :conversation-id="conversation.id"
          @delete-attachment="handleDeleteAttachment"
          @reply="handleReply"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <Icon name="lucide:message-circle" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            No messages yet
          </h3>
          <p class="text-gray-500">
            Send a message to start the conversation
          </p>
        </div>
      </div>

      <!-- Typing Indicators -->
      <div v-if="typingUsers.length > 0" class="flex items-center gap-2 px-4 py-2">
        <div class="flex gap-1">
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
        <span class="text-sm text-gray-500">
          {{ typingUsers.length === 1 
            ? `User ${typingUsers[0]} is typing...` 
            : `${typingUsers.length} people are typing...` 
          }}
        </span>
      </div>
    </div>

    <!-- No Conversation Selected State -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <Icon name="lucide:message-square" class="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          Welcome to Messages
        </h3>
        <p class="text-gray-500 max-w-sm">
          Select a conversation from the sidebar to start messaging, or create a new conversation.
        </p>
      </div>
    </div>

    <!-- Message Input -->
    <div v-if="conversation" class="flex-shrink-0">
      <MessageInput
        :conversation-id="conversation.id"
        :disabled="isLoading"
        @send="handleSendMessage"
        @typing="handleTyping"
        @file-uploaded="handleFileUploaded"
      />
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for messages */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f9fafb;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Smooth scrolling */
.overflow-y-auto {
  scroll-behavior: smooth;
}

/* Typing animation */
@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out;
}
</style>