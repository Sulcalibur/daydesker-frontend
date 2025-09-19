import { ref, computed } from 'vue'
import type { Conversation, Message } from './useMessaging'

export const useConversations = () => {
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messages = ref<Map<number, Message[]>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const sortedConversations = computed(() => {
    return conversations.value.sort((a, b) => {
      const aTime = new Date(a.last_message_at || a.created_at).getTime()
      const bTime = new Date(b.last_message_at || b.created_at).getTime()
      return bTime - aTime
    })
  })

  const currentMessages = computed(() => {
    if (!currentConversation.value) return []
    return messages.value.get(currentConversation.value.id) || []
  })

  const unreadCount = computed(() => {
    return conversations.value.reduce((count, conversation) => {
      const conversationMessages = messages.value.get(conversation.id) || []
      const unreadMessages = conversationMessages.filter(msg => !msg.read_at)
      return count + unreadMessages.length
    }, 0)
  })

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { $fetch } = useNuxtApp()
      const response = await $fetch<Conversation[]>('/api/conversations')
      
      conversations.value = response
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
      error.value = 'Failed to load conversations'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch messages for a specific conversation
  const fetchMessages = async (conversationId: number, page = 1, limit = 50) => {
    try {
      const { $fetch } = useNuxtApp()
      
      const response = await $fetch<{
        data: Message[]
        meta: { current_page: number; last_page: number; total: number }
      }>(`/api/conversations/${conversationId}/messages`, {
        query: { page, limit }
      })
      
      const existingMessages = messages.value.get(conversationId) || []
      
      if (page === 1) {
        // Replace messages for first page
        messages.value.set(conversationId, response.data)
      } else {
        // Append messages for pagination
        const combined = [...response.data, ...existingMessages]
        const unique = combined.filter((msg, index, arr) => 
          arr.findIndex(m => m.id === msg.id) === index
        )
        messages.value.set(conversationId, unique.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ))
      }
      
      return response
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      throw err
    }
  }

  // Create a new conversation
  const createConversation = async (participantIds: number[], title?: string, type: 'direct' | 'group' = 'direct') => {
    try {
      const { $fetch } = useNuxtApp()
      
      const response = await $fetch<Conversation>('/api/conversations', {
        method: 'POST',
        body: {
          participants: participantIds,
          title,
          type
        }
      })
      
      conversations.value.unshift(response)
      return response
    } catch (err) {
      console.error('Failed to create conversation:', err)
      throw err
    }
  }

  // Set current conversation
  const setCurrentConversation = async (conversation: Conversation) => {
    currentConversation.value = conversation
    
    // Fetch messages if not already loaded
    if (!messages.value.has(conversation.id)) {
      await fetchMessages(conversation.id)
    }
  }

  // Add a new message to a conversation
  const addMessage = (conversationId: number, message: Message) => {
    const conversationMessages = messages.value.get(conversationId) || []
    
    // Check if message already exists
    const existingIndex = conversationMessages.findIndex(m => m.id === message.id)
    
    if (existingIndex >= 0) {
      // Update existing message
      conversationMessages[existingIndex] = message
    } else {
      // Add new message
      conversationMessages.push(message)
    }
    
    // Sort messages by creation time
    conversationMessages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    
    messages.value.set(conversationId, conversationMessages)
    
    // Update conversation's last message time
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation) {
      conversation.last_message_at = message.created_at
    }
  }

  // Update a message (for edits, read status, etc.)
  const updateMessage = (conversationId: number, messageId: number, updates: Partial<Message>) => {
    const conversationMessages = messages.value.get(conversationId)
    if (!conversationMessages) return
    
    const messageIndex = conversationMessages.findIndex(m => m.id === messageId)
    if (messageIndex >= 0) {
      conversationMessages[messageIndex] = {
        ...conversationMessages[messageIndex],
        ...updates
      }
      messages.value.set(conversationId, conversationMessages)
    }
  }

  // Delete a message
  const deleteMessage = async (conversationId: number, messageId: number) => {
    try {
      const { $fetch } = useNuxtApp()
      
      await $fetch(`/api/messages/${messageId}`, {
        method: 'DELETE'
      })
      
      const conversationMessages = messages.value.get(conversationId)
      if (conversationMessages) {
        const filtered = conversationMessages.filter(m => m.id !== messageId)
        messages.value.set(conversationId, filtered)
      }
    } catch (err) {
      console.error('Failed to delete message:', err)
      throw err
    }
  }

  // Clear all data
  const clearData = () => {
    conversations.value = []
    currentConversation.value = null
    messages.value.clear()
    error.value = null
  }

  return {
    // State
    conversations: readonly(conversations),
    currentConversation: readonly(currentConversation),
    messages: readonly(messages),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    sortedConversations,
    currentMessages,
    unreadCount,
    
    // Methods
    fetchConversations,
    fetchMessages,
    createConversation,
    setCurrentConversation,
    addMessage,
    updateMessage,
    deleteMessage,
    clearData
  }
}