import React, { useEffect, useRef, useState } from 'react';
import './StackedCards.css';

const cards = [
    {
        title: 'Lanzamiento exclusivo',
        description: 'Descubre la nueva experiencia de Talento Humano con contenido dinámico.'
    },
    {
        title: 'Interacción fluida',
        description: 'Cada tarjeta se desliza con un efecto suave al avanzar en el scroll.'
    },
    {
        title: 'Contenido destacado',
        description: 'Mantén la atención en la tarjeta superior mientras el resto aparece en el fondo.'
    },
    {
        title: 'Diseño moderno',
        description: 'Fondo oscuro, bordes redondeados y sombras profundas para un mayor contraste.'
    }
];

const StackedCards = () => {
    const containerRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const getScrollParent = (node) => {
            let current = node?.parentElement;
            while (current && current !== document.body && current !== document.documentElement) {
                const style = window.getComputedStyle(current);
                if (/(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight) {
                    return current;
                }
                current = current.parentElement;
            }
            return window;
        };

        const scrollParent = getScrollParent(containerRef.current);

        const handleScroll = () => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const parentRect = scrollParent === window ? { top: 0, bottom: window.innerHeight } : scrollParent.getBoundingClientRect();
            const viewportHeight = scrollParent === window ? window.innerHeight : scrollParent.clientHeight;

            const scrollDistance = containerRef.current.offsetHeight - viewportHeight;

            if (rect.top <= parentRect.top) {
                let progress = (parentRect.top - rect.top) / scrollDistance;
                progress = Math.max(0, Math.min(1, progress));
                setScrollProgress(progress);
            } else {
                setScrollProgress(0);
            }
        };

        const target = scrollParent === window ? window : scrollParent;
        target.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => target.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className="stack-container" ref={containerRef}>
            <div className="stack-sticky">
                {cards.map((card, index) => {
                    const segment = 1 / cards.length;
                    const start = index * segment;
                    const end = start + segment;
                    
                    // Normalizamos el progreso para esta tarjeta específica
                    let localProgress = 0;
                    if (scrollProgress > start) {
                        localProgress = (scrollProgress - start) / segment;
                        localProgress = Math.max(0, Math.min(1, localProgress));
                    }

                    const isActive = scrollProgress > start;
                    const isGone = scrollProgress >= end;
                    const baseOffset = (cards.length - index - 1) * 10;

                    // Efecto de salida: se desliza hacia arriba y se desvanece
                    const transform = isActive
                        ? `translate(-50%, calc(-50% - ${100 * localProgress}vh)) rotate(-${2 * localProgress}deg) scale(${1 + 0.05 * localProgress})`
                        : `translate(-50%, calc(-50% + ${baseOffset}px)) scale(${0.96 + index * 0.01})`;

                    const opacity = isActive ? 1 - localProgress : 1;

                    return (
                        <article
                            key={card.title}
                            className="event-card"
                            style={{
                                zIndex: cards.length - index,
                                transform,
                                opacity,
                                pointerEvents: isGone ? 'none' : 'auto',
                                visibility: isGone && localProgress >= 1 ? 'hidden' : 'visible'
                            }}
                        >
                            <div className="event-card-content">
                                <span className="event-card-label">Tarjeta {index + 1}</span>
                                <h3>{card.title}</h3>
                                <p>{card.description}</p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default StackedCards;
