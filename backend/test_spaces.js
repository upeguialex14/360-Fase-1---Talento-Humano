require('dotenv').config();
const { JWT } = require('google-auth-library');
const { chat } = require('@googleapis/chat');

async function testSpaces() {
    try {
        const privateKey = process.env.GOOGLE_CHAT_PRIVATE_KEY
            ? process.env.GOOGLE_CHAT_PRIVATE_KEY.replace(/\\n/g, '\n')
            : null;

        // Suplantar a un usuario del dominio para listar sus espacios
        const userEmail = 'humano360@multipagas.com'; // Puedes cambiarlo si sabes de otro correo

        const auth = new JWT({
            email: process.env.GOOGLE_CHAT_CLIENT_EMAIL,
            key: privateKey,
            scopes: [
                'https://www.googleapis.com/auth/chat.spaces.readonly',
                'https://www.googleapis.com/auth/chat.messages.readonly'
            ],
            subject: userEmail,
        });

        const chatClient = chat({ version: 'v1', auth });

        console.log(`Buscando espacios para ${userEmail}...`);
        const res = await chatClient.spaces.list({
            // filter: 'spaceType = "DIRECT_MESSAGE"'
        });

        console.log('Espacios encontrados:', JSON.stringify(res.data, null, 2));

        if (res.data.spaces && res.data.spaces.length > 0) {
            const firstSpace = res.data.spaces[0].name;
            console.log(`\nBuscando miembros del primer espacio (${firstSpace})...`);
            const members = await chatClient.spaces.members.list({
                parent: firstSpace
            });
            console.log('Miembros:', JSON.stringify(members.data, null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testSpaces();
