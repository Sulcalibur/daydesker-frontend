import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export interface UserPresence {
  user_id: number
  status: 'online' | 'away' | 'offline'
  last_seen: string
  is_typing?: boolean
  typing_in_conversation?: number
}

export const useUserPresence = () => {
  const presenceData: Ref<Record<number, UserPresence>> = ref({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pusherChannel = ref<any>(null)

  // Get presence status for a specific user
  const getUserPresence = computed(() => {
    return (userId: number): UserPresence | null => {
      return presenceData.value[userId] || null
    }
  })

  // Check if user is online
  const isUserOnline = computed(() => {
    return (userId: number): boolean => {
      const presence = presenceData.value[userId]
      return presence?.status === 'online'
    }
  })

  // Check if user is typing in a conversation
  const isUserTyping = computed(() => {
    return (userId: number, conversationId?: number): boolean => {
      const presence = presenceData.value[userId]
      if (!presence?.is_typing) return false
      
      // If conversation ID is provided, check if typing in that conversation
      if (conversationId) {
        return presence.typing_in_conversation === conversationId
      }
      
      return true
    }
  })

  // Get users typing in a conversation
  const getUsersTypingInConversation = computed(() => {
    return (conversationId: number): UserPresence[] => {
      return Object.values(presenceData.value).filter(
        presence => presence.is_typing && presence.typing_in_conversation === conversationId
      )
    }
  })

  // Get online users count
  const onlineUsersCount = computed(() => {
    return Object.values(presenceData.value).filter(
      presence => presence.status === 'online'
    ).length
  })

  // Update user presence
  const updateUserPresence = (userId: number, presence: Partial<UserPresence>) => {
    if (presenceData.value[userId]) {
      presenceData.value[userId] = { ...presenceData.value[userId], ...presence }
    } else {
      presenceData.value[userId] = {
        user_id: userId,
        status: 'offline',
        last_seen: new Date().toISOString(),
        ...presence
      }
    }
  }

  // Set user as online
  const setUserOnline = (userId: number) => {
    updateUserPresence(userId, {
      status: 'online',
      last_seen: new Date().toISOString()
    })
  }

  // Set user as offline
  const setUserOffline = (userId: number) => {
    updateUserPresence(userId, {
      status: 'offline',
      last_seen: new Date().toISOString(),
      is_typing: false,
      typing_in_conversation: undefined
    })
  }

  // Set user typing status
  const setUserTyping = (userId: number, isTyping: boolean, conversationId?: number) => {
    updateUserPresence(userId, {
      is_typing: isTyping,
      typing_in_conversation: isTyping ? conversationId : undefined
    })
  }

  // Initialize presence tracking
  const initializePresence = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Get initial presence data
      const response = await $fetch<{
        success: boolean
        presence: UserPresence[]
      }>('/api/user-presence')

      if (response.success) {
        // Initialize presence data
        response.presence.forEach(presence => {
          presenceData.value[presence.user_id] = presence
        })
      }

      // Set up real-time presence updates via Pusher
      await setupPresenceChannel()
    } catch (err: any) {
      error.value = err.message || 'Failed to initialize presence'
      console.error('Error initializing presence:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Set up Pusher channel for real-time presence updates
  const setupPresenceChannel = async () => {
    try {
      // Import Pusher dynamically
      const { usePusher } = await import('~/composables/usePusher')
      const { pusher } = usePusher()

      if (pusher.value) {
        // Subscribe to presence channel
        pusherChannel.value = pusher.value.subscribe('presence-users')

        // Handle user coming online
        pusherChannel.value.bind('user-online', (data: { user_id: number }) => {
          setUserOnline(data.user_id)
        })

        // Handle user going offline
        pusherChannel.value.bind('user-offline', (data: { user_id: number }) => {
          setUserOffline(data.user_id)
        })

        // Handle typing events
        pusherChannel.value.bind('user-typing', (data: {
          user_id: number
          is_typing: boolean
          conversation_id?: number
        }) => {
          setUserTyping(data.user_id, data.is_typing, data.conversation_id)
        })

        // Handle presence state changes
        pusherChannel.value.bind('presence-update', (data: {
          user_id: number
          presence: Partial<UserPresence>
        }) => {
          updateUserPresence(data.user_id, data.presence)
        })
      }
    } catch (err) {
      console.error('Error setting up presence channel:', err)
    }
  }

  // Send typing indicator
  const sendTypingIndicator = async (conversationId: number, isTyping: boolean) => {
    try {
      await $fetch('/api/user-presence/typing', {
        method: 'POST',
        body: {
          conversation_id: conversationId,
          is_typing: isTyping
        }
      })
    } catch (err) {
      console.error('Error sending typing indicator:', err)
    }
  }

  // Update own presence status
  const updateOwnPresence = async (status: 'online' | 'away' | 'offline') => {
    try {
      await $fetch('/api/user-presence', {
        method: 'PATCH',
        body: { status }
      })
    } catch (err) {
      console.error('Error updating presence:', err)
    }
  }

  // Format last seen time
  const formatLastSeen = (lastSeen: string): string => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}d ago`
    }
  }

  // Clean up presence tracking
  const cleanup = () => {
    if (pusherChannel.value) {
      pusherChannel.value.unbind_all()
      pusherChannel.value.unsubscribe()
      pusherChannel.value = null
    }
    presenceData.value = {}
  }

  // Handle page visibility changes
  const handleVisibilityChange = () => {
    if (document.hidden) {
      updateOwnPresence('away')
    } else {
      updateOwnPresence('online')
    }
  }

  // Set up automatic presence updates
  onMounted(() => {
    // Initialize presence on mount
    initializePresence()

    // Handle page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Set user as online when component mounts
    updateOwnPresence('online')
  })

  onUnmounted(() => {
    // Clean up on unmount
    cleanup()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    
    // Set user as offline when component unmounts
    updateOwnPresence('offline')
  })

  return {
    presenceData: readonly(presenceData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    getUserPresence,
    isUserOnline,
    isUserTyping,
    getUsersTypingInConversation,
    onlineUsersCount,
    updateUserPresence,
    setUserOnline,
    setUserOffline,
    setUserTyping,
    sendTypingIndicator,
    updateOwnPresence,
    formatLastSeen,
    initializePresence,
    cleanup
  }
}