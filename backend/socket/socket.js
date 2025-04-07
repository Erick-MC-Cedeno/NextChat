import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ["http://localhost:3000"],
		methods: ["GET", "POST"],
	},
});

const userSocketMap = {}; // {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
	const userId = socket.handshake.query.userId;
	if (userId != "undefined") userSocketMap[userId] = socket.id;

	io.emit("getOnlineUsers", Object.keys(userSocketMap));

	socket.on("typing", (receiverId) => {
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("typing", userId);
		}
	});

	socket.on("stopTyping", (receiverId) => {
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("stopTyping", userId);
		}
	});

	socket.on("markMessageAsRead", async (messageId) => {
		try {
			const Message = await import("../models/message.model.js").then(module => module.default);
			const message = await Message.findById(messageId);
			
			if (message) {
				message.read = true;
				await message.save();
				
				// Notificar al remitente que el mensaje ha sido leído
				const senderSocketId = getReceiverSocketId(message.senderId);
				if (senderSocketId) {
					io.to(senderSocketId).emit("messageRead", messageId);
				}
			}
		} catch (error) {
			console.error("Error marking message as read:", error);
		}
	});

	socket.on("disconnect", () => {
		delete userSocketMap[userId];
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});
});

export { app, io, server };