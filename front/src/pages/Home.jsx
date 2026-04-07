import React from 'react';
import HomeCarousel from '../components/HomeCarousel';
import HomeImageGrid from '../components/HomeImageGrid';
import ParticleBackground from '../components/ParticleBackground';
import BancosAsociados from '../components/BancosAsociados';
import CortinaReveal from '../components/CortinaReveal';
import EmpresaInfoBanner from '../components/EmpresaInfoBanner';
import EquipoBanner from '../components/EquipoBanner';
import './Home.css';

/**
 * Página de inicio
 */
const Home = () => {
    return (
        <div className="page home-page home-container">
            <ParticleBackground />
            <h1>Bienvenido a TalentoHumano360</h1>
            <p>Sistema de gestión de recursos humanos</p>
            <HomeCarousel />
            <h2 className="news-title">Noticias Multival</h2>
            <HomeImageGrid />
            <BancosAsociados />
            <CortinaReveal />
            <EmpresaInfoBanner />
            <EquipoBanner />
        </div>
    );
};

export default Home;
