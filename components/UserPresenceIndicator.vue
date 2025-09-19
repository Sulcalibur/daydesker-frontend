<template>
  <div class="flex items-center gap-2">
    <!-- Online Status Indicator -->
    <div 
      v-if="showOnlineStatus"
      class="relative flex items-center"
    >
      <div
        :class="[
          'w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
          getStatusColor(status)
        ]"
        :title="getStatusTooltip()"
      >
        <!-- Pulse animation for online status -->
        <div
          v-if="status === 'online'"
          class="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-75"
        ></div>
      </div>
    </div>

    <!-- Typing Indicator -->
    <div 
      v-if="showTypingIndicator && isTyping"
      class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
    >
      <div class="flex gap-1">
        <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
        <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
        <div class="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
      </div>
      <span v-if="showTypingText">typing...</span>
    </div>

    <!-- Last Seen (when offline) -->
    <div 
      v-if="showLastSeen && status === 'offline' && lastSeen"
      class="text-xs text-gray-500 dark:text-gray-400"
    >
      {{ formatLastSeen(lastSeen) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserPresence } from '~/composables/useUserPresence'

interface Props {
  userId: number
  showOnlineStatus?: boolean
  showTypingIndicator?: boolean
  showTypingText?: boolean
  showLastSeen?: boolean
  conversationId?: number
}

const props = withDefaults(defineProps<Props>(), {
  showOnlineStatus: true,
  showTypingIndicator: true,
  showTypingText: true,
  showLastSeen: false
})

const {
  getUserPresence,
  isUserOnline,
  isUserTyping,
  formatLastSeen
} = useUserPresence()

// Get user presence data
const userPresence = computed(() => getUserPresence.value(props.userId))

// Get user status
const status = computed(() => userPresence.value?.status || 'offline')

// Check if user is online
const isOnline = computed(() => isUserOnline.value(props.userId))

// Check if user is typing
const isTyping = computed(() => {
  if (props.conversationId) {
    return isUserTyping.value(props.userId, props.conversationId)
  }
  return isUserTyping.value(props.userId)
})

// Get last seen timestamp
const lastSeen = computed(() => userPresence.value?.last_seen)

// Get status color class
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online':
      return 'bg-green-400'
    case 'away':
      return 'bg-yellow-400'
    case 'offline':
    default:
      return 'bg-gray-400'
  }
}

// Get status tooltip
const getStatusTooltip = (): string => {
  switch (status.value) {
    case 'online':
      return 'Online'
    case 'away':
      return 'Away'
    case 'offline':
    default:
      return lastSeen.value ? `Last seen ${formatLastSeen(lastSeen.value)}` : 'Offline'
  }
}
</script>

<style scoped>
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