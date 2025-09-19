<template>
  <div class="message-thread">
    <!-- Parent Message -->
    <div class="parent-message">
      <MessageBubble 
        :message="parentMessage" 
        :show-reply-button="false"
        @reply="$emit('reply', parentMessage)"
      />
    </div>

    <!-- Thread Replies -->
    <div v-if="replies.length > 0" class="thread-replies">
      <div class="thread-line"></div>
      <div class="replies-container">
        <div 
          v-for="reply in replies" 
          :key="reply.id" 
          class="thread-reply"
        >
          <MessageBubble 
            :message="reply" 
            :show-reply-button="false"
            :is-thread-reply="true"
            @reply="$emit('reply', reply)"
          />
        </div>
      </div>
    </div>

    <!-- Reply Count Badge -->
    <div v-if="replies.length > 0" class="reply-count-badge">
      <Icon name="message-circle" class="w-3 h-3" />
      <span>{{ replies.length }} {{ replies.length === 1 ? 'reply' : 'replies' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMessageReplies } from '~/composables/useMessageReplies'
import type { Message } from '~/composables/useMessaging'
import MessageBubble from '~/components/messaging/MessageBubble.vue'
import Icon from '~/components/Icon.vue'

interface Props {
  parentMessage: Message
  messages: Message[]
  maxReplies?: number
}

interface Emits {
  reply: [message: Message]
}

const props = withDefaults(defineProps<Props>(), {
  maxReplies: 10
})

const emit = defineEmits<Emits>()

const { getReplies } = useMessageReplies()

// Get replies for the parent message
const allReplies = computed(() => 
  getReplies.value(props.messages, props.parentMessage.id)
)

// Limit replies if maxReplies is set
const replies = computed(() => {
  if (props.maxReplies && allReplies.value.length > props.maxReplies) {
    return allReplies.value.slice(0, props.maxReplies)
  }
  return allReplies.value
})

// Check if there are more replies than shown
const hasMoreReplies = computed(() => 
  props.maxReplies && allReplies.value.length > props.maxReplies
)
</script>

<style scoped>
.message-thread {
  @apply relative;
}

.parent-message {
  @apply relative;
}

.thread-replies {
  @apply relative ml-8 mt-2;
}

.thread-line {
  @apply absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200;
}

.replies-container {
  @apply pl-4 space-y-2;
}

.thread-reply {
  @apply relative;
}

.thread-reply::before {
  content: '';
  @apply absolute -left-4 top-4 w-3 h-0.5 bg-gray-200;
}

.reply-count-badge {
  @apply inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs text-gray-500 
         bg-gray-100 rounded-full;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .thread-line {
    @apply bg-gray-600;
  }
  
  .thread-reply::before {
    @apply bg-gray-600;
  }
  
  .reply-count-badge {
    @apply text-gray-400 bg-gray-800;
  }
}
</style>