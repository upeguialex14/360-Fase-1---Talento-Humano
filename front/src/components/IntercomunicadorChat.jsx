import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './IntercomunicadorChat.css';

const IntercomunicadorChat = ({ onClose }) => {
    const { user } = useAuth();
    const [spaceId, setSpaceId] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]); // Historial local de la sesión
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        
        if (!message.trim() || !spaceId.trim()) return;

        const myEmail = user.email || 'usuario@multipagas.com';
        const msgText = message.trim();
        
        // Optimistic UI
        const tempMsg = {
            id: Date.now(),
            text: msgText,
            sender: myEmail,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Enviando...'
        };
        
        setMessages(prev => [...prev, tempMsg]);
        setMessage('');
        setSending(true);

        try {
            const res = await api.post('/chat/send', {
                userEmail: myEmail,
                spaceId: spaceId.trim(),
                messageText: msgText
            });

            if (res.success) {
                setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...m, status: 'Enviado ✔' } : m));
            } else {
                throw new Error('Error en respuesta');
            }
        } catch (err) {
            console.error('Error enviando a Google Chat:', err);
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...m, status: 'Error ❌' } : m));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="intercomunicador-chat-window animate-slide-up" style={{ width: '450px' }}>
            <div className="chat-header">
                <div className="header-info">
                    <span className="header-icon">🤖</span>
                    <h3>Google Chat (Bot)</h3>
                </div>
                <button className="chat-close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="chat-body" style={{ flexDirection: 'column' }}>
                <div className="space-id-container" style={{ padding: '1rem', background: 'rgba(0, 255, 239, 0.05)', borderBottom: '1px solid rgba(0,255,239,0.1)' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#00FFEF', marginBottom: '0.5rem', fontWeight: 'bold' }}>SPACE ID DESTINO</label>
                    <input 
                        type="text" 
                        placeholder="Ej: spaces/AAAAA123456" 
                        value={spaceId}
                        onChange={(e) => setSpaceId(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '0.6rem', 
                            borderRadius: '8px', 
                            background: 'rgba(3, 10, 13, 0.8)', 
                            border: '1px solid rgba(0,255,239,0.2)',
                            color: '#e0fffe',
                            outline: 'none'
                        }}
                    />
                </div>

                <div className="chat-main" style={{ flex: 1 }}>
                    <div className="chat-conversation">
                        <div className="conversation-messages custom-scrollbar">
                            <div className="system-message">
                                <span className="suri-mini-icon">ℹ️</span>
                                <p style={{ fontSize: '0.85rem', margin: 0 }}>
                                    Ingresa el Space ID donde el Bot ha sido invitado. Tus mensajes llegarán con tu correo ({user?.email || 'Autenticado'}) como prefijo.
                                </p>
                            </div>
                            
                            {messages.map((msg) => (
                                <div key={msg.id} className="message-bubble me">
                                    <div className="message-text">{msg.text}</div>
                                    <div className="message-time">
                                        {msg.time} • <span style={{ color: msg.status.includes('Error') ? '#ef4444' : '#00FFEF' }}>{msg.status}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="conversation-input" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                placeholder="Escribe un mensaje al Bot..." 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={sending || !spaceId.trim()}
                            />
                            <button className="send-btn" type="submit" disabled={sending || !message.trim() || !spaceId.trim()}>➤</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntercomunicadorChat;
