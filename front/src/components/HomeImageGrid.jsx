import React, { useEffect, useRef } from 'react';
import './HomeImageGrid.css';

// Using existing images temporarily since 'imagen_1' etc. were not found in the IMG folder
import img1 from '../IMG/Carrusel_1.jpeg';
import img2 from '../IMG/Carrusel_2.jpeg';
import img3 from '../IMG/Carrusel_3.jpeg';
// Reusing img1 for the fourth image until the actual one is provided
import img4 from '../IMG/Carrusel_1.jpeg';

const HomeImageGrid = () => {
    const gridRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        // Stop observing once animated
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 } // Trigger when 10% visible
        );

        if (gridRef.current) {
            observer.observe(gridRef.current);
        }

        return () => {
            if (gridRef.current) {
                observer.unobserve(gridRef.current);
            }
        };
    }, []);

    return (
        <div className="home-image-grid-container" ref={gridRef}>
            <div className="image-grid">
                <img src={img1} alt="Grid 1" className="grid-image" />
                <img src={img2} alt="Grid 2" className="grid-image" />
                <img src={img3} alt="Grid 3" className="grid-image" />
                <img src={img4} alt="Grid 4" className="grid-image" />
            </div>
        </div>
    );
};

export default HomeImageGrid;
