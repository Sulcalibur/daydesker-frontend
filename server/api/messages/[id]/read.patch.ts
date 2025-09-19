export default defineEventHandler(async (event) => {
  const messageId = getRouterParam(event, 'id')
  
  // For testing purposes, just return success
  // In production, this would call the Laravel API
  console.log(`Mock: Marking message ${messageId} as read`)
  
  return {
    success: true,
    message_id: messageId,
    read_at: new Date().toISOString()
  }
})