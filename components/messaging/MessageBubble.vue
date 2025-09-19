<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUturnLeftIcon } from '@heroicons/vue/24/outline'
import type { Message } from '~/composables/useMessaging'
import MessageReplyPreview from '~/components/MessageReplyPreview.vue'
import MessageReactions from './MessageReactions.vue'
import FilePreview from './FilePreview.vue'

interface Props {
  message: Message
  isOwn?: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  messages?: Message[]
  showReplyButton?: boolean
  isThreadReply?: boolean
}

interface Emits {
  (e: 'delete-attachment', attachmentId: number): void
  (e: 'reply', message: Message): void
}

const props = withDefaults(defineProps<Props>(), {
  isOwn: false,
  showAvatar: true,
  showTimestamp: true,
  messages: () => [],
  showReplyButton: true,
  isThreadReply: false
})

const emit = defineEmits<Emits>()

// Handle attachment deletion
const handleDeleteAttachment = (attachmentId: number) => {
  emit('delete-attachment', attachmentId)
}

// Handle reply action
const handleReply = () => {
  emit('reply', props.message)
}

const handleDownloadError = (error: string) => {
  console.error('Download error:', error)
  // You could show a toast notification here
}

// Format timestamp
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
}

// Get message type icon
const getMessageIcon = (type: Message['type']) => {
  switch (type) {
    case 'image':
      return 'lucide:image'
    case 'file':
      return 'lucide:file'
    case 'system':
      return 'lucide:info'
    default:
      return null
  }
}

// Get user initials for avatar
const getUserInitials = (userId: number) => {
  // In a real app, this would come from user data
  return `U${userId}`
}
</script>

<template>
  <div 
    class="flex gap-3 mb-4"
    :class="{
      'flex-row-reverse': isOwn,
      'opacity-75': message.type === 'system'
    }"
  >
    <!-- Avatar -->
    <div 
      v-if="showAvatar && message.type !== 'system'"
      class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
      :class="{
        'bg-blue-500 text-white': isOwn,
        'bg-gray-300 text-gray-700': !isOwn
      }"
    >
      {{ getUserInitials(message.sender_id) }}
    </div>

    <!-- Message Content -->
    <div 
      class="flex flex-col max-w-xs lg:max-w-md"
      :class="{
        'items-end': isOwn,
        'items-start': !isOwn
      }"
    >
      <!-- Message Bubble -->
      <div 
        class="px-4 py-2 rounded-2xl break-words group"
        :class="{
          'bg-blue-500 text-white rounded-br-md': isOwn && message.type !== 'system',
          'bg-gray-200 text-gray-900 rounded-bl-md': !isOwn && message.type !== 'system',
          'bg-yellow-100 text-yellow-800 rounded-md mx-auto text-center text-sm': message.type === 'system'
        }"
      >
        <!-- Message Icon -->
        <div v-if="getMessageIcon(message.type)" class="flex items-center gap-2 mb-1">
          <Icon :name="getMessageIcon(message.type)!" class="w-4 h-4" />
          <span class="text-xs opacity-75 uppercase tracking-wide">
            {{ message.type }}
          </span>
        </div>

        <!-- Reply Preview (if this is a reply) -->
        <MessageReplyPreview 
          v-if="message.reply_to_id && messages.length > 0" 
          :message="message" 
          :messages="messages" 
        />
        
        <!-- Message Text -->
        <div v-if="message.content" class="whitespace-pre-wrap">
          {{ message.content }}
        </div>

        <!-- File Attachments -->
        <div v-if="message.attachments && message.attachments.length > 0" class="mt-2 space-y-2">
          <div 
            v-for="attachment in message.attachments" 
            :key="attachment.id"
            class="attachment-container"
          >
            <FilePreview
              :attachment="attachment"
              :show-actions="true"
              :can-delete="isOwn"
              @delete="handleDeleteAttachment"
              @download-error="handleDownloadError"
            />
          </div>
        </div>

        <!-- Edited Indicator -->
        <div 
          v-if="message.is_edited" 
          class="text-xs opacity-60 mt-1 italic"
        >
          (edited)
        </div>
      </div>

      <!-- Message Reactions -->
      <MessageReactions :message-id="message.id" :show-add-button="!isThreadReply" />

      <!-- Message Actions -->
      <div v-if="showReplyButton && !isThreadReply" class="message-actions opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          @click="handleReply"
          class="action-button reply-button"
          title="Reply to message"
        >
          <ArrowUturnLeftIcon class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Timestamp and Read Status -->
      <div 
        v-if="showTimestamp"
        class="flex items-center gap-1 mt-1 text-xs text-gray-500"
        :class="{
          'flex-row-reverse': isOwn
        }"
      >
        <span>{{ formatTime(message.created_at) }}</span>
        
        <!-- Read Status (only for own messages) -->
        <div v-if="isOwn" class="flex items-center">
          <Icon 
            :name="message.read_at ? 'lucide:check-check' : 'lucide:check'"
            class="w-3 h-3"
            :class="{
              'text-blue-500': message.read_at,
              'text-gray-400': !message.read_at
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for long messages */
.break-words {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-actions {
  @apply flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200;
}

.action-button {
  @apply p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors duration-200;
}

.reply-button:hover {
  @apply text-blue-600;
}

/* Dark mode support for actions */
@media (prefers-color-scheme: dark) {
  .action-button {
    @apply hover:bg-gray-700 text-gray-500 hover:text-gray-300;
  }
  
  .reply-button:hover {
    @apply text-blue-400;
  }
}
</style>