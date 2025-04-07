import { useEffect, useState } from "react";
import { useSocketContext } from "../../context/SocketContext";

const useTyping = () => {
    const [typingUser, setTypingUser] = useState(null);
    const { socket } = useSocketContext(); 

    useEffect(() => {
        if (!socket) return;

        
        const handleTyping = (userId) => {
            setTypingUser(userId);
        };

        const handleStopTyping = () => {
            setTypingUser(null);
        };

        socket.on("typing", handleTyping);
        socket.on("stopTyping", handleStopTyping);

        
        return () => {
            socket.off("typing", handleTyping);
            socket.off("stopTyping", handleStopTyping);
        };
    }, [socket]);

    return typingUser;
};

export default useTyping;
