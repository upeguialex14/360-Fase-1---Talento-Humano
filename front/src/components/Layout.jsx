import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

/**
 * Layout principal de la aplicación
 * Envuelve todas las páginas con Header y Footer
 */
const Layout = () => {
  return (
    <div className="app-layout">
      <Header />
      <div className="layout-body">
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
