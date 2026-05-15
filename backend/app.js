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
const plantaOperacionRoutes = require('./routes/plantaOperacion.routes');
const dotacionRoutes = require('./routes/dotacion/dotacion.routes');
const solicitudVacanteRoutes = require('./routes/solicitudVacante.routes');
const documentacionRoutes = require('./routes/documentacion.routes');
const mainDashboardRoutes = require('./routes/mainDashboard.routes');
const path = require('path');


const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/role-mgmt', roleMgmtRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orden-contratacion', ordenContratacionRoutes);
app.use('/api/etl', masiveUploadRoutes);
app.use('/api/requisiciones', requisicionRoutes);
app.use('/api/planta-operacion', plantaOperacionRoutes);
app.use('/api/dotacion', dotacionRoutes);
app.use('/api/solicitud-vacantes', solicitudVacanteRoutes);
app.use('/api/documentacion', documentacionRoutes);
app.use('/api/main-dashboard', mainDashboardRoutes);


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
