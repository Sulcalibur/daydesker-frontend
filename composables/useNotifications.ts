import { ref, computed } from 'vue'

// Global notification state
const unreadMessagesCount = ref<number>(0)
const hasUnreadNotifications = ref<boolean>(false)

export const useNotifications = () => {
  // Computed properties
  const totalUnreadCount = computed(() => unreadMessagesCount.value)
  const hasNotifications = computed(() => hasUnreadNotifications.value || unreadMessagesCount.value > 0)
  const displayBadge = computed(() => hasNotifications.value)

  // Methods to update notification state
  const setUnreadMessagesCount = (count: number) => {
    unreadMessagesCount.value = count
  }

  const setHasUnreadNotifications = (hasUnread: boolean) => {
    hasUnreadNotifications.value = hasUnread
  }

  const incrementUnreadMessages = () => {
    unreadMessagesCount.value++
  }

  const decrementUnreadMessages = () => {
    if (unreadMessagesCount.value > 0) {
      unreadMessagesCount.value--
    }
  }

  const clearAllNotifications = () => {
    unreadMessagesCount.value = 0
    hasUnreadNotifications.value = false
  }

  // Initialize with mock data (in real app, this would come from API)
  const initializeNotifications = () => {
    // Mock: 2 unread messages
    setUnreadMessagesCount(2)
    setHasUnreadNotifications(true)
  }

  return {
    // State
    unreadMessagesCount: readonly(unreadMessagesCount),
    hasUnreadNotifications: readonly(hasUnreadNotifications),
    
    // Computed
    totalUnreadCount,
    hasNotifications,
    displayBadge,
    
    // Methods
    setUnreadMessagesCount,
    setHasUnreadNotifications,
    incrementUnreadMessages,
    decrementUnreadMessages,
    clearAllNotifications,
    initializeNotifications
  }
}