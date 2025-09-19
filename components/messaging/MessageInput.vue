<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Message } from '~/composables/useMessaging'
import { useMessageReplies } from '~/composables/useMessageReplies'
import FileUpload from './FileUpload.vue'
import MessageReplyPreview from '~/components/MessageReplyPreview.vue'

interface Props {
  conversationId: number
  placeholder?: string
  disabled?: boolean
  maxLength?: number
}

interface Emits {
  (e: 'send', content: string, type: Message['type']): void
  (e: 'typing', isTyping: boolean): void
  (e: 'file-uploaded', attachments: any[]): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Type a message...',
  disabled: false,
  maxLength: 1000
})

const emit = defineEmits<Emits>()

// Composables
const { replyContext, clearReplyContext } = useMessageReplies()

// Reactive state
const message = ref('')
const isTyping = ref(false)
const isSending = ref(false)
const textareaRef = ref<HTMLTextAreaElement>()
const showFileUpload = ref(false)
const pendingMessage = ref<number | null>(null)

// Typing indicator debounce
let typingTimeout: NodeJS.Timeout | null = null

// Handle input changes
const handleInput = () => {
  // Auto-resize textarea
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }

  // Handle typing indicator
  if (!isTyping.value && message.value.trim()) {
    isTyping.value = true
    emit('typing', true)
  }

  // Clear existing timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  // Set new timeout to stop typing indicator
  typingTimeout = setTimeout(() => {
    if (isTyping.value) {
      isTyping.value = false
      emit('typing', false)
    }
  }, 1000)
}

// Send message
const sendMessage = async () => {
  const content = message.value.trim()
  if (!content || isSending.value || props.disabled) return

  try {
    isSending.value = true
    
    // Clear typing indicator
    if (isTyping.value) {
      isTyping.value = false
      emit('typing', false)
    }
    
    // Emit send event
    emit('send', content, 'text')
    
    // Store message ID for potential file uploads
    // This would be set by the parent component after message is created
    
    // Clear input
    message.value = ''
    
    // Reset textarea height
    await nextTick()
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
    
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    isSending.value = false
  }
}

// File upload handlers
const toggleFileUpload = () => {
  showFileUpload.value = !showFileUpload.value
}

const handleFileUploadSuccess = (attachments: any[]) => {
  emit('file-uploaded', attachments)
  showFileUpload.value = false
}

const handleFileUploadError = (error: string) => {
  console.error('File upload error:', error)
  // You could show a toast notification here
}

// Set pending message ID (called by parent after message is sent)
const setPendingMessage = (messageId: number) => {
  pendingMessage.value = messageId
}

// Expose method to parent
defineExpose({
  setPendingMessage
})

// Handle keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Send on Enter (but not Shift+Enter)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// Character count
const characterCount = computed(() => message.value.length)
const isNearLimit = computed(() => characterCount.value > props.maxLength * 0.8)
const isOverLimit = computed(() => characterCount.value > props.maxLength)

// Cleanup on unmount
onUnmounted(() => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
})
</script>

<template>
  <div class="border-t bg-white">
    <!-- Reply Preview Section -->
    <div v-if="replyContext" class="p-3 border-b bg-blue-50">
      <MessageReplyPreview />
    </div>

    <!-- File Upload Section -->
    <div v-if="showFileUpload" class="p-4 border-b bg-gray-50">
      <FileUpload
        :message-id="pendingMessage"
        @upload-success="handleFileUploadSuccess"
        @upload-error="handleFileUploadError"
      />
    </div>

    <!-- Message Input Section -->
    <div class="p-4">
      <div class="flex items-end gap-3">
        <!-- Attachment Button -->
        <button
          @click="toggleFileUpload"
          :disabled="disabled || isSending"
          class="flex-shrink-0 w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{
            'text-blue-500 bg-blue-50': showFileUpload
          }"
          title="Attach files"
        >
          <Icon name="paperclip" class="w-5 h-5" />
        </button>

        <!-- Message Input -->
        <div class="flex-1 relative">
          <textarea
            ref="textareaRef"
            v-model="message"
            :placeholder="placeholder"
            :disabled="disabled || isSending"
            :maxlength="maxLength"
            class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[48px] max-h-32"
            :class="{
              'opacity-50 cursor-not-allowed': disabled || isSending,
              'border-red-300 focus:ring-red-500': isOverLimit
            }"
            rows="1"
            @input="handleInput"
            @keydown="handleKeydown"
          />
          
          <!-- Character Count -->
          <div 
            v-if="isNearLimit"
            class="absolute bottom-1 right-12 text-xs px-2 py-1 rounded-full"
            :class="{
              'text-orange-600 bg-orange-100': isNearLimit && !isOverLimit,
              'text-red-600 bg-red-100': isOverLimit
            }"
          >
            {{ characterCount }}/{{ maxLength }}
          </div>
        </div>

        <!-- Send Button -->
        <button
          @click="sendMessage"
          :disabled="!message.trim() || isSending || disabled || isOverLimit"
          class="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
        >
          <Icon 
            v-if="!isSending"
            name="send" 
            class="w-5 h-5" 
          />
          <Icon 
            v-else
            name="loader-2" 
            class="w-5 h-5 animate-spin" 
          />
        </button>
      </div>

      <!-- Typing Indicator -->
      <div 
        v-if="isTyping"
        class="mt-2 text-xs text-gray-500 flex items-center gap-1"
      >
        <Icon name="lucide:edit-3" class="w-3 h-3" />
        <span>Typing...</span>
      </div>

      <!-- Keyboard Shortcut Hint -->
      <div class="mt-2 text-xs text-gray-400 text-center">
        Press <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to send, 
        <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Shift + Enter</kbd> for new line
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Keyboard shortcut styling */
kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}
</style>