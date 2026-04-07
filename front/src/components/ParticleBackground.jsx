import React from 'react';
import './ParticleBackground.css';

const ParticleBackground = () => {
    // Generate an array of 60 particles to animate for a much more dynamic effect
    const particles = Array.from({ length: 60 }, (_, i) => i);

    return (
        <div className="particle-bg">
            {particles.map((i) => {
                // Randomize positions, animation durations, and sizes directly in inline styles
                // to make them look organic without heavy JS logic
                const size = Math.random() * 20 + 8; // 8px to 28px
                const left = Math.random() * 100; // 0% to 100%
                const top = Math.random() * 100; // 0% to 100%
                const duration = Math.random() * 8 + 8; // 8s to 16s (faster)
                const delay = Math.random() * 5; // 0s to 5s

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
                            animationDelay: `${delay}s`
                        }}
                    ></span>
                );
            })}
        </div>
    );
};

export default ParticleBackground;
