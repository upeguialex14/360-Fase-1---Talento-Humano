const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const roleMgmtRoutes = require('./routes/roleMgmt.routes');
const adminRoutes = require('./routes/admin.routes');
const ordenContratacionRoutes = require('./routes/etl/ordenContratacion.routes');
const masiveUploadRoutes = require('./routes/etl/masiveUploadExcel.routes');
const requisicionRoutes = require('./routes/requisicion.routes');


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/role-mgmt', roleMgmtRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orden-contratacion', ordenContratacionRoutes);
app.use('/api/etl', masiveUploadRoutes);
app.use('/api/requisiciones', requisicionRoutes);


// Manejo básico de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

module.exports = app;
