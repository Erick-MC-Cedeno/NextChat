import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";
import { Badge } from '@mui/material';
import { useState, useEffect } from "react";


const bufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes));
};

const getProfilePicBase64 = (image) => {
    if (image && image.data) {
        return `data:image/jpeg;base64,${bufferToBase64(image.data)}`;
    }
    return "default-image-url.png"; 
};

const Conversation = ({ conversation, lastIdx, emoji }) => {
    const { selectedConversation, setSelectedConversation } = useConversation();
    const { onlineUsers, typingUsers, messages } = useSocketContext();
    const [unreadCount, setUnreadCount] = useState(0);

    const isSelected = selectedConversation?._id === conversation._id;
    const isOnline = onlineUsers.includes(conversation._id);
    const isTyping = typingUsers.includes(conversation._id);

    const profilePicBase64 = getProfilePicBase64(conversation.image);
    
    useEffect(() => {
        // Contar mensajes no leídos para esta conversación específica
        const count = messages.filter(msg => 
            !msg.read && 
            msg.senderId === conversation._id
        ).length;
        setUnreadCount(count);
    }, [messages, conversation._id]);

    return (
        <>
            <div
                className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer ${isSelected ? "bg-sky-500" : ""}`}
                onClick={() => setSelectedConversation(conversation)}
            >
                <div className={`avatar ${isOnline ? "online" : ""}`}>
                    <div className='w-12 rounded-full'>
                        <img src={profilePicBase64} alt='user avatar' />
                    </div>
                </div>

                <div className='flex flex-col flex-1'>
                    <div className='flex gap-3 justify-between'>
                        <p className='font-bold text-gray-200'>{conversation.fullName}</p>
                        <div className="flex items-center">
                            {unreadCount > 0 && (
                                <Badge badgeContent={unreadCount} color="error" className="mr-2" />
                            )}
                            <span className='text-xl'>{emoji}</span>
                        </div>
                    </div>
                    {isTyping && <p className='text-sm text-gray-400'>Typing...</p>}
                </div>
            </div>

            {!lastIdx && <div className='divider my-0 py-0 h-1' />}
        </>
    );
};

export default Conversation;
