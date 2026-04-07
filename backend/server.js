require('dotenv').config();
const app = require('./app');
console.log("DB_NAME:", process.env.DB_NAME);
console.log("JWT_SECRET Loaded:", !!process.env.JWT_SECRET);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
});
