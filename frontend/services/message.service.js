/**
 * Service for handling message-related API calls
 */

/**
 * Fetches messages for a specific conversation
 * @param {string} conversationId - The ID of the conversation to fetch messages for
 * @returns {Promise<Array>} - Array of messages
 */
export const getMessages = async (conversationId) => {
  try {
    const response = await fetch(`/api/messages/${conversationId}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error('Error in message service:', error);
    throw error;
  }
};