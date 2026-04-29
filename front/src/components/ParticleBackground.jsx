import React from 'react';
import './ParticleBackground.css';

const ParticleBackground = () => {
    // Generate an array of 60 particles to animate for a much more dynamic effect
    const particles = Array.from({ length: 150 }, (_, i) => i);

    return (
        <div className="particle-bg">
            {particles.map((i) => {
                const size = Math.random() * 24 + 6; 
                const left = Math.random() * 100;
                const top = Math.random() * 100;
                const duration = Math.random() * 12 + 10;
                const delay = Math.random() * 10;
                const opacity = Math.random() * 0.25 + 0.05;

                return (
                    <span
                        key={i}
                        className="particle"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            left: `${left}%`,
                            top: `${top}%`,
                            animationDuration: `${duration}s`,
                            animationDelay: `${delay}s`,
                            opacity: opacity + 0.1,
                            backgroundColor: i % 2 === 0 ? '#FFCD04' : (i % 3 === 0 ? '#fbbf24' : '#1e1b4b')
                        }}
                    ></span>
                );
            })}
        </div>
    );
};

export default ParticleBackground;
