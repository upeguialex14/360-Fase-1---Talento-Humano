import React from 'react';
import principalInicio from '../IMG/principal_inicio.jpeg';
import HomeHero from '../components/HomeHero';
import ParticleBackground from '../components/ParticleBackground';
import BancosAsociados from '../components/BancosAsociados';
import CortinaReveal from '../components/CortinaReveal';
import StackedCards from '../components/StackedCards';

import './Home.css';

/**
 * Página de inicio
 */
const Home = () => {
    return (
        <div className="page home-page home-container">
            <ParticleBackground />
            
            <HomeHero />

            {/* BancosAsociados now reaches sidebar and edges since it's outside padded section */}
            <BancosAsociados showTitle={false} />
            
            <div className="home-padded-section">
                <CortinaReveal />
            </div>
            
            <BancosAsociados showTitle={false} />
            
            <div className="home-padded-section">
                <StackedCards />

            </div>
        </div>
    );
};

export default Home;
