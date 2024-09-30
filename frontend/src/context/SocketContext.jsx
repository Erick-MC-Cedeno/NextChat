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
	const { authUser } = useAuthContext();

	useEffect(() => {
		if (authUser) {
			const socket = io("http://192.168.100.3:5000", {
				query: {
					userId: authUser._id,
				},
			});

			setSocket(socket);

			socket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			socket.on("typing", (userId) => {
				setTypingUsers((prev) => [...prev, userId]);
			});

			socket.on("stopTyping", (userId) => {
				setTypingUsers((prev) => prev.filter((id) => id !== userId));
			});

			return () => socket.close();
		} else {
			if (socket) {
				socket.close();
				setSocket(null);
			}
		}
	}, [authUser]);

	const sendTypingStatus = (receiverId, isTyping) => {
		if (socket) {
			if (isTyping) {
				socket.emit("typing", receiverId);
			} else {
				socket.emit("stopTyping", receiverId);
			}
		}
	};

	return (
		<SocketContext.Provider value={{ socket, onlineUsers, typingUsers, sendTypingStatus }}>
			{children}
		</SocketContext.Provider>
	);
};