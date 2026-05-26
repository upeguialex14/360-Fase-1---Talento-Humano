require('dotenv').config();
const { sendMessage } = require('./services/googleChat.service');

async function testBotSend() {
    try {
        const userEmail = 'test@multipagas.com';
        // Reemplaza esto con un Space ID válido donde el Bot esté invitado
        // Si no tienes uno, esto fallará con un error 400/403/404, pero al menos sabremos
        // si la autenticación básica de Bot funciona.
        const spaceId = 'spaces/AAAAA123456'; 
        
        console.log(`Intentando enviar mensaje a ${spaceId} como Bot...`);
        const result = await sendMessage(userEmail, spaceId, 'Este es un mensaje de prueba desde el Bot Autónomo');
        console.log('Mensaje enviado exitosamente:', result);
    } catch (error) {
        console.error('Resultado esperado si el Space ID es inválido. Error:', error.message);
    }
}

testBotSend();
