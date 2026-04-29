import React, { useState, useEffect, useRef } from 'react';
import './HomeCarousel.css';
import img1 from '../IMG/Carrusel_1.jpeg';
import img2 from '../IMG/Carrusel_2.jpeg';
import img3 from '../IMG/Carrusel_3.jpeg';

/**
 * HomeCarousel - reusable carousel component for the Home page.
 * Images rotate every 3 seconds, with manual previous/next controls.
 * Added fade‑in animation for smooth transitions.
 */
const HomeCarousel = () => {
    const images = [img1, img2, img3];
    const [current, setCurrent] = useState(0);
    const [fade, setFade] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCollapsing, setIsCollapsing] = useState(false);
    const [hoverOpen, setHoverOpen] = useState(false);
    const intervalRef = useRef(null);
    const collapseTimerRef = useRef(null);
    const hoverTimerRef = useRef(null);

    const clearTimers = () => {
        if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };

    const collapseIsland = () => {
        setIsCollapsing(true);
        setHoverOpen(false);
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setTimeout(() => {
            setIsCollapsed(true);
            setIsCollapsing(false);
        }, 600);
    };

    const scheduleCollapse = (delay = 5000) => {
        clearTimers();
        collapseTimerRef.current = setTimeout(collapseIsland, delay);
    };

    const handleIslandMouseEnter = () => {
        if (!isCollapsed) return;
        if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setHoverOpen(true);
        hoverTimerRef.current = setTimeout(() => {
            setHoverOpen(false);
            scheduleCollapse(5000);
        }, 5000);
    };

    const handleIslandMouseLeave = () => {
        if (!isCollapsed) return;
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = setTimeout(() => {
            setHoverOpen(false);
            scheduleCollapse(5000);
        }, 5000);
    };

    // Advance to next image, wrapping around
    const next = () => {
        setCurrent(prev => (prev + 1) % images.length);
    };

    // Go to previous image, wrapping around
    const prev = () => {
        setCurrent(prev => (prev - 1 + images.length) % images.length);
    };

    // Trigger fade animation on image change
    useEffect(() => {
        setFade(true);
        const timer = setTimeout(() => setFade(false), 500); // match CSS animation duration
        return () => clearTimeout(timer);
    }, [current]);

    // Set up automatic rotation
    useEffect(() => {
        scheduleCollapse(5000);
        intervalRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % images.length);
        }, 6000); // changed interval to 6 seconds
        return () => {
            clearInterval(intervalRef.current);
            clearTimers();
        };
    }, []);

    return (
        <div className="carousel-container">
            <div
                className={`carousel-top-island ${isCollapsed ? 'collapsed' : ''} ${hoverOpen ? 'hover-open' : ''} ${isCollapsing ? 'collapsing' : ''}`}
                onMouseEnter={handleIslandMouseEnter}
                onMouseLeave={handleIslandMouseLeave}
            >
                <span className="carousel-top-island-text">Noticias Multival</span>
            </div>
            <div className="carousel-image-wrapper">
                <img
                    src={images[current]}
                    alt={`Carrusel ${current + 1}`}
                    className={`carousel-image ${fade ? 'fade' : ''}`}
                />
            </div>
            <button className="carousel-button prev" onClick={prev} aria-label="Anterior">
                ◀
            </button>
            <button className="carousel-button next" onClick={next} aria-label="Siguiente">
                ▶
            </button>
        </div>
    );
};

export default HomeCarousel;
