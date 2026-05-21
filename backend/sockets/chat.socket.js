const pool = require('../config/db');

module.exports = (io) => {
    // Mapa para mantener qué usuario (user_id) está en qué socket(s)
    const onlineUsers = new Map();

    io.on('connection', (socket) => {
        console.log('🟢 Nuevo cliente conectado:', socket.id);

        // Cuando un usuario se autentica o entra al chat
        socket.on('register', (userId) => {
            if (!userId) return;
            socket.userId = userId.toString();
            socket.join(userId.toString());
            onlineUsers.set(userId.toString(), true);
            console.log(`👤 Usuario registrado: ${userId} con socket ${socket.id}`);
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        });

        // Cuando envía un mensaje
        socket.on('sendMessage', async (data) => {
            const { sender_id, receiver_id, message, is_group, file_url, file_type } = data;
            
            if (!sender_id || (!receiver_id && !is_group)) return;

            try {
                // Guardar en la base de datos
                const [result] = await pool.query(
                    `INSERT INTO chat_messages (sender_id, receiver_id, is_group, message, file_url, file_type) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [sender_id, receiver_id || null, is_group ? 1 : 0, message, file_url || null, file_type || null]
                );

                const savedMessage = {
                    id: result.insertId,
                    sender_id,
                    receiver_id,
                    is_group,
                    message,
                    file_url,
                    file_type,
                    created_at: new Date()
                };

                // Emitir a quien corresponda
                if (is_group) {
                    io.emit('receiveMessage', savedMessage);
                } else {
                    // Enviar a todas las sesiones del destinatario
                    io.to(receiver_id.toString()).emit('receiveMessage', savedMessage);
                    
                    // Asegurar que también le llegue al emisor (a otras pestañas si tiene)
                    if (sender_id.toString() !== receiver_id.toString()) {
                        io.to(sender_id.toString()).emit('receiveMessage', savedMessage);
                    }
                }

            } catch (error) {
                console.error('❌ Error guardando mensaje en DB:', error);
            }
        });

        socket.on('disconnect', () => {
            if (socket.userId) {
                // Remove from onlineUsers if this was the last connection
                // For simplicity, we just delete it. In a multi-tab scenario, they go offline until next ping
                onlineUsers.delete(socket.userId);
                console.log(`🔴 Usuario desconectado: ${socket.userId}`);
                io.emit('onlineUsers', Array.from(onlineUsers.keys()));
            }
        });
    });
};
