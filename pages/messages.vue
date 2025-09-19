<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessaging } from '~/composables/useMessaging'
import { useMessagingStore } from '~/stores/messaging'
import type { Conversation } from '~/composables/useMessaging'
import ConversationList from '~/components/messaging/ConversationList.vue'
import ChatWindow from '~/components/messaging/ChatWindow.vue'

// Meta
definePageMeta({
  title: 'Messages',
  layout: 'default'
})

// Composables and stores
const messaging = useMessaging()
const messagingStore = useMessagingStore()

// State
const selectedConversation = ref<Conversation | null>(null)
const isSidebarOpen = ref(true)
const currentUserId = ref(1) // Mock current user ID
const isCreatingConversation = ref(false)

// Computed
const conversations = computed(() => messagingStore.conversations)
const connectionStatus = computed(() => {
  if (messagingStore.isLoading) {
    return { text: 'Connecting...', color: 'text-yellow-600', icon: 'lucide:loader-2' }
  }
  if (messagingStore.isConnected) {
    return { text: 'Connected', color: 'text-green-600', icon: 'lucide:wifi' }
  }
  if (messagingStore.error) {
    return { text: 'Connection Error', color: 'text-red-600', icon: 'lucide:alert-circle' }
  }
  return { text: 'Disconnected', color: 'text-red-600', icon: 'lucide:wifi-off' }
})

// Methods
const handleConversationSelect = (conversation: Conversation) => {
  selectedConversation.value = conversation
  
  // Close sidebar on mobile after selection
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false
  }
}

const handleNewConversation = () => {
  isCreatingConversation.value = true
  // TODO: Implement new conversation modal/form
  console.log('Creating new conversation...')
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleBackToList = () => {
  selectedConversation.value = null
  isSidebarOpen.value = true
}

// Mock data for development
const initializeMockData = () => {
  // Add some mock conversations
  const mockConversations: Conversation[] = [
    {
      id: 1,
      title: 'John Doe',
      type: 'direct',
      participants: [1, 2],
      last_message: {
        id: 1,
        conversation_id: 1,
        sender_id: 2,
        content: 'Hey, how are you doing?',
        type: 'text',
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read_at: null
      },
      unread_count: 2,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    },
    {
      id: 2,
      title: 'Project Team',
      type: 'group',
      participants: [1, 2, 3, 4],
      last_message: {
        id: 2,
        conversation_id: 2,
        sender_id: 3,
        content: 'The new feature is ready for testing',
        type: 'text',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read_at: new Date(Date.now() - 1000 * 60 * 25).toISOString()
      },
      unread_count: 0,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: 3,
      title: 'Sarah Wilson',
      type: 'direct',
      participants: [1, 5],
      last_message: {
        id: 3,
        conversation_id: 3,
        sender_id: 1,
        content: 'Thanks for the help!',
        type: 'text',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      unread_count: 0,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    }
  ]
  
  // Add conversations to store
  mockConversations.forEach(conversation => {
    messagingStore.addConversation(conversation)
    
    // Add some mock messages for each conversation
    const mockMessages = [
      {
        id: conversation.id * 10 + 1,
        conversation_id: conversation.id,
        sender_id: conversation.participants.find(id => id !== currentUserId.value) || 2,
        content: 'Hello there!',
        type: 'text' as const,
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read_at: new Date(Date.now() - 1000 * 60 * 50).toISOString()
      },
      {
        id: conversation.id * 10 + 2,
        conversation_id: conversation.id,
        sender_id: currentUserId.value,
        content: 'Hi! How can I help you?',
        type: 'text' as const,
        created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        read_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      }
    ]
    
    mockMessages.forEach(message => {
      messagingStore.addMessage(message)
    })
  })
}

// Lifecycle
onMounted(() => {
  // Initialize mock data for development
  initializeMockData()
  
  // Auto-select first conversation if available
  if (conversations.value.length > 0) {
    selectedConversation.value = conversations.value[0]
  }
})
</script>

<template>
  <div class="h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <div 
      class="flex-shrink-0 transition-all duration-300 ease-in-out"
      :class="{
        'w-80': isSidebarOpen,
        'w-0 md:w-80': !isSidebarOpen,
        'absolute inset-y-0 left-0 z-50 md:relative': true
      }"
    >
      <div 
        class="h-full bg-white border-r border-gray-200 overflow-hidden"
        :class="{
          'w-80': true,
          'shadow-lg md:shadow-none': isSidebarOpen
        }"
      >
        <!-- Sidebar Header -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-xl font-semibold text-gray-900">
              Messages
            </h1>
            <div class="flex items-center gap-2">
              <!-- Connection Status -->
              <div class="flex items-center gap-1">
                <Icon 
                  :name="connectionStatus.icon" 
                  :class="[
                    'w-4 h-4',
                    connectionStatus.color,
                    { 'animate-spin': messagingStore.isLoading }
                  ]"
                />
                <span class="text-xs" :class="connectionStatus.color">
                  {{ connectionStatus.text }}
                </span>
              </div>
              
              <!-- Mobile Close Button -->
              <button
                @click="toggleSidebar"
                class="md:hidden p-1 text-gray-500 hover:text-gray-700 rounded"
              >
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <!-- New Conversation Button -->
          <button
            @click="handleNewConversation"
            class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icon name="lucide:plus" class="w-4 h-4" />
            New Conversation
          </button>
        </div>
        
        <!-- Conversation List -->
        <ConversationList
          :conversations="conversations"
          :selected-conversation="selectedConversation"
          :current-user-id="currentUserId"
          :loading="false"
          @select="handleConversationSelect"
        />
      </div>
    </div>

    <!-- Sidebar Overlay (Mobile) -->
    <div 
      v-if="isSidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    ></div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Mobile Header -->
      <div class="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <button
          @click="selectedConversation ? handleBackToList() : toggleSidebar()"
          class="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
        >
          <Icon name="lucide:arrow-left" class="w-5 h-5" />
        </button>
        
        <h2 v-if="selectedConversation" class="font-semibold text-gray-900">
          {{ selectedConversation.title || 'Chat' }}
        </h2>
        
        <div class="w-9"></div> <!-- Spacer -->
      </div>

      <!-- Chat Window -->
      <div class="flex-1">
        <ChatWindow
          :conversation="selectedConversation"
          :current-user-id="currentUserId"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure full height */
.h-screen {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for mobile */
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .w-80 {
    width: 100vw;
  }
}
</style>