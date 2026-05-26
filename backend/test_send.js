require('dotenv').config();
const { JWT } = require('google-auth-library');
const { chat } = require('@googleapis/chat');

async function testSend() {
    try {
        const privateKey = process.env.GOOGLE_CHAT_PRIVATE_KEY
            ? process.env.GOOGLE_CHAT_PRIVATE_KEY.replace(/\\n/g, '\n')
            : null;

        const userEmail = 'humano360@multipagas.com';
        const targetEmail = 'sirley.cardona@gmail.com'; // Target email seen in screenshot

        const auth = new JWT({
            email: process.env.GOOGLE_CHAT_CLIENT_EMAIL,
            key: privateKey,
            scopes: [
                'https://www.googleapis.com/auth/chat.messages.create',
                'https://www.googleapis.com/auth/chat.messages',
                'https://www.googleapis.com/auth/chat.spaces.create' // Maybe needed for setup?
            ],
            subject: userEmail,
        });

        const chatClient = chat({ version: 'v1', auth });

        console.log(`Intentando crear/obtener espacio DM de ${userEmail} a ${targetEmail}...`);
        
        const setupResponse = await chatClient.spaces.setup({
            requestBody: {
                space: { spaceType: 'DIRECT_MESSAGE' },
                memberships: [
                    {
                        member: {
                            name: `users/${targetEmail}`,
                            type: 'HUMAN'
                        }
                    }
                ]
            }
        });

        const spaceName = setupResponse.data.name;
        console.log(`Espacio DM obtenido: ${spaceName}. Enviando mensaje...`);

        const messageResponse = await chatClient.spaces.messages.create({
            parent: spaceName,
            requestBody: { text: 'Mensaje de prueba de integración' },
        });

        console.log('Mensaje enviado exitosamente:', messageResponse.data.name);

    } catch (error) {
        console.error('Error enviando DM:', error.message);
    }
}

testSend();
