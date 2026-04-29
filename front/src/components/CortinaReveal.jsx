import React, { useEffect, useRef } from 'react';
import './CortinaReveal.css';
const CortinaReveal = () => {
    const containerRef = useRef(null);
    const cortinaRef = useRef(null);
    const [selectedValor, setSelectedValor] = React.useState(null);

    const valores = [
        {
            id: 1,
            titulo: 'Integridad',
            emoji: '🤝',
            descripcion: 'Actuamos con honestidad y transparencia en cada proceso de selección y gestión.',
            aporte: 'Asegura un ambiente de confianza y justicia para todos los colaboradores de Multival.'
        },
        {
            id: 2,
            titulo: 'Innovación',
            emoji: '💡',
            descripcion: 'Adoptamos nuevas tecnologías para optimizar la captación y desarrollo del talento.',
            aporte: 'Permite que el área de Talento Humano sea ágil y se adapte a los retos del mercado digital.'
        },
        {
            id: 3,
            titulo: 'Empatía',
            emoji: '❤️',
            descripcion: 'Priorizamos el bienestar humano, escuchando y entendiendo las necesidades de nuestro equipo.',
            aporte: 'Fomenta una cultura organizacional sólida donde cada persona se siente valorada y escuchada.'
        }
    ];

    useEffect(() => {
        const getScrollParent = (node) => {
            let current = node.parentElement;
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
            if (!containerRef.current || !cortinaRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const parentRect = scrollParent === window ? { top: 0, bottom: window.innerHeight } : scrollParent.getBoundingClientRect();
            const viewportHeight = scrollParent === window ? window.innerHeight : scrollParent.clientHeight;

            const scrollDistance = containerRef.current.offsetHeight - viewportHeight;

            if (rect.top <= parentRect.top && rect.bottom >= parentRect.bottom) {
                let progress = (parentRect.top - rect.top) / scrollDistance;
                progress = Math.max(0, Math.min(1, progress));
                cortinaRef.current.style.transform = `translateY(-${progress * 105}%)`;
            } else if (rect.top > parentRect.top) {
                cortinaRef.current.style.transform = `translateY(0%)`;
            } else if (rect.bottom < parentRect.bottom) {
                cortinaRef.current.style.transform = `translateY(-105%)`;
            }
        };

        const target = scrollParent === window ? window : scrollParent;
        target.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => target.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="cortina-scroll-container" ref={containerRef}>
            <div className="reveal-wrapper">
                <div className="reveal-content-layer">
                    <div className="reveal-text">
                        <h3>Valores Talento Humano</h3>
                        <p>Nuestra esencia y compromiso con el equipo</p>
                    </div>
                    
                    <div className="reveal-features">
                        {valores.map(valor => (
                            <div 
                                key={valor.id} 
                                className="reveal-feature-card interactive"
                                onClick={() => setSelectedValor(valor)}
                            >
                                <div className="feature-icon">{valor.emoji}</div>
                                <h4>{valor.titulo}</h4>
                                <span className="click-hint">Ver detalle</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal para detalles del valor */}
                {selectedValor && (
                    <div className="valor-modal-overlay" onClick={() => setSelectedValor(null)}>
                        <div className="valor-modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setSelectedValor(null)}>×</button>
                            <div className="modal-icon">{selectedValor.emoji}</div>
                            <h2>{selectedValor.titulo}</h2>
                            <div className="modal-body">
                                <div className="modal-section">
                                    <strong>¿Qué es?</strong>
                                    <p>{selectedValor.descripcion}</p>
                                </div>
                                <div className="modal-section">
                                    <strong>¿Cómo aporta al área?</strong>
                                    <p>{selectedValor.aporte}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
