import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [messages, setMessages] = useState([]); 
    const { authUser } = useAuthContext();

    useEffect(() => {
        if (authUser) {
            const socketInstance = io("http://192.168.100.3:5000", {
                query: {
                    userId: authUser._id,
                },
            });

            setSocket(socketInstance);

            socketInstance.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            socketInstance.on("typing", (userId) => {
                setTypingUsers((prev) => [...prev, userId]);
            });

            socketInstance.on("stopTyping", (userId) => {
                setTypingUsers((prev) => prev.filter((id) => id !== userId));
            });

            socketInstance.on("newMessage", (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);

                if (message.receiverId === authUser._id) {
                    socketInstance.emit("markMessageAsRead", message._id);
                }
            });

            socketInstance.on("messageRead", (messageId) => {
                setMessages((prevMessages) =>
                    prevMessages.map(msg =>
                        msg._id === messageId ? { ...msg, read: true } : msg
                    )
                );
            });

            return () => {
                socketInstance.disconnect(); 
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [authUser]);

    const sendTypingStatus = (receiverId, isTyping) => {
        if (socket) {
            socket.emit(isTyping ? "typing" : "stopTyping", receiverId);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, typingUsers, sendTypingStatus, messages }}>
            {children}
        </SocketContext.Provider>
    );
};
