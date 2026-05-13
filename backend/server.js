require('dotenv').config();
const app = require('./app');
const dotacionCronJobs = require('./jobs/dotacionCron');

// Iniciar Jobs automáticos
dotacionCronJobs.startStockAlertJob();

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
});
