import useGetConversations from "../../hooks/useGetConversations";
import Conversation from "./Conversation";
import { useSocketContext } from "../../context/SocketContext";
import { useState, useEffect } from "react";
import NotificationIcon from '@mui/icons-material/Notifications';
import { Badge } from '@mui/material';

const Conversations = () => {
	const { loading, conversations } = useGetConversations();
	const { messages, socket } = useSocketContext();
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		const storedUnreadCount = JSON.parse(localStorage.getItem('unreadCount')) || 0;
		setUnreadCount(storedUnreadCount);

		const countUnreadMessages = () => {
			const count = messages.filter(message => !message.read).length;
			setUnreadCount(count);
			localStorage.setItem('unreadCount', count); 
		};

		countUnreadMessages();
	}, [messages]);

	const handleConversationClick = async (conversation) => {
		const messageIdsToMark = messages
			.filter(msg => msg.receiverId === conversation.participants[0] && !msg.read)
			.map(msg => msg._id);
		
		if (messageIdsToMark.length > 0) {
			handleMarkAsRead(messageIdsToMark);
		}

		await loadMessages(conversation._id);
	};

	const loadMessages = async (conversationId) => {
		const response = await fetch(`/api/conversations/${conversationId}/messages`);
		const data = await response.json();
		updateUnreadCount();
	};

	const updateUnreadCount = () => {
		const count = messages.filter(message => !message.read).length;
		setUnreadCount(count);
		localStorage.setItem('unreadCount', count); 
	};

	const handleMarkAsRead = (messageIds) => {
		messageIds.forEach(id => {
			socket.emit("markMessageAsRead", id);
		});
		updateUnreadCount();
	};

	return (
		<div className='py-2 flex flex-col overflow-auto'>
			<div className="flex items-center justify-between mb-4">
				{loading ? (
					<span className='loading loading-spinner mx-auto'></span>
				) : (
					<h1 className="text-center text-lg flex items-center"> 
						<Badge badgeContent={unreadCount} color="error">
							<NotificationIcon style={{ fontSize: 24 }} /> 
						</Badge>
						<span className="ml-2">Notificaciones</span>
					</h1>
				)}
			</div>
			
			{conversations.map((conversation, idx) => (
				<Conversation
					key={conversation._id}
					conversation={conversation}
					lastIdx={idx === conversations.length - 1}
					onClick={() => handleConversationClick(conversation)}
				/>
			))}

			{loading && <span className='loading loading-spinner mx-auto'></span>}
			
			<div className="mt-4">
				<h2 className="text-center text-lg">Chat</h2> 
			</div>
		</div>
	);
};

export default Conversations;
