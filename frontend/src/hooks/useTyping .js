import { useEffect, useState } from "react";
import { useSocketContext } from "../../context/SocketContext";

const useTyping = () => {
    const [typingUser, setTypingUser] = useState(null);
    const { socket } = useSocketContext(); // Asegúrate de que el socket esté disponible

    useEffect(() => {
        if (!socket) return;

        // Escuchar el evento de typing
        const handleTyping = (userId) => {
            setTypingUser(userId);
        };

        const handleStopTyping = () => {
            setTypingUser(null);
        };

        socket.on("typing", handleTyping);
        socket.on("stopTyping", handleStopTyping);

        // Limpiar el efecto al desmontar
        return () => {
            socket.off("typing", handleTyping);
            socket.off("stopTyping", handleStopTyping);
        };
    }, [socket]);

    return typingUser;
};

export default useTyping;
