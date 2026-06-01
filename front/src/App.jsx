import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageProtectedRoute from './components/PageProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Empleados from './pages/Empleados';
import Departamentos from './pages/Departamentos';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Roles from './pages/Roles';
import Planta from './pages/Planta';
import Costos from './pages/Costos';
import Usuarios from './pages/Usuarios';
import Dashboard from './pages/Dashboard';
import RolePageAccess from './pages/RolePageAccess';
import AdminBlockedUsers from './pages/AdminBlockedUsers';
import OrdenContratacion from './pages/OrdenContratacion';
import SolicitudVacantes from './pages/SolicitudVacantes';
import GestionRequisiciones from './pages/GestionRequisiciones';
import Documentacion from './pages/Documentacion';
import GestionDocumentacion from './pages/GestionDocumentacion';
import BaseInactiva from './pages/BaseInactiva';
// import BaseUnificada from './pages/BaseUnificada';
// import Vacaciones from './pages/Vacaciones';
import Selection from './pages/Selection';
import Upcoming from './pages/Upcoming';
import BaseDatos from './pages/BaseDatos';
import UsuarioSahg from './pages/UsuarioSahg';
import CreacionUsuarioPlanta from './pages/CreacionUsuarioPlanta';
import DotacionDashboard from './pages/DotacionDashboard';
import PublicSignature from './pages/PublicSignature';
// Dotación routes
import DotacionSolicitud from './pages/dotacion/DotacionSolicitud';
import DotacionReasignacion from './pages/dotacion/DotacionReasignacion';
import DotacionStock from './pages/dotacion/DotacionStock';
import DotacionTallas from './pages/dotacion/DotacionTallas';
import DotacionFirma from './pages/dotacion/DotacionFirma';
import AprobacionAccesos from './pages/AprobacionAccesos';


/**
 * Componente principal de la aplicación
 * Configura las rutas, autenticación y el layout general
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Landing page pública */}
          <Route path="/" element={<Landing />} />

          {/* Ruta pública para firma de dotación (Empleado) */}
          <Route path="/firma-dotacion/:token" element={<PublicSignature />} />
          <Route path="/sign/:token" element={<PublicSignature />} />

          {/* Página de selección de perfil */}
          <Route path="/selection" element={<Selection />} />

          {/* Página de próximamente */}
          <Route path="/upcoming" element={<Upcoming />} />

          {/* Ruta de login (sin layout) */}
          <Route path="/login" element={<Login />} />

          {/* Ruta de cambio de contraseña (sin layout) */}
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Rutas protegidas con layout */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<PageProtectedRoute requiredPageCode="DASHBOARD"><Dashboard /></PageProtectedRoute>} />
            <Route path="empleados" element={<PageProtectedRoute requiredPageCode="EMPLEADOS"><Empleados /></PageProtectedRoute>} />
            <Route path="departamentos" element={<PageProtectedRoute requiredPageCode="DEPARTAMENTOS"><Departamentos /></PageProtectedRoute>} />
            <Route path="roles" element={<PageProtectedRoute requiredPageCode="ROLES"><Roles /></PageProtectedRoute>} />
            <Route path="planta" element={<PageProtectedRoute requiredPageCode="PLANTA"><Planta /></PageProtectedRoute>} />
            <Route path="costos" element={<PageProtectedRoute requiredPageCode="COSTOS"><Costos /></PageProtectedRoute>} />
            <Route path="users" element={<PageProtectedRoute requiredPageCode="USUARIOS"><Usuarios /></PageProtectedRoute>} />
            <Route path="contratacion" element={<PageProtectedRoute requiredPageCode="ORDEN_CONTRATACION"><OrdenContratacion /></PageProtectedRoute>} />
            <Route path="solicitud-vacantes" element={<PageProtectedRoute requiredPageCode="SOLICITUD_VACANTES" isOptional={true}><SolicitudVacantes /></PageProtectedRoute>} />
            <Route path="gestion-requisiciones" element={<PageProtectedRoute requiredPageCode="GESTION_REQUISICIONES" isOptional={true}><GestionRequisiciones /></PageProtectedRoute>} />
            <Route path="documentacion" element={<PageProtectedRoute requiredPageCode="DOCUMENTACION" isOptional={true}><Documentacion /></PageProtectedRoute>} />
            <Route path="gestion-documentacion" element={<PageProtectedRoute requiredPageCode="GESTION_DOCUMENTACION" isOptional={true}><GestionDocumentacion /></PageProtectedRoute>} />
            {/* <Route path="vacaciones" element={<PageProtectedRoute requiredPageCode="VACACIONES" isOptional={true}><Vacaciones /></PageProtectedRoute>} /> */}
            <Route path="base-inactiva" element={<PageProtectedRoute requiredPageCode="BASE_INACTIVA" isOptional={true}><BaseInactiva /></PageProtectedRoute>} />
            {/* <Route path="base-unificada" element={<PageProtectedRoute requiredPageCode="BASE_UNIFICADA" isOptional={true}><BaseUnificada /></PageProtectedRoute>} /> */}
            <Route path="role-page-access" element={<PageProtectedRoute requiredPageCode="ROLE_PAGE_ACCESS" isOptional={true}><RolePageAccess /></PageProtectedRoute>} />
            <Route path="admin/blocked-users" element={<PageProtectedRoute requiredPageCode="BLOCKED_USERS" isOptional={true}><AdminBlockedUsers /></PageProtectedRoute>} />
            <Route path="base-datos" element={<PageProtectedRoute requiredPageCode="BASE_DATOS" isOptional={true}><BaseDatos /></PageProtectedRoute>} />
            <Route path="usuario-sahg" element={<PageProtectedRoute requiredPageCode="USUARIO_SAHG" isOptional={true}><UsuarioSahg /></PageProtectedRoute>} />
            <Route path="creacion-usuario-planta" element={<PageProtectedRoute requiredPageCode="CREACION_USUARIO_PLANTA" isOptional={true}><CreacionUsuarioPlanta /></PageProtectedRoute>} />
            <Route path="dotacion" element={<PageProtectedRoute requiredPageCode="DOTACION" isOptional={true}><DotacionDashboard /></PageProtectedRoute>} />
            <Route path="dotacion/solicitud" element={<PageProtectedRoute requiredPageCode="DOTACION_SOLICITUD" isOptional={true}><DotacionSolicitud /></PageProtectedRoute>} />
            <Route path="dotacion/reasignacion" element={<PageProtectedRoute requiredPageCode="DOTACION_REASIGNACION" isOptional={true}><DotacionReasignacion /></PageProtectedRoute>} />
            <Route path="dotacion/stock" element={<PageProtectedRoute requiredPageCode="DOTACION_STOCK" isOptional={true}><DotacionStock /></PageProtectedRoute>} />
            <Route path="dotacion/tallas" element={<PageProtectedRoute requiredPageCode="DOTACION_TALLAS" isOptional={true}><DotacionTallas /></PageProtectedRoute>} />
            <Route path="dotacion/firma" element={<PageProtectedRoute requiredPageCode="DOTACION_FIRMA" isOptional={true}><DotacionFirma /></PageProtectedRoute>} />
            <Route path="aprobacion-accesos" element={<PageProtectedRoute requiredPageCode="APROBACION_ACCESOS" isOptional={true}><AprobacionAccesos /></PageProtectedRoute>} />
          </Route>


          {/* Redirigir cualquier ruta no encontrada a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
