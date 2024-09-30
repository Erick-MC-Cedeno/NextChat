import { useState, useEffect, useRef } from "react";
import { BsSend } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";
import { useSocketContext } from "../../context/SocketContext";

const MessageInput = ({ receiverId }) => {
	const [message, setMessage] = useState("");
	const { loading, sendMessage } = useSendMessage();
	const { socket, sendTypingStatus } = useSocketContext();
	const typingTimeoutRef = useRef(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message) return;
		await sendMessage(message);
		setMessage("");
		sendTypingStatus(receiverId, false);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault(); 
			handleSubmit(e);
		}
	};

	const handleChange = (e) => {
		setMessage(e.target.value);
		sendTypingStatus(receiverId, true);

		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		typingTimeoutRef.current = setTimeout(() => {
			sendTypingStatus(receiverId, false);
		}, 1000); // Adjust the timeout as needed
	};

	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
		};
	}, []);

	return (
		<form className='px-4 my-3' onSubmit={handleSubmit}>
			<div className='w-full relative'>
				<textarea
					className='border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white'
					placeholder='Send a message'
					value={message}
					onChange={handleChange}
					onKeyDown={handleKeyDown} 
					rows={1}
					style={{ resize: 'none', overflowY: 'hidden' }}
				/>
				<button type='submit' className='absolute inset-y-0 end-0 flex items-center pe-3'>
					{loading ? <div className='loading loading-spinner'></div> : <BsSend />}
				</button>
			</div>
		</form>
	);
};

export default MessageInput;