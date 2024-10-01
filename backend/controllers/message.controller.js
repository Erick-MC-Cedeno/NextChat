import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
	try {
		const { message } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		if (!message || message.trim().length === 0) {
			return res.status(400).json({ error: "Message cannot be empty" });
		}

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
			read: false,
		});

		conversation.messages.push(newMessage._id);
		await Promise.all([conversation.save(), newMessage.save()]);

		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.error("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages");

		if (!conversation) {
			return res.status(200).json([]);
		}

		const messages = conversation.messages;
		const unreadMessages = messages.filter(msg => !msg.read && msg.receiverId.equals(senderId));
		for (let msg of unreadMessages) {
			msg.read = true;
			await msg.save(); 
			const receiverSocketId = getReceiverSocketId(senderId);
			if (receiverSocketId) {
				io.to(receiverSocketId).emit("messageRead", msg._id);
			}
		}

		res.status(200).json(messages);
	} catch (error) {
		console.error("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
