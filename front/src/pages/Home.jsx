import React from 'react';
import HomeCarousel from '../components/HomeCarousel';
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
            <div className="home-padded-section">
                <HomeCarousel />
            </div>
            
            {/* BancosAsociados now reaches sidebar and edges since it's outside padded section */}
            <BancosAsociados />
            
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
