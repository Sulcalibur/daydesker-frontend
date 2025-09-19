import { ref, computed, onUnmounted, watch, readonly } from 'vue'
import Pusher from 'pusher-js'
import { useAuthStore } from '~/stores/auth'
import { useMessagingStore } from '~/stores/messaging'

export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  type: 'text' | 'image' | 'file'
  metadata?: any
  read_at?: string
  is_edited: boolean
  edited_at?: string
  reply_to_id?: number
  is_encrypted: boolean
  encryption_key_id?: string
  created_at: string
  updated_at: string
  sender: {
    id: number
    name: string
    email: string
  }
  attachments?: MessageAttachment[]
  reactions?: MessageReaction[]
  read_receipts?: MessageReadReceipt[]
  reply_to?: Message
  replies?: Message[]
}

export interface MessageAttachment {
  id: number
  message_id: number
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  mime_type: string
  created_at: string
}

export interface MessageReaction {
  id: number
  message_id: number
  user_id: number
  emoji: string
  created_at: string
  user: {
    id: number
    name: string
  }
}

export interface MessageReadReceipt {
  id: number
  message_id: number
  user_id: number
  status: 'delivered' | 'read'
  delivered_at?: string
  read_at?: string
  created_at: string
  user: {
    id: number
    name: string
  }
}

export interface DeliveryStatus {
  message_id: number
  delivered_count: number
  read_count: number
  total_recipients: number
  receipts: MessageReadReceipt[]
}

export interface ConversationReadStatus {
  conversation_id: number
  unread_count: number
  last_read_message_id?: number
  participants: {
    user_id: number
    last_read_message_id?: number
    last_read_at?: string
  }[]
}

export interface Conversation {
  id: number
  title?: string
  type: 'direct' | 'group'
  participants: number[]
  created_by: number
  last_message_at?: string
  created_at: string
  updated_at: string
  latest_message?: Message
  workspace_id?: number
  workspace?: {
    id: number
    name: string
    type: string
  }
}

export const useMessaging = () => {
  const authStore = useAuthStore()
  const messagingStore = useMessagingStore()
  const pusher = ref<Pusher | null>(null)

  // Initialize Pusher connection
  const initializePusher = () => {
    if (!authStore.isAuthenticated) {
      console.warn('User not authenticated, cannot initialize Pusher')
      return
    }

    try {
      pusher.value = new Pusher('local-key', {
        wsHost: 'localhost',
        wsPort: 8080,
        wssPort: 8080,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        cluster: '',
        auth: {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      })

      pusher.value.connection.bind('connected', () => {
        messagingStore.setConnectionStatus(true)
        console.log('Connected to Pusher')
      })

      pusher.value.connection.bind('disconnected', () => {
        messagingStore.setConnectionStatus(false)
        console.log('Disconnected from Pusher')
      })

      pusher.value.connection.bind('error', (err: any) => {
        console.error('Pusher connection error:', err)
        messagingStore.setError('Connection error')
      })
    } catch (err) {
      console.error('Failed to initialize Pusher:', err)
      error.value = 'Failed to initialize real-time connection'
    }
  }

  // Subscribe to conversation channel
  const subscribeToConversation = (conversationId: number) => {
    if (!pusher.value) return

    const channel = pusher.value.subscribe(`private-conversation.${conversationId}`)
    
    channel.bind('message.sent', (data: { message: Message }) => {
      const { message } = data
      messagingStore.addMessage(message)
    })

    channel.bind('message.read', (data: { message_id: number, read_by: number, read_at: string }) => {
      messagingStore.markMessageAsRead(data.message_id, data.read_at)
    })

    channel.bind('message.delivered', (data: { message_id: number, delivered_to: number, delivered_at: string }) => {
      messagingStore.markMessageAsDelivered(data.message_id, data.delivered_at)
    })
  }

  // Unsubscribe from conversation channel
  const unsubscribeFromConversation = (conversationId: number) => {
    if (!pusher.value) return
    pusher.value.unsubscribe(`private-conversation.${conversationId}`)
  }

  // Fetch conversations
  const fetchConversations = async () => {
    if (!authStore.isAuthenticated) return

    messagingStore.setLoading(true)
    messagingStore.setError(null)

    try {
      const response = await $fetch<Conversation[]>('/api/conversations', {
        baseURL: 'http://localhost:8000',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      messagingStore.setConversations(response)
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
      messagingStore.setError('Failed to load conversations')
    } finally {
      messagingStore.setLoading(false)
    }
  }

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: number) => {
    if (!authStore.isAuthenticated) return

    messagingStore.setLoading(true)
    messagingStore.setError(null)

    try {
      const response = await $fetch<Message[]>('/api/messages', {
        baseURL: 'http://localhost:8000',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
        query: {
          conversation_id: conversationId,
        },
      })
      messagingStore.setMessages(conversationId, response)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      messagingStore.setError('Failed to load messages')
    } finally {
      messagingStore.setLoading(false)
    }
  }

  // Send a message
  const sendMessage = async (conversationId: number, content: string, type: 'text' | 'image' | 'file' = 'text', replyToId?: number) => {
    if (!authStore.isAuthenticated) return

    try {
      const body: any = {
        conversation_id: conversationId,
        content,
        type,
      }
      
      if (replyToId) {
        body.reply_to_id = replyToId
      }

      const response = await $fetch<Message>('/api/messages', {
        method: 'POST',
        baseURL: 'http://localhost:8000',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
        body,
      })
      return response
    } catch (err) {
      console.error('Failed to send message:', err)
      messagingStore.setError('Failed to send message')
      throw err
    }
  }

  // Mark message as read
  const markMessageAsRead = async (messageId: number) => {
    if (!authStore.isAuthenticated) return

    try {
      await $fetch(`/api/messages/${messageId}/read`, {
        method: 'PATCH',
        baseURL: 'http://localhost:8000',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
    } catch (err) {
      console.error('Failed to mark message as read:', err)
    }
  }

  // Mark multiple messages as read
  const markMultipleAsRead = async (messageIds: number[]) => {
    if (!authStore.isAuthenticated || messageIds.length === 0) return

    try {
      await $fetch('/api/messages/mark-multiple-read', {
        method: 'POST',
        baseURL: 'http://localhost:8000',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
        body: {
          message_ids: messageIds,
        },
      })
    } catch (err) {
      console.error('Failed to mark multiple messages as read:', err)
    }
  }

  // Get delivery status for a message
  const getDeliveryStatus = async (messageId: number): Promise<DeliveryStatus | null> => {
    if (!authStore.isAuthenticated) return null

    try {
      const response = await $fetch<DeliveryStatus>(`/api/messages/${messageId}/delivery-status`, {
        baseURL: 'http://localhost:8000',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      return response
    } catch (err) {
      console.error('Failed to get delivery status:', err)
      return null
    }
  }

  // Get conversation read status
  const getConversationReadStatus = async (conversationId?: number): Promise<ConversationReadStatus[]> => {
    if (!authStore.isAuthenticated) return []

    try {
      const response = await $fetch<ConversationReadStatus[]>('/api/conversations/read-status', {
        baseURL: 'http://localhost:8000',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
        query: conversationId ? { conversation_id: conversationId } : {},
      })
      return response
    } catch (err) {
      console.error('Failed to get conversation read status:', err)
      return []
    }
  }

  // Create a new conversation
  const createConversation = async (participants: number[], title?: string, type: 'direct' | 'group' = 'direct') => {
    if (!authStore.isAuthenticated) return

    try {
      const response = await $fetch<Conversation>('/api/conversations', {
        method: 'POST',
        baseURL: 'http://localhost:8000',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
        body: {
          participants,
          title,
          type,
        },
      })
      messagingStore.addConversation(response)
      return response
    } catch (err) {
      console.error('Failed to create conversation:', err)
      messagingStore.setError('Failed to create conversation')
      throw err
    }
  }

  // Create a conversation with workspace provider (host)
  const createWorkspaceConversation = async (workspaceId: number, providerId: number, workspaceName: string, workspaceType: string) => {
    if (!authStore.isAuthenticated) return

    try {
      // Check if conversation already exists
      const existingConversation = messagingStore.conversations.find(conv => 
        conv.workspace_id === workspaceId && 
        conv.participants.includes(providerId) &&
        conv.participants.includes(authStore.user?.id || 0)
      )

      if (existingConversation) {
        return existingConversation
      }

      // Create new conversation with workspace context
      const response = await $fetch<Conversation>('/api/conversations', {
        method: 'POST',
        baseURL: 'http://localhost:8000',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
        body: {
          participants: [authStore.user?.id, providerId],
          title: `${workspaceName} - Discussion`,
          type: 'direct',
          workspace_id: workspaceId,
          workspace: {
            id: workspaceId,
            name: workspaceName,
            type: workspaceType
          }
        },
      })
      messagingStore.addConversation(response)
      return response
    } catch (err) {
      console.error('Failed to create workspace conversation:', err)
      messagingStore.setError('Failed to start conversation with host')
      throw err
    }
  }



  // Cleanup
  const cleanup = () => {
    if (pusher.value) {
      pusher.value.disconnect()
      pusher.value = null
    }
    messagingStore.setConnectionStatus(false)
  }

  // Auto-initialize when user is authenticated
  watch(() => authStore.isAuthenticated, (isAuth) => {
    if (isAuth) {
      initializePusher()
      fetchConversations()
    } else {
      cleanup()
    }
  }, { immediate: true })

  onUnmounted(() => {
    cleanup()
  })

  return {
    // Store access
    store: messagingStore,

    // Methods
    initializePusher,
    subscribeToConversation,
    unsubscribeFromConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    markMultipleAsRead,
    getDeliveryStatus,
    getConversationReadStatus,
    createConversation,
    createWorkspaceConversation,
    cleanup,
  }
}