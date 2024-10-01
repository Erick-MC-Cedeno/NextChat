import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";

const bufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes));
};

const getProfilePicBase64 = (userImage) => {
    if (typeof userImage === 'string') {
        return `data:image/jpeg;base64,${userImage.split(',')[1]}`;
    } else if (userImage && userImage.data) {
        return `data:image/jpeg;base64,${bufferToBase64(userImage.data)}`;
    }
    return "default-image-url.png"; 
};

const Message = ({ message }) => {
    const { authUser } = useAuthContext();
    const { selectedConversation } = useConversation();
    
    const fromMe = message.senderId === authUser._id;
    const formattedTime = extractTime(message.createdAt);
    const chatClassName = fromMe ? "chat-end" : "chat-start";

    const profilePicBase64 = fromMe
        ? getProfilePicBase64(authUser.image)
        : getProfilePicBase64(selectedConversation?.image);

    const bubbleBgColor = fromMe ? "bg-blue-500" : "";
    const shakeClass = message.shouldShake ? "shake" : "";

    return (
        <div className={`chat ${chatClassName}`}>
            <div className='chat-image avatar'>
                <div className='w-10 rounded-full'>
                    <img alt='Usuario' src={profilePicBase64} />
                </div>
            </div>
            <div
                className={`chat-bubble text-white ${bubbleBgColor} ${shakeClass} pb-2`}
                style={{
                    maxWidth: '90%',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {message.message}
            </div>
            <div className='chat-footer opacity-50 text-xs flex gap-1 items-center'>
                {formattedTime}
            </div>
        </div>
    );
};

export default Message;
