import React, { useState, useEffect } from 'react';

const InteractiveBackground = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Normalize mouse position between -1 and 1
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, overflow: 'hidden', backgroundColor: '#05070d' }}>
            {/* 3 Orbes animados */}
            <div 
                className="animate-plasma-1"
                style={{
                    position: 'absolute',
                    width: '60vw',
                    height: '60vw',
                    borderRadius: '50%',
                    mixBlendMode: 'screen',
                    background: 'radial-gradient(circle, rgba(0,230,89,0.3) 0%, rgba(0,230,89,0) 70%)',
                    filter: 'blur(100px)',
                    top: '-10%',
                    left: '-10%',
                    transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`
                }}
            />
            <div 
                className="animate-plasma-2"
                style={{
                    position: 'absolute',
                    width: '50vw',
                    height: '50vw',
                    borderRadius: '50%',
                    mixBlendMode: 'screen',
                    background: 'radial-gradient(circle, rgba(255,205,4,0.2) 0%, rgba(255,205,4,0) 70%)',
                    filter: 'blur(100px)',
                    top: '40%',
                    right: '-20%',
                    transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`
                }}
            />
            <div 
                className="animate-plasma-3"
                style={{
                    position: 'absolute',
                    width: '70vw',
                    height: '70vw',
                    borderRadius: '50%',
                    mixBlendMode: 'screen',
                    background: 'radial-gradient(circle, rgba(36,42,84,0.5) 0%, rgba(36,42,84,0) 70%)',
                    filter: 'blur(100px)',
                    bottom: '-30%',
                    left: '20%',
                    transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)`
                }}
            />

            {/* Capa de Dithering/Pixelado */}
            <div 
                style={{
                    position: 'absolute',
                    top: 0, right: 0, bottom: 0, left: 0,
                    mixBlendMode: 'overlay',
                    pointerEvents: 'none',
                    opacity: 0.2,
                    backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                    backgroundSize: '2px 2px',
                    backgroundPosition: '0 0, 1px 1px'
                }}
            />

            {/* Capa CRT Scanlines */}
            <div 
                className="animate-scanlines"
                style={{
                    position: 'absolute',
                    top: 0, right: 0, bottom: 0, left: 0,
                    mixBlendMode: 'multiply',
                    pointerEvents: 'none',
                    opacity: 0.3,
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1))',
                    backgroundSize: '100% 4px'
                }}
            />
        </div>
    );
};

export default InteractiveBackground;
