<template>
  <div class="message-reactions">
    <!-- Existing Reactions -->
    <div v-if="messageReactions.length > 0" class="reactions-list">
      <button
        v-for="reaction in messageReactions"
        :key="reaction.emoji"
        :class="[
          'reaction-button',
          { 'user-reacted': reaction.user_reacted }
        ]"
        :title="getReactionTooltip(reaction)"
        @click="handleToggleReaction(reaction.emoji)"
      >
        <span class="emoji">{{ reaction.emoji }}</span>
        <span class="count">{{ reaction.count }}</span>
      </button>
    </div>

    <!-- Add Reaction Button -->
    <div class="add-reaction-container">
      <button
        ref="addReactionButton"
        class="add-reaction-button"
        :class="{ 'active': showEmojiPicker }"
        @click="toggleEmojiPicker"
        title="Add reaction"
      >
        <Icon name="smile-plus" class="w-4 h-4" />
      </button>

      <!-- Emoji Picker Dropdown -->
      <div
        v-if="showEmojiPicker"
        ref="emojiPicker"
        class="emoji-picker"
        @click.stop
      >
        <div class="emoji-grid">
          <button
            v-for="emoji in popularEmojis"
            :key="emoji"
            class="emoji-option"
            :class="{ 'already-reacted': hasUserReacted(messageId, emoji) }"
            @click="handleToggleReaction(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useMessageReactions } from '~/composables/useMessageReactions'
import Icon from '~/components/Icon.vue'

interface Props {
  messageId: number
  conversationId: number
}

const props = defineProps<Props>()

const {
  popularEmojis,
  getMessageReactions,
  hasUserReacted,
  loadReactions,
  toggleReaction,
  setupReactionListeners,
  cleanupReactionListeners,
  getReactionTooltip,
  isLoading,
  error
} = useMessageReactions()

const showEmojiPicker = ref(false)
const addReactionButton = ref<HTMLElement>()
const emojiPicker = ref<HTMLElement>()

// Get reactions for this message
const messageReactions = computed(() => getMessageReactions.value(props.messageId))

// Handle reaction toggle
const handleToggleReaction = async (emoji: string) => {
  showEmojiPicker.value = false
  await toggleReaction(props.messageId, emoji)
}

// Toggle emoji picker
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

// Close emoji picker when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (
    showEmojiPicker.value &&
    addReactionButton.value &&
    emojiPicker.value &&
    !addReactionButton.value.contains(event.target as Node) &&
    !emojiPicker.value.contains(event.target as Node)
  ) {
    showEmojiPicker.value = false
  }
}

// Handle escape key
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showEmojiPicker.value) {
    showEmojiPicker.value = false
  }
}

onMounted(async () => {
  // Load initial reactions
  await loadReactions(props.messageId)
  
  // Setup real-time listeners
  setupReactionListeners(props.conversationId)
  
  // Add event listeners
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // Cleanup listeners
  cleanupReactionListeners(props.conversationId)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.message-reactions {
  @apply flex items-center gap-1 mt-1 flex-wrap;
}

.reactions-list {
  @apply flex items-center gap-1 flex-wrap;
}

.reaction-button {
  @apply inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
         bg-gray-100 hover:bg-gray-200 border border-transparent
         transition-all duration-200 cursor-pointer;
}

.reaction-button.user-reacted {
  @apply bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200;
}

.reaction-button:hover {
  @apply transform scale-105;
}

.emoji {
  @apply text-sm leading-none;
}

.count {
  @apply font-medium text-xs;
}

.add-reaction-container {
  @apply relative;
}

.add-reaction-button {
  @apply p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100
         transition-all duration-200 cursor-pointer;
}

.add-reaction-button.active {
  @apply text-blue-600 bg-blue-50;
}

.emoji-picker {
  @apply absolute bottom-full left-0 mb-2 p-3 bg-white rounded-lg shadow-lg
         border border-gray-200 z-50 min-w-max;
}

.emoji-grid {
  @apply grid grid-cols-5 gap-1;
}

.emoji-option {
  @apply w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100
         transition-colors duration-200 cursor-pointer text-lg;
}

.emoji-option.already-reacted {
  @apply bg-blue-100 hover:bg-blue-200;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .reaction-button {
    @apply bg-gray-800 hover:bg-gray-700 text-gray-200;
  }
  
  .reaction-button.user-reacted {
    @apply bg-blue-900 border-blue-600 text-blue-300 hover:bg-blue-800;
  }
  
  .add-reaction-button {
    @apply text-gray-500 hover:text-gray-300 hover:bg-gray-800;
  }
  
  .add-reaction-button.active {
    @apply text-blue-400 bg-blue-900;
  }
  
  .emoji-picker {
    @apply bg-gray-800 border-gray-700;
  }
  
  .emoji-option {
    @apply hover:bg-gray-700;
  }
  
  .emoji-option.already-reacted {
    @apply bg-blue-900 hover:bg-blue-800;
  }
}
</style>