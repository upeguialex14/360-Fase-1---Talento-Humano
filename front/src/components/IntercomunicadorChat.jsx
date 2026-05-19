import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import './IntercomunicadorChat.css';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000';

const IntercomunicadorChat = ({ onClose, sharedSocket, onlineUsers = [], unreadPerContact = {}, onClearUnread }) => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState(null); // 'group' or userId
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const selectedChatRef = useRef(selectedChat);

    // Mantener la referencia actualizada para el socket
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    // Conectar a Socket.io usando el socket compartido
    useEffect(() => {
        if (!user || !sharedSocket) return;

        // Este listener maneja la recepción de mensajes cuando el chat está abierto
        const handleReceiveMessage = (newMsg) => {
            setMessages(prev => {
                const currentSelected = selectedChatRef.current;
                const myId = user.user_id || user.id;
                
                const isRelevant = 
                    (newMsg.is_group && currentSelected === 'group') || 
                    (!newMsg.is_group && (
                        newMsg.sender_id === currentSelected || 
                        (newMsg.sender_id === myId && newMsg.receiver_id === currentSelected)
                    ));
                
                if (isRelevant) {
                    if (!prev.some(m => m.id === newMsg.id)) {
                        return [...prev, newMsg];
                    }
                }
                return prev;
            });
        };

        sharedSocket.on('receiveMessage', handleReceiveMessage);

        fetchContacts();

        return () => {
            sharedSocket.off('receiveMessage', handleReceiveMessage);
        };
    }, [user, sharedSocket]);

    // Limpiar no leídos cuando se selecciona un chat
    useEffect(() => {
        if (selectedChat && onClearUnread) {
            onClearUnread(selectedChat);
        }
    }, [selectedChat, onClearUnread]);

    // Scroll hacia abajo cuando llegan mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cargar historial cuando seleccionas un chat
    useEffect(() => {
        if (!selectedChat || !user) return;
        
        const fetchHistory = async () => {
            try {
                const myId = user.user_id || user.id;
                const endpoint = selectedChat === 'group' 
                    ? `/chat/history/group` 
                    : `/chat/history/${myId}/${selectedChat}`;
                
                const res = await api.get(endpoint);
                if (res.success) {
                    setMessages(res.data);
                }
            } catch (err) {
                console.error('Error fetching history:', err);
            }
        };

        fetchHistory();
    }, [selectedChat, user]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users/intercomunicador/contacts');
            if (res.success) {
                setContacts(res.data);
            }
        } catch (err) {
            console.error('Error fetching contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (e, fileData = null) => {
        if (e) e.preventDefault();
        
        if ((!message.trim() && !fileData) || !selectedChat) return;

        const myId = user.user_id || user.id;
        const msgData = {
            sender_id: myId,
            receiver_id: selectedChat === 'group' ? null : selectedChat,
            is_group: selectedChat === 'group',
            message: message.trim(),
            file_url: fileData ? fileData.fileUrl : null,
            file_type: fileData ? fileData.fileType : null
        };

        sharedSocket.emit('sendMessage', msgData);
        setMessage('');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Se asume que api.post formatea correctamente o usamos fetch directo si falla
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const res = await fetch(`${baseUrl}/chat/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                handleSendMessage(null, { fileUrl: data.fileUrl, fileType: data.fileType });
            }
        } catch (err) {
            console.error('Error subiendo archivo:', err);
        } finally {
            setUploading(false);
            e.target.value = null; // reset
        }
    };

    const renderMessageContent = (msg) => {
        const myId = user.user_id || user.id;
        const isMine = msg.sender_id === myId;
        
        return (
            <div key={msg.id || Math.random()} className={`message-bubble ${isMine ? 'me' : 'other'}`}>
                {Boolean(msg.is_group) && !isMine && (
                    <div className="message-sender-name">
                        {contacts.find(c => c.user_id === msg.sender_id)?.name || 'Usuario'}
                    </div>
                )}
                {msg.message && <div className="message-text">{msg.message}</div>}
                
                {msg.file_url && (
                    <div className="message-attachment">
                        {msg.file_type?.startsWith('image/') ? (
                            <img src={`${SOCKET_URL}${msg.file_url}`} alt="adjunto" className="chat-image-preview" />
                        ) : (
                            <a href={`${SOCKET_URL}${msg.file_url}`} target="_blank" rel="noopener noreferrer" className="chat-file-link">
                                📎 Descargar archivo
                            </a>
                        )}
                    </div>
                )}
                <div className="message-time">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        );
    };

    return (
        <div className="intercomunicador-chat-window animate-slide-up">
            <div className="chat-header">
                <div className="header-info">
                    <span className="header-icon">💬</span>
                    <h3>Suri Intercomunicador</h3>
                </div>
                <button className="chat-close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="chat-body">
                <div className="chat-sidebar">
                    <div 
                        className={`contact-item group-chat ${selectedChat === 'group' ? 'active' : ''}`}
                        onClick={() => setSelectedChat('group')}
                    >
                        <div className="contact-avatar group-avatar">👥</div>
                        <div className="contact-info">
                            <span className="contact-name">Grupo Analistas/Gerentes</span>
                            <span className="contact-status">Canal Grupal</span>
                        </div>
                        {unreadPerContact['group'] > 0 && (
                            <span className="unread-badge">{unreadPerContact['group']}</span>
                        )}
                    </div>

                    <div className="sidebar-divider">Contactos</div>

                    {loading ? (
                        <div className="chat-loading">Cargando...</div>
                    ) : (
                        contacts.map(contact => {
                            const isOnline = onlineUsers.includes(contact.user_id?.toString());
                            const unread = unreadPerContact[contact.user_id] || 0;
                            return (
                                <div 
                                    key={contact.user_id} 
                                    className={`contact-item ${selectedChat === contact.user_id ? 'active' : ''}`}
                                    onClick={() => setSelectedChat(contact.user_id)}
                                >
                                    <div className={`contact-avatar ${isOnline ? 'online' : 'offline'}`}>
                                        {contact.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="contact-info">
                                        <span className="contact-name">{contact.full_name}</span>
                                        <span className="contact-role">{contact.role_name}</span>
                                    </div>
                                    {isOnline && <span className="online-indicator"></span>}
                                    {unread > 0 && <span className="unread-badge">{unread}</span>}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="chat-main">
                    {selectedChat ? (
                        <div className="chat-conversation">
                            <div className="conversation-header">
                                {selectedChat === 'group' 
                                    ? 'Chat Grupal' 
                                    : `Chat con ${contacts.find(c => c.user_id === selectedChat)?.name || ''}`}
                            </div>
                            
                            <div className="conversation-messages custom-scrollbar">
                                <div className="system-message">
                                    <span className="suri-mini-icon">🤖</span>
                                    <p>¡Hola! Aquí podrás dejar notificaciones y anuncios a tus compañeros.</p>
                                </div>
                                
                                {messages.map(renderMessageContent)}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="conversation-input" onSubmit={(e) => handleSendMessage(e)}>
                                <button type="button" className="attach-btn" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                                    {uploading ? '⏳' : '📎'}
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    onChange={handleFileUpload}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Escribe un mensaje..." 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={uploading}
                                />
                                <button className="send-btn" type="submit" disabled={uploading || (!message.trim())}>➤</button>
                            </form>
                        </div>
                    ) : (
                        <div className="chat-empty-state">
                            <div className="empty-icon">SURI</div>
                            <p>Selecciona un contacto o grupo para iniciar la comunicación</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntercomunicadorChat;
