import React, { useState, useEffect, useRef } from 'react';
import suriFullImg from '../IMG/SURI CUERPOCOMPLETO.png';
import suriThinkImg from '../IMG/SURI PENSATIVA.png';
import { useAuth } from '../context/AuthContext';
import IntercomunicadorChat from './IntercomunicadorChat';
import { io } from 'socket.io-client';
import { api } from '../services/api';
import './FloatingSuri.css';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000';

const FloatingSuri = () => {
    const { user } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadPerContact, setUnreadPerContact] = useState({}); // { [sender_id]: count }
    const [onlineUsers, setOnlineUsers] = useState([]);
    const socketRef = useRef(null);

    const hasAccess = user && (
        user.role_id === 1 || // Gerente
        user.role_id === 5 || // Analista
        (user.pages && user.pages.some(p => p.page_code === 'INTERCOMUNICADOR'))
    );

    useEffect(() => {
        if (!hasAccess || !user) return;

        // Intentar obtener conteo de no leídos desde el servidor si existe el endpoint
        api.get('/chat/unread').then(res => {
            if (res.success && res.data) {
                // res.data = { sender_id: count }
                setUnreadPerContact(res.data);
            }
        }).catch(() => { /* ignorar si el endpoint aún no está listo */ });

        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('connect', () => {
            socketRef.current.emit('register', user.user_id || user.id);
        });

        socketRef.current.on('onlineUsers', (users) => {
            setOnlineUsers(users);
        });

        socketRef.current.on('receiveMessage', (newMsg) => {
            const myId = user.user_id || user.id;
            if (newMsg.sender_id !== myId) {
                const chatKey = newMsg.is_group ? 'group' : newMsg.sender_id;
                setUnreadPerContact(prev => ({
                    ...prev,
                    [chatKey]: (prev[chatKey] || 0) + 1
                }));
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user, hasAccess]);

    // Calcula el total de mensajes no leídos
    const totalUnread = Object.values(unreadPerContact).reduce((a, b) => a + b, 0);

    const handleClearUnread = (chatId) => {
        setUnreadPerContact(prev => {
            const newObj = { ...prev };
            delete newObj[chatId];
            return newObj;
        });
    };

    if (!hasAccess) return null;

    return (
        <>
            <div
                className={`floating-suri-container ${isChatOpen ? 'chat-active' : ''}`}
                onClick={() => setIsChatOpen(!isChatOpen)}
                title={isChatOpen ? "Cerrar Intercomunicador" : "Abrir Intercomunicador"}
            >
                <img
                    src={isChatOpen ? suriThinkImg : suriFullImg}
                    alt="SURI"
                    className={`floating-suri-img ${isChatOpen ? 'animate-think' : 'animate-idle'}`}
                />
                {!isChatOpen && totalUnread > 0 && (
                    <div className="suri-notification-badge">{totalUnread > 99 ? '99+' : totalUnread}</div>
                )}
            </div>

            {isChatOpen && (
                <IntercomunicadorChat
                    onClose={() => setIsChatOpen(false)}
                    sharedSocket={socketRef.current}
                    onlineUsers={onlineUsers}
                    unreadPerContact={unreadPerContact}
                    onClearUnread={handleClearUnread}
                />
            )}
        </>
    );
};

export default FloatingSuri;
