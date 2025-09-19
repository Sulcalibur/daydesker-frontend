<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMessaging } from '~/composables/useMessaging'
import { useMessagingStore } from '~/stores/messaging'

// Page meta
definePageMeta({
  title: 'Test Messaging'
})

// Composables and stores
const { 
  isConnected, 
  connectionError, 
  initializePusher, 
  subscribeToConversation, 
  sendMessage,
  disconnect 
} = useMessaging()

const messagingStore = useMessagingStore()

// Reactive state
const testMessage = ref('')
const testConversationId = ref(1)
const connectionStatus = ref('Disconnected')
const logs = ref<string[]>([])
const isLoading = ref(false)

// Add log entry
const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`[${timestamp}] ${message}`)
  console.log(`[WebSocket Test] ${message}`)
}

// Test connection
const testConnection = async () => {
  try {
    isLoading.value = true
    addLog('Attempting to connect to Reverb WebSocket...')
    
    await initializePusher()
    
    // Wait a bit for connection to establish
    setTimeout(() => {
      if (isConnected.value) {
        connectionStatus.value = 'Connected'
        addLog('✅ Successfully connected to Reverb WebSocket')
      } else {
        connectionStatus.value = 'Failed'
        addLog('❌ Failed to connect to Reverb WebSocket')
        if (connectionError.value) {
          addLog(`Error: ${connectionError.value}`)
        }
      }
      isLoading.value = false
    }, 2000)
    
  } catch (error) {
    isLoading.value = false
    connectionStatus.value = 'Error'
    addLog(`❌ Connection error: ${error}`)
  }
}

// Test channel subscription
const testChannelSubscription = () => {
  try {
    addLog(`Attempting to subscribe to conversation.${testConversationId.value}...`)
    
    const channel = subscribeToConversation(testConversationId.value)
    
    if (channel) {
      addLog('✅ Successfully subscribed to conversation channel')
      
      // Listen for new messages
      channel.bind('message.sent', (data: any) => {
        addLog(`📨 Received message: ${JSON.stringify(data)}`)
        messagingStore.addMessage(testConversationId.value, data.message)
      })
      
      // Listen for typing indicators
      channel.bind('user.typing', (data: any) => {
        addLog(`⌨️ User typing: ${data.user_id}`)
        messagingStore.setUserTyping(testConversationId.value, data.user_id)
      })
      
      channel.bind('user.stopped-typing', (data: any) => {
        addLog(`⌨️ User stopped typing: ${data.user_id}`)
        messagingStore.setUserStoppedTyping(testConversationId.value, data.user_id)
      })
      
    } else {
      addLog('❌ Failed to subscribe to conversation channel')
    }
  } catch (error) {
    addLog(`❌ Channel subscription error: ${error}`)
  }
}

// Test sending message
const testSendMessage = async () => {
  if (!testMessage.value.trim()) {
    addLog('❌ Please enter a message to send')
    return
  }
  
  try {
    addLog(`Attempting to send message: "${testMessage.value}"`)
    
    const message = await sendMessage(testConversationId.value, testMessage.value)
    
    addLog('✅ Message sent successfully')
    addLog(`Message data: ${JSON.stringify(message)}`)
    
    testMessage.value = ''
  } catch (error) {
    addLog(`❌ Failed to send message: ${error}`)
  }
}

// Disconnect
const testDisconnect = () => {
  disconnect()
  connectionStatus.value = 'Disconnected'
  addLog('🔌 Disconnected from WebSocket')
}

// Clear logs
const clearLogs = () => {
  logs.value = []
}

// Auto-cleanup on unmount
onUnmounted(() => {
  disconnect()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">
        WebSocket Connection Test
      </h1>
      
      <!-- Connection Status -->
      <div class="mb-6 p-4 rounded-lg" :class="{
        'bg-green-100 border border-green-300': connectionStatus === 'Connected',
        'bg-red-100 border border-red-300': connectionStatus === 'Failed' || connectionStatus === 'Error',
        'bg-gray-100 border border-gray-300': connectionStatus === 'Disconnected',
        'bg-yellow-100 border border-yellow-300': isLoading
      }">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-lg">Connection Status</h3>
            <p class="text-sm" :class="{
              'text-green-700': connectionStatus === 'Connected',
              'text-red-700': connectionStatus === 'Failed' || connectionStatus === 'Error',
              'text-gray-700': connectionStatus === 'Disconnected',
              'text-yellow-700': isLoading
            }">
              {{ isLoading ? 'Connecting...' : connectionStatus }}
            </p>
          </div>
          <div class="flex gap-2">
            <button 
              @click="testConnection" 
              :disabled="isLoading || isConnected"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Connecting...' : 'Connect' }}
            </button>
            <button 
              @click="testDisconnect" 
              :disabled="!isConnected"
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      <!-- Test Controls -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Channel Subscription Test -->
        <div class="p-4 border rounded-lg">
          <h3 class="font-semibold text-lg mb-3">Channel Subscription</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Conversation ID
              </label>
              <input 
                v-model.number="testConversationId" 
                type="number" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter conversation ID"
              >
            </div>
            <button 
              @click="testChannelSubscription" 
              :disabled="!isConnected"
              class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Subscribe to Channel
            </button>
          </div>
        </div>

        <!-- Message Sending Test -->
        <div class="p-4 border rounded-lg">
          <h3 class="font-semibold text-lg mb-3">Send Message</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Test Message
              </label>
              <input 
                v-model="testMessage" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter test message"
                @keyup.enter="testSendMessage"
              >
            </div>
            <button 
              @click="testSendMessage" 
              :disabled="!isConnected || !testMessage.trim()"
              class="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>

      <!-- Logs -->
      <div class="p-4 border rounded-lg">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-lg">Connection Logs</h3>
          <button 
            @click="clearLogs" 
            class="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Logs
          </button>
        </div>
        <div class="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
          <div v-if="logs.length === 0" class="text-gray-500">
            No logs yet. Click "Connect" to start testing.
          </div>
          <div v-for="(log, index) in logs" :key="index" class="mb-1">
            {{ log }}
          </div>
        </div>
      </div>

      <!-- Store State Debug -->
      <div class="mt-6 p-4 border rounded-lg">
        <h3 class="font-semibold text-lg mb-3">Store State (Debug)</h3>
        <div class="bg-gray-100 p-4 rounded-md">
          <pre class="text-sm overflow-x-auto">{{ {
            isConnected: messagingStore.isConnected,
            conversationsCount: messagingStore.conversations.length,
            currentConversationId: messagingStore.currentConversationId,
            messagesCount: messagingStore.currentMessages.length,
            unreadCount: messagingStore.unreadCount
          } }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for logs */
.max-h-96::-webkit-scrollbar {
  width: 8px;
}

.max-h-96::-webkit-scrollbar-track {
  background: #374151;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>