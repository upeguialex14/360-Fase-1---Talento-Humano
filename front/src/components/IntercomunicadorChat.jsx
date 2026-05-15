import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './IntercomunicadorChat.css';

const IntercomunicadorChat = ({ onClose }) => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState(null); // 'group' or userId
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState({}); // { [chatId]: [messages] }

    useEffect(() => {
        fetchContacts();
    }, []);

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

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedChat) return;

        const newMessage = {
            id: Date.now(),
            text: message,
            sender: 'me',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatHistory(prev => ({
            ...prev,
            [selectedChat]: [...(prev[selectedChat] || []), newMessage]
        }));

        setMessage('');
    };

    const currentMessages = chatHistory[selectedChat] || [];

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
                    </div>

                    <div className="sidebar-divider">Contactos</div>

                    {loading ? (
                        <div className="chat-loading">Cargando...</div>
                    ) : (
                        contacts.map(contact => (
                            <div 
                                key={contact.user_id} 
                                className={`contact-item ${selectedChat === contact.user_id ? 'active' : ''}`}
                                onClick={() => setSelectedChat(contact.user_id)}
                            >
                                <div className={`contact-avatar ${contact.status}`}>
                                    {contact.name.charAt(0)}
                                </div>
                                <div className="contact-info">
                                    <span className="contact-name">{contact.full_name}</span>
                                    <span className="contact-role">{contact.role_name}</span>
                                </div>
                                {contact.status === 'online' && <span className="online-indicator"></span>}
                            </div>
                        ))
                    )}
                </div>

                <div className="chat-main">
                    {selectedChat ? (
                        <div className="chat-conversation">
                            <div className="conversation-header">
                                {selectedChat === 'group' ? 'Chat Grupal' : `Chat con ${contacts.find(c => c.user_id === selectedChat)?.name}`}
                            </div>
                            <div className="conversation-messages">
                                <div className="system-message">
                                    <span className="suri-mini-icon">🤖</span>
                                    <p>¡Hola! Aquí podrás dejar notificaciones y anuncios a tus compañeros.</p>
                                </div>
                                
                                {currentMessages.map(msg => (
                                    <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                                        <div className="message-text">{msg.text}</div>
                                        <div className="message-time">{msg.timestamp}</div>
                                    </div>
                                ))}
                            </div>
                            <form className="conversation-input" onSubmit={handleSendMessage}>
                                <input 
                                    type="text" 
                                    placeholder="Escribe un mensaje..." 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <button className="send-btn" type="submit" style={{ opacity: message.trim() ? 1 : 0.5 }}>➤</button>
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
