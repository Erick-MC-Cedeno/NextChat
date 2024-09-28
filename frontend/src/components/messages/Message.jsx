import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";

const bufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

const Message = ({ message }) => {
    const { authUser } = useAuthContext();
    const { selectedConversation } = useConversation();
    const fromMe = message.senderId === authUser._id;
    const formattedTime = extractTime(message.createdAt);
    const chatClassName = fromMe ? "chat-end" : "chat-start";
    const profilePicBase64 = fromMe 
        ? authUser.image && typeof authUser.image === 'string'
            ? `data:image/jpeg;base64,${authUser.image.split(',')[1]}`
            : authUser.image && authUser.image.data
                ? `data:image/jpeg;base64,${bufferToBase64(authUser.image.data)}`
                : "default-image-url.png" 
        : selectedConversation?.image && typeof selectedConversation.image === 'string'
            ? `data:image/jpeg;base64,${selectedConversation.image.split(',')[1]}`
            : selectedConversation?.image && selectedConversation.image.data
                ? `data:image/jpeg;base64,${bufferToBase64(selectedConversation.image.data)}`
                : "default-image-url.png"; 

    const bubbleBgColor = fromMe ? "bg-blue-500" : "";
    const shakeClass = message.shouldShake ? "shake" : "";

    return (
        <div className={`chat ${chatClassName}`}>
            <div className='chat-image avatar'>
                <div className='w-10 rounded-full'>
                    {profilePicBase64 ? (
                        <img alt='Usuario' src={profilePicBase64} />
                    ) : (
                        <img src="default-image-url.png" alt='default user' /> 
                    )}
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
