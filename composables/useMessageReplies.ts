import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMessaging } from '~/composables/useMessaging'
import type { Message } from '~/composables/useMessaging'

export interface ReplyContext {
  messageId: number
  content: string
  senderName: string
  timestamp: string
}

export const useMessageReplies = () => {
  const authStore = useAuthStore()
  const { sendMessage } = useMessaging()
  
  const replyingTo = ref<ReplyContext | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Set the message being replied to
  const setReplyContext = (message: Message) => {
    replyingTo.value = {
      messageId: message.id,
      content: message.content,
      senderName: message.sender?.name || 'Unknown User',
      timestamp: message.created_at
    }
  }

  // Clear reply context
  const clearReplyContext = () => {
    replyingTo.value = null
  }

  // Send a reply message
  const sendReply = async (conversationId: number, content: string, attachments?: File[]) => {
    if (!replyingTo.value) {
      throw new Error('No message to reply to')
    }

    try {
      isLoading.value = true
      error.value = null

      // Send message with reply_to_id
      await sendMessage(conversationId, content, attachments, replyingTo.value.messageId)
      
      // Clear reply context after successful send
      clearReplyContext()
    } catch (err: any) {
      console.error('Failed to send reply:', err)
      error.value = err.message || 'Failed to send reply'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get replies for a specific message
  const getReplies = computed(() => {
    return (messages: Message[], parentMessageId: number): Message[] => {
      return messages.filter(msg => msg.reply_to_id === parentMessageId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    }
  })

  // Get the parent message for a reply
  const getParentMessage = computed(() => {
    return (messages: Message[], replyMessageId: number): Message | null => {
      const replyMessage = messages.find(msg => msg.id === replyMessageId)
      if (!replyMessage?.reply_to_id) return null
      
      return messages.find(msg => msg.id === replyMessage.reply_to_id) || null
    }
  })

  // Check if a message has replies
  const hasReplies = computed(() => {
    return (messages: Message[], messageId: number): boolean => {
      return messages.some(msg => msg.reply_to_id === messageId)
    }
  })

  // Get reply count for a message
  const getReplyCount = computed(() => {
    return (messages: Message[], messageId: number): number => {
      return messages.filter(msg => msg.reply_to_id === messageId).length
    }
  })

  // Format reply preview text (truncate if too long)
  const formatReplyPreview = (content: string, maxLength: number = 50): string => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // Check if message is a reply
  const isReply = (message: Message): boolean => {
    return !!message.reply_to_id
  }

  // Get thread messages (parent + all replies)
  const getThreadMessages = computed(() => {
    return (messages: Message[], parentMessageId: number): Message[] => {
      const parent = messages.find(msg => msg.id === parentMessageId)
      if (!parent) return []
      
      const replies = getReplies.value(messages, parentMessageId)
      return [parent, ...replies]
    }
  })

  return {
    replyingTo,
    isLoading,
    error,
    setReplyContext,
    clearReplyContext,
    sendReply,
    getReplies,
    getParentMessage,
    hasReplies,
    getReplyCount,
    formatReplyPreview,
    isReply,
    getThreadMessages
  }
}