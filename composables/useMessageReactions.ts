import { ref, computed } from 'vue'
import type { Ref } from 'vue'

export interface MessageReaction {
  id: number
  message_id: number
  user_id: number
  emoji: string
  created_at: string
  updated_at: string
  user: {
    id: number
    name: string
  }
}

export interface ReactionSummary {
  emoji: string
  count: number
  users: Array<{ id: number; name: string }>
  user_reacted: boolean
}

export const useMessageReactions = () => {
  const reactions: Ref<Record<number, ReactionSummary[]>> = ref({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get reactions for a specific message
  const getMessageReactions = computed(() => {
    return (messageId: number): ReactionSummary[] => {
      return reactions.value[messageId] || []
    }
  })

  // Check if current user has reacted with specific emoji
  const hasUserReacted = computed(() => {
    return (messageId: number, emoji: string): boolean => {
      const messageReactions = reactions.value[messageId] || []
      const reaction = messageReactions.find(r => r.emoji === emoji)
      return reaction?.user_reacted || false
    }
  })

  // Fetch reactions for a message
  const fetchReactions = async (messageId: number) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<{
        success: boolean
        reactions: ReactionSummary[]
      }>(`/api/messages/${messageId}/reactions`)

      if (response.success) {
        reactions.value[messageId] = response.reactions
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch reactions'
      console.error('Error fetching reactions:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Toggle a reaction (add/remove)
  const toggleReaction = async (messageId: number, emoji: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<{
        success: boolean
        action: 'added' | 'removed'
        reaction?: MessageReaction
        message: string
      }>(`/api/messages/${messageId}/reactions/toggle`, {
        method: 'PATCH',
        body: { emoji }
      })

      if (response.success) {
        // Refresh reactions for this message
        await fetchReactions(messageId)
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to toggle reaction'
      console.error('Error toggling reaction:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Add a reaction
  const addReaction = async (messageId: number, emoji: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<{
        success: boolean
        reaction: MessageReaction
      }>(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        body: { emoji }
      })

      if (response.success) {
        // Refresh reactions for this message
        await fetchReactions(messageId)
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to add reaction'
      console.error('Error adding reaction:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Remove a reaction
  const removeReaction = async (messageId: number, reactionId: number) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<{
        success: boolean
        message: string
      }>(`/api/messages/${messageId}/reactions/${reactionId}`, {
        method: 'DELETE'
      })

      if (response.success) {
        // Refresh reactions for this message
        await fetchReactions(messageId)
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to remove reaction'
      console.error('Error removing reaction:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Handle real-time reaction events
  const handleReactionAdded = (reaction: MessageReaction) => {
    // Refresh reactions for the message
    fetchReactions(reaction.message_id)
  }

  const handleReactionRemoved = (messageId: number, emoji: string, userId: number) => {
    // Refresh reactions for the message
    fetchReactions(messageId)
  }

  // Clear reactions for a specific message
  const clearMessageReactions = (messageId: number) => {
    delete reactions.value[messageId]
  }

  // Clear all reactions
  const clearAllReactions = () => {
    reactions.value = {}
  }

  return {
    reactions: readonly(reactions),
    isLoading: readonly(isLoading),
    error: readonly(error),
    getMessageReactions,
    hasUserReacted,
    fetchReactions,
    toggleReaction,
    addReaction,
    removeReaction,
    handleReactionAdded,
    handleReactionRemoved,
    clearMessageReactions,
    clearAllReactions
  }
}