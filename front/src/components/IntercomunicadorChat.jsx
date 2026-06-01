import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './IntercomunicadorChat.css';

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:3000';

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

    // Auto-scroll al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cargar contactos al montar
    useEffect(() => {
        fetchContacts();
    }, []);

    // Escuchar mensajes del socket compartido
    useEffect(() => {
        if (!sharedSocket) return;

        const handleReceiveMessage = (newMsg) => {
            const myId = user?.user_id || user?.id;

            const isRelevant =
                Boolean(newMsg.is_group) ||
                newMsg.sender_id === myId ||
                newMsg.receiver_id === myId;

            if (!isRelevant) return;

            setMessages(prev => {
                // Sólo agrega si el chat activo coincide
                if (selectedChat === null) return prev;

                const isCurrentChat =
                    Boolean(newMsg.is_group)
                        ? selectedChat === 'group'
                        : (String(newMsg.sender_id) === String(selectedChat) ||
                           String(newMsg.receiver_id) === String(selectedChat));

                if (!isCurrentChat) return prev;
                return [...prev, newMsg];
            });
        };

        sharedSocket.on('receiveMessage', handleReceiveMessage);
        return () => {
            sharedSocket.off('receiveMessage', handleReceiveMessage);
        };
    }, [sharedSocket, selectedChat, user]);

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

    const loadHistory = async (chatId) => {
        try {
            const myId = user?.user_id || user?.id;
            let res;
            if (chatId === 'group') {
                res = await api.get('/chat/history/group');
            } else {
                res = await api.get(`/chat/history/${myId}/${chatId}`);
            }
            if (res.success) {
                setMessages(res.data);
            }
        } catch (err) {
            console.error('Error cargando historial:', err);
        }
    };

    const handleSelectChat = (chatId) => {
        setSelectedChat(chatId);
        setMessages([]);
        loadHistory(chatId);
        if (onClearUnread) {
            onClearUnread(chatId);
        }
    };

    const handleSendMessage = (e, fileData = null) => {
        if (e) e.preventDefault();

        const myId = user?.user_id || user?.id;
        const hasContent = (message.trim() || fileData) && selectedChat && sharedSocket;

        if (!hasContent) return;

        const msgData = {
            sender_id: myId,
            receiver_id: selectedChat === 'group' ? null : selectedChat,
            is_group: selectedChat === 'group',
            message: fileData ? null : message.trim(),
            file_url: fileData?.fileUrl || null,
            file_type: fileData?.fileType || null,
            created_at: new Date().toISOString()
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
            e.target.value = null;
        }
    };

    const handleScreenshot = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const video = document.createElement('video');
            video.srcObject = stream;
            await new Promise((resolve) => { video.onloadedmetadata = resolve; });
            await video.play();

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            stream.getTracks().forEach(t => t.stop());

            canvas.toBlob(async (blob) => {
                const file = new File([blob], `pantallazo-${Date.now()}.png`, { type: 'image/png' });
                const formData = new FormData();
                formData.append('file', file);

                setUploading(true);
                try {
                    const token = localStorage.getItem('token');
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                    const res = await fetch(`${baseUrl}/chat/upload`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    });
                    const data = await res.json();
                    if (data.success) {
                        handleSendMessage(null, { fileUrl: data.fileUrl, fileType: 'image/png' });
                    }
                } finally {
                    setUploading(false);
                }
            }, 'image/png');
        } catch (err) {
            console.error('Error capturando pantalla:', err);
        }
    };

    const renderMessageContent = (msg) => {
        const myId = user?.user_id || user?.id;
        const isMine = String(msg.sender_id) === String(myId);

        return (
            <div key={msg.id || Math.random()} className={`message-bubble ${isMine ? 'me' : 'other'}`}>
                {Boolean(msg.is_group) && !isMine && (
                    <div className="message-sender-name">
                        {contacts.find(c => String(c.user_id) === String(msg.sender_id))?.name || 'Usuario'}
                    </div>
                )}
                {msg.message && <div className="message-text">{msg.message}</div>}

                {msg.file_url && (
                    <div className="message-attachment">
                        {msg.file_type?.startsWith('image/') ? (
                            <img
                                src={`${SOCKET_URL}${msg.file_url}`}
                                alt="adjunto"
                                className="chat-image-preview"
                                onClick={() => window.open(`${SOCKET_URL}${msg.file_url}`, '_blank')}
                                style={{ cursor: 'pointer' }}
                            />
                        ) : (
                            <a
                                href={`${SOCKET_URL}${msg.file_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="chat-file-link"
                            >
                                📎 Descargar archivo
                            </a>
                        )}
                    </div>
                )}

                <div className="message-time">
                    {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
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
                {/* Barra lateral de contactos */}
                <div className="chat-sidebar">
                    <div
                        className={`contact-item group-chat ${selectedChat === 'group' ? 'active' : ''}`}
                        onClick={() => handleSelectChat('group')}
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
                            const isOnline = onlineUsers.includes(String(contact.user_id));
                            const unread = unreadPerContact[contact.user_id] || 0;
                            return (
                                <div
                                    key={contact.user_id}
                                    className={`contact-item ${selectedChat === contact.user_id ? 'active' : ''}`}
                                    onClick={() => handleSelectChat(contact.user_id)}
                                >
                                    <div className={`contact-avatar ${isOnline ? 'online' : ''}`}>
                                        {contact.name?.charAt(0)?.toUpperCase() || '?'}
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

                {/* Área principal del chat */}
                <div className="chat-main">
                    {selectedChat ? (
                        <div className="chat-conversation">
                            <div className="conversation-header">
                                {selectedChat === 'group'
                                    ? '💬 Chat Grupal — Analistas & Gerentes'
                                    : `💬 Chat con ${contacts.find(c => c.user_id === selectedChat)?.full_name || 'Contacto'}`}
                            </div>

                            <div className="conversation-messages custom-scrollbar">
                                <div className="system-message">
                                    <span className="suri-mini-icon">🤖</span>
                                    <p>¡Hola! Aquí puedes comunicarte en tiempo real con tus compañeros.</p>
                                </div>

                                {messages.map(renderMessageContent)}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="conversation-input" onSubmit={(e) => handleSendMessage(e)}>
                                {/* Adjuntar archivo */}
                                <button
                                    type="button"
                                    className="attach-btn"
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={uploading}
                                    title="Adjuntar archivo"
                                >
                                    {uploading ? '⏳' : '📎'}
                                </button>

                                {/* Captura de pantalla */}
                                <button
                                    type="button"
                                    className="attach-btn"
                                    onClick={handleScreenshot}
                                    disabled={uploading}
                                    title="Enviar captura de pantalla"
                                >
                                    📸
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

                                <button
                                    className="send-btn"
                                    type="submit"
                                    disabled={uploading || !message.trim()}
                                >
                                    ➤
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="chat-empty-state">
                            <div className="empty-icon">💬</div>
                            <p>Selecciona un contacto o el canal grupal para iniciar la comunicación</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntercomunicadorChat;
