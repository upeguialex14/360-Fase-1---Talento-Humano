import React, { useEffect, useRef } from 'react';
import './CortinaReveal.css';
import img1 from '../IMG/Carrusel_1.jpeg';
import img2 from '../IMG/Carrusel_2.jpeg';
import img3 from '../IMG/banco_5.jpeg';

const CortinaReveal = () => {
    const containerRef = useRef(null);
    const cortinaRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current || !cortinaRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // The total height of the scroll container minus the viewport defines how long it stays sticky
            const scrollDistance = containerRef.current.offsetHeight - viewportHeight;

            if (rect.top <= 0 && rect.bottom >= viewportHeight) {
                // We are scrolling inside the sticky area
                let progress = Math.abs(rect.top) / scrollDistance;
                // Clamp between 0 and 1
                progress = Math.max(0, Math.min(1, progress));
                // Move curtain Y up up to 105% entirely
                cortinaRef.current.style.transform = `translateY(-${progress * 105}%)`;
            } else if (rect.top > 0) {
                // Before reaching the sticky container
                cortinaRef.current.style.transform = `translateY(0%)`;
            } else if (rect.bottom < viewportHeight) {
                // Scrolled past the sticky container
                cortinaRef.current.style.transform = `translateY(-105%)`;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // initial trigger on mount

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="cortina-scroll-container" ref={containerRef}>
            <div className="reveal-wrapper">
                <div className="reveal-content-layer">
                    {/* Original content restored */}
                    <div className="reveal-gallery">
                        <img src={img1} alt="Exclusivo 1" className="reveal-inner-img" />
                        <img src={img3} alt="Exclusivo 2" className="reveal-inner-img" style={{ height: '100px' }} />
                        <img src={img2} alt="Exclusivo 3" className="reveal-inner-img" />
                    </div>
                    <div className="reveal-text">
                        <h3>Descubre Nuestra Plataforma</h3>
                        <p>Una experiencia de integración completa y profesional</p>
                    </div>
                </div>

                {/* The yellow curtain layer that slides up */}
                <div className="cortina-layer" ref={cortinaRef}>
                    <div className="cortina-body">
                        <h2 className="cortina-title">Explora Más</h2>
                    </div>
                    {/* CSS radial gradients create the transparent holes dynamically here */}
                    <div className="cortina-bottom-edge"></div>
                </div>
            </div>
        </div>
    );
};

export default CortinaReveal;
