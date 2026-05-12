require('dotenv').config();
const app = require('./app');
const dotacionJobs = require('./jobs/dotacionCron');

// Iniciar Jobs automáticos
dotacionJobs.startStockAlertJob();

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
});
