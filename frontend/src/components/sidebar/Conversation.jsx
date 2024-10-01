import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";


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
    const { onlineUsers, typingUsers } = useSocketContext();

    const isSelected = selectedConversation?._id === conversation._id;
    const isOnline = onlineUsers.includes(conversation._id);
    const isTyping = typingUsers.includes(conversation._id);

    const profilePicBase64 = getProfilePicBase64(conversation.image);

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
                        <span className='text-xl'>{emoji}</span>
                    </div>
                    {isTyping && <p className='text-sm text-gray-400'>Typing...</p>}
                </div>
            </div>

            {!lastIdx && <div className='divider my-0 py-0 h-1' />}
        </>
    );
};

export default Conversation;
