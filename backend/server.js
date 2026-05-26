require('dotenv').config();
const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const dotacionCronJobs = require('./jobs/dotacionCron');

// Iniciar Jobs automáticos
dotacionCronJobs.startStockAlertJob();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Cargar manejador de sockets
require('./sockets/chat.socket').init(io);

server.listen(PORT, () => {
    console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
});
