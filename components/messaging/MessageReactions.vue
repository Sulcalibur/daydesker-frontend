<template>
  <div v-if="reactions.length > 0" class="flex flex-wrap gap-1 mt-2">
    <button
      v-for="reaction in reactions"
      :key="reaction.emoji"
      @click="handleReactionClick(reaction.emoji)"
      :class="[
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200',
        'border hover:scale-105 active:scale-95',
        reaction.user_reacted
          ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
      ]"
      :title="getReactionTooltip(reaction)"
      :disabled="isLoading"
    >
      <span class="text-sm">{{ reaction.emoji }}</span>
      <span class="text-xs font-semibold">{{ reaction.count }}</span>
    </button>
    
    <!-- Add Reaction Button -->
    <button
      v-if="showAddButton"
      @click="showEmojiPicker = !showEmojiPicker"
      :class="[
        'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs',
        'border border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700',
        'dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300',
        'transition-all duration-200 hover:scale-105 active:scale-95'
      ]"
      :disabled="isLoading"
      title="Add reaction"
    >
      <PlusIcon class="w-3 h-3" />
    </button>
  </div>
  
  <!-- Add Reaction Button (when no reactions exist) -->
  <div v-else-if="showAddButton" class="mt-2">
    <button
      @click="showEmojiPicker = !showEmojiPicker"
      :class="[
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs',
        'border border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700',
        'dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300',
        'transition-all duration-200 hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100'
      ]"
      :disabled="isLoading"
      title="Add reaction"
    >
      <FaceSmileIcon class="w-3 h-3" />
      <span>React</span>
    </button>
  </div>

  <!-- Emoji Picker -->
  <div
    v-if="showEmojiPicker"
    class="absolute z-50 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
    @click.stop
  >
    <div class="grid grid-cols-6 gap-2">
      <button
        v-for="emoji in commonEmojis"
        :key="emoji"
        @click="handleEmojiSelect(emoji)"
        class="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
        :title="emoji"
      >
        {{ emoji }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { PlusIcon, FaceSmileIcon } from '@heroicons/vue/24/outline'
import { useMessageReactions, type ReactionSummary } from '~/composables/useMessageReactions'

interface Props {
  messageId: number
  showAddButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAddButton: true
})

const {
  getMessageReactions,
  hasUserReacted,
  fetchReactions,
  toggleReaction,
  isLoading
} = useMessageReactions()

const showEmojiPicker = ref(false)

// Common emojis for quick selection
const commonEmojis = [
  '👍', '👎', '❤️', '😂', '😮', '😢',
  '😡', '👏', '🎉', '🔥', '💯', '✅'
]

// Get reactions for this message
const reactions = computed(() => getMessageReactions.value(props.messageId))

// Handle reaction click (toggle)
const handleReactionClick = async (emoji: string) => {
  try {
    await toggleReaction(props.messageId, emoji)
  } catch (error) {
    console.error('Failed to toggle reaction:', error)
  }
}

// Handle emoji selection from picker
const handleEmojiSelect = async (emoji: string) => {
  showEmojiPicker.value = false
  try {
    await toggleReaction(props.messageId, emoji)
  } catch (error) {
    console.error('Failed to add reaction:', error)
  }
}

// Generate tooltip text for reactions
const getReactionTooltip = (reaction: ReactionSummary): string => {
  if (reaction.count === 1) {
    return reaction.users[0]?.name || 'Someone'
  } else if (reaction.count === 2) {
    return `${reaction.users[0]?.name || 'Someone'} and ${reaction.users[1]?.name || 'someone else'}`
  } else if (reaction.count <= 5) {
    const names = reaction.users.slice(0, -1).map(u => u.name || 'Someone').join(', ')
    const lastName = reaction.users[reaction.users.length - 1]?.name || 'someone else'
    return `${names} and ${lastName}`
  } else {
    const firstNames = reaction.users.slice(0, 3).map(u => u.name || 'Someone').join(', ')
    const remaining = reaction.count - 3
    return `${firstNames} and ${remaining} others`
  }
}

// Close emoji picker when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element
  if (!target.closest('.emoji-picker-container')) {
    showEmojiPicker.value = false
  }
}

// Load reactions on mount
onMounted(() => {
  fetchReactions(props.messageId)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.emoji-picker-container {
  position: relative;
}
</style>