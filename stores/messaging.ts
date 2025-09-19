import { defineStore } from 'pinia'
import type { Message, Conversation } from '~/composables/useMessaging'
import { useAuthStore } from '~/stores/auth'

export interface MessagingState {
  conversations: Conversation[]
  messages: { [conversationId: number]: Message[] }
  activeConversationId: number | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
  unreadCounts: { [conversationId: number]: number }
  typingUsers: { [conversationId: number]: number[] }
}

export const useMessagingStore = defineStore('messaging', {
  state: (): MessagingState => ({
    conversations: [],
    messages: {},
    activeConversationId: null,
    isConnected: false,
    isLoading: false,
    error: null,
    unreadCounts: {},
    typingUsers: {},
  }),

  getters: {
    activeConversation: (state) => {
      if (!state.activeConversationId) return null
      return state.conversations.find(c => c.id === state.activeConversationId) || null
    },

    activeMessages: (state) => {
      if (!state.activeConversationId) return []
      return state.messages[state.activeConversationId] || []
    },

    totalUnreadCount: (state) => {
      return Object.values(state.unreadCounts).reduce((total, count) => total + count, 0)
    },

    getConversationById: (state) => {
      return (id: number) => state.conversations.find(c => c.id === id)
    },

    getMessagesForConversation: (state) => {
      return (conversationId: number) => state.messages[conversationId] || []
    },

    getUnreadCount: (state) => {
      return (conversationId: number) => state.unreadCounts[conversationId] || 0
    },

    sortedConversations: (state) => {
      return [...state.conversations].sort((a, b) => {
        const aTime = a.last_message_at || a.created_at
        const bTime = b.last_message_at || b.created_at
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })
    },

    getTypingUsers: (state) => {
      return (conversationId: number) => state.typingUsers[conversationId] || []
    },
  },

  actions: {
    setConversations(conversations: Conversation[]) {
      this.conversations = conversations
      this.calculateUnreadCounts()
    },

    addConversation(conversation: Conversation) {
      const existingIndex = this.conversations.findIndex(c => c.id === conversation.id)
      if (existingIndex >= 0) {
        this.conversations[existingIndex] = conversation
      } else {
        this.conversations.push(conversation)
      }
      this.calculateUnreadCounts()
    },

    setMessages(conversationId: number, messages: Message[]) {
      this.messages[conversationId] = messages
      this.calculateUnreadCount(conversationId)
    },

    addMessage(message: Message) {
      const conversationId = message.conversation_id
      if (!this.messages[conversationId]) {
        this.messages[conversationId] = []
      }
      
      // Check if message already exists to avoid duplicates
      const existingIndex = this.messages[conversationId].findIndex(m => m.id === message.id)
      if (existingIndex >= 0) {
        this.messages[conversationId][existingIndex] = message
      } else {
        this.messages[conversationId].push(message)
      }

      // Update conversation's latest message
      const conversation = this.conversations.find(c => c.id === conversationId)
      if (conversation) {
        conversation.latest_message = message
        conversation.last_message_at = message.created_at
      }

      this.calculateUnreadCount(conversationId)
    },

    updateMessage(messageId: number, updates: Partial<Message>) {
      for (const conversationId in this.messages) {
        const messages = this.messages[conversationId]
        const messageIndex = messages.findIndex(m => m.id === messageId)
        if (messageIndex >= 0) {
          this.messages[conversationId][messageIndex] = {
            ...messages[messageIndex],
            ...updates,
          }
          this.calculateUnreadCount(Number(conversationId))
          break
        }
      }
    },

    markMessageAsRead(messageId: number, readAt: string) {
      this.updateMessage(messageId, { read_at: readAt })
    },

    markMessageAsDelivered(messageId: number, deliveredAt: string) {
      // Update the message's read receipts to reflect delivery status
      for (const conversationId in this.messages) {
        const messages = this.messages[conversationId]
        const messageIndex = messages.findIndex(m => m.id === messageId)
        if (messageIndex >= 0) {
          const message = messages[messageIndex]
          if (message.read_receipts) {
            // Update existing receipt or add new one
            const receiptIndex = message.read_receipts.findIndex(r => r.status === 'delivered')
            if (receiptIndex >= 0) {
              message.read_receipts[receiptIndex].delivered_at = deliveredAt
            }
          }
          break
        }
      }
    },

    setActiveConversation(conversationId: number | null) {
      this.activeConversationId = conversationId
      
      // Mark all messages in the active conversation as read
      if (conversationId && this.messages[conversationId]) {
        const authStore = useAuthStore()
        const currentUserId = authStore.user?.id
        
        this.messages[conversationId].forEach(message => {
          if (!message.read_at && message.sender_id !== currentUserId) {
            // This would typically trigger an API call to mark as read
            // The actual read status will be updated via the real-time event
          }
        })
      }
    },

    setConnectionStatus(isConnected: boolean) {
      this.isConnected = isConnected
    },

    setLoading(isLoading: boolean) {
      this.isLoading = isLoading
    },

    setError(error: string | null) {
      this.error = error
    },

    calculateUnreadCount(conversationId: number) {
      const messages = this.messages[conversationId] || []
      const authStore = useAuthStore()
      const currentUserId = authStore.user?.id
      
      if (!currentUserId) {
        this.unreadCounts[conversationId] = 0
        return
      }

      const unreadCount = messages.filter(message => 
        !message.read_at && message.sender_id !== currentUserId
      ).length
      
      this.unreadCounts[conversationId] = unreadCount
    },

    calculateUnreadCounts() {
      this.conversations.forEach(conversation => {
        this.calculateUnreadCount(conversation.id)
      })
    },

    clearMessages(conversationId: number) {
      delete this.messages[conversationId]
      delete this.unreadCounts[conversationId]
    },

    setUserTyping(conversationId: number, userId: number) {
      if (!this.typingUsers[conversationId]) {
        this.typingUsers[conversationId] = []
      }
      if (!this.typingUsers[conversationId].includes(userId)) {
        this.typingUsers[conversationId].push(userId)
      }
    },

    setUserStoppedTyping(conversationId: number, userId: number) {
      if (this.typingUsers[conversationId]) {
        this.typingUsers[conversationId] = this.typingUsers[conversationId].filter(id => id !== userId)
      }
    },

    reset() {
      this.conversations = []
      this.messages = {}
      this.activeConversationId = null
      this.isConnected = false
      this.isLoading = false
      this.error = null
      this.unreadCounts = {}
      this.typingUsers = {}
    },
  },
})