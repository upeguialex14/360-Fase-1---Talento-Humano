import { Link } from 'react-router-dom';
import logoTH from '../IMG/LOGO_TH__2.png';

/**
 * Componente Header de la aplicación
 * Solo muestra el logo centrado con link al landing page.
 * El logout fue movido al Sidebar.
 */
const Header = () => {
    return (
        <header className="header hologram-panel" style={{ backgroundColor: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="header-container" style={{ justifyContent: 'center' }}>
                <Link to="/" className="logo header-logo-link">
                    <img src={logoTH} alt="Talento Humano 360" className="header-logo-image" style={{ height: '80px', width: 'auto' }} />
                    <h1 className="header-brand-title">TalentoHumano360</h1>
                </Link>
            </div>
        </header>
    );
};

export default Header;
