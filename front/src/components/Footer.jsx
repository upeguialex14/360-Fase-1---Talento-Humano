/**
 * Componente Footer de la aplicación
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <p>&copy; {currentYear} TalentoHumano360. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
