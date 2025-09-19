<template>
  <div v-if="parentMessage" class="reply-preview">
    <div class="reply-indicator">
      <Icon name="heroicons:corner-down-right" class="w-3 h-3 text-gray-400" />
    </div>
    <div class="reply-content">
      <div class="reply-header">
        <span class="sender-name">{{ parentMessage.sender?.name || 'Unknown User' }}</span>
        <span class="timestamp">{{ formatTimestamp(parentMessage.created_at) }}</span>
      </div>
      <div class="reply-text">
        {{ formatReplyPreview(parentMessage.content) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMessageReplies } from '~/composables/useMessageReplies'
import type { Message } from '~/composables/useMessaging'

interface Props {
  message: Message
  messages: Message[]
}

const props = defineProps<Props>()

const { getParentMessage, formatReplyPreview } = useMessageReplies()

// Get the parent message this is replying to
const parentMessage = computed(() => {
  if (!props.message.reply_to_id) return null
  return props.messages.find(msg => msg.id === props.message.reply_to_id) || null
})

// Format timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 24 * 7) {
    return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
}
</script>

<style scoped>
.reply-preview {
  @apply flex items-start gap-2 mb-2 p-2 bg-gray-50 rounded-lg border-l-2 border-gray-300;
}

.reply-indicator {
  @apply flex-shrink-0 mt-0.5;
}

.reply-content {
  @apply flex-1 min-w-0;
}

.reply-header {
  @apply flex items-center gap-2 mb-1;
}

.sender-name {
  @apply text-xs font-medium text-gray-700;
}

.timestamp {
  @apply text-xs text-gray-500;
}

.reply-text {
  @apply text-sm text-gray-600 truncate;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .reply-preview {
    @apply bg-gray-800 border-gray-600;
  }
  
  .sender-name {
    @apply text-gray-300;
  }
  
  .timestamp {
    @apply text-gray-500;
  }
  
  .reply-text {
    @apply text-gray-400;
  }
}
</style>