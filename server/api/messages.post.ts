export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Mock message creation
  const mockMessage = {
    id: Math.floor(Math.random() * 10000),
    conversation_id: body.conversation_id,
    sender_id: 1, // Mock current user ID
    content: body.content,
    type: body.type || 'text',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    read_at: null
  }
  
  console.log('Mock message created:', mockMessage)
  
  // Return in expected format
  return {
    success: true,
    message: mockMessage
  }
})