import { useEffect, useState } from 'react';
import useConversation from '../zustand/useConversation';
import { getMessages } from '../../../frontend/services/message.service';

export const useGetMessages = () => {
  const { selectedConversation } = useConversation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (selectedConversation?._id) {
          const data = await getMessages(selectedConversation._id);
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation?._id]);

  return { messages, loading };
};