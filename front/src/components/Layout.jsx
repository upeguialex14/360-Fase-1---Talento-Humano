import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import InteractiveBackground from './InteractiveBackground';

/**
 * Layout principal de la aplicación
 * Envuelve todas las páginas con Header y Footer
 */
const Layout = () => {
  return (
    <div className="app-layout font-body custom-scrollbar" style={{ position: 'relative' }}>
      <InteractiveBackground />
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        <Header />
        <div className="layout-body" style={{ position: 'relative', zIndex: 10 }}>
        <div className="sidebar-container" style={{ backgroundColor: 'transparent' }}>
          <Sidebar />
        </div>
        <main className="main-content" style={{ backgroundColor: 'transparent', flex: 1, zIndex: 10 }}>
          <Outlet />
        </main>
      </div>
      <Footer />
      </div>
    </div>
  );
};

export default Layout;
