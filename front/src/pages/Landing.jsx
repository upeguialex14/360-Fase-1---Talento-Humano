import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../IMG/LOGO_MULTIVAL-removebg-preview.png';
import xrayImg from '../IMG/imagen_x_ray.png';
import './Landing.css';

// Provisional images for workers
import w1 from '../IMG/banco_1.jpeg';
import w2 from '../IMG/banco_3.jpeg';
import w3 from '../IMG/banco_4.jpeg';
import w4 from '../IMG/banco_5.jpeg';
import w5 from '../IMG/Carrusel_1.jpeg';
import w6 from '../IMG/Carrusel_2.jpeg';

const lerp = (start, end, amount) => start + (end - start) * amount;

/**
 * Landing Page de Multival 360
 */
const Landing = () => {
  const navigate = useNavigate();
  const cursorRef = useRef(null);
  const pageRef = useRef(null);
  const xrayRef = useRef(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const workers = [
    { id: 1, name: 'Ana Maria', role: 'Directora RPO', image: w1, bio: 'Especialista en reclutamiento masivo y optimización de procesos de selección para grandes corporaciones.' },
    { id: 2, name: 'Carlos Ruiz', role: 'Analítica Senior', image: w2, bio: 'Transformando datos crudos en estrategias accionables para el crecimiento sostenible de nuestros aliados.' },
    { id: 3, name: 'Elena Gomez', role: 'Operaciones Globales', image: w3, bio: 'Gestión eficiente de recursos en entornos dinámicos, asegurando la calidad en cada fase operativa.' },
    { id: 4, name: 'Sofia Torres', role: 'Gestión de Datos', image: w4, bio: 'Arquitecta de sistemas de información enfocados en la integridad y seguridad de la data corporativa.' },
    { id: 5, name: 'Juan Perez', role: 'Líder Humano', image: w5, bio: 'Dedicado al desarrollo del potencial humano y la creación de culturas organizacionales de alto desempeño.' },
    { id: 6, name: 'Laura Diaz', role: 'Especialista en Costos', image: w6, bio: 'Control financiero riguroso y optimización de presupuestos para maximizar el ROI de cada proyecto.' },
  ];

  const pointer = useMemo(
    () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2, currentX: window.innerWidth / 2, currentY: window.innerHeight / 2 }),
    []
  );

  useEffect(() => {
    const onMouseMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    const animateCursor = () => {
      pointer.currentX = lerp(pointer.currentX, pointer.x, 0.16);
      pointer.currentY = lerp(pointer.currentY, pointer.y, 0.16);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pointer.currentX}px, ${pointer.currentY}px, 0)`;
      }
      requestAnimationFrame(animateCursor);
    };

    window.addEventListener('mousemove', onMouseMove);
    requestAnimationFrame(animateCursor);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [pointer]);

  useEffect(() => {
    const sections = document.querySelectorAll('.section-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.15 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = xrayRef.current;
    if (!container) return;

    const updateMask = (event) => {
      const rect = container.getBoundingClientRect();
      let clientX;
      let clientY;

      if (event.type.startsWith('touch')) {
        const touch = event.touches[0] || event.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      container.style.setProperty('--x', `${Math.min(100, Math.max(0, x))}%`);
      container.style.setProperty('--y', `${Math.min(100, Math.max(0, y))}%`);
    };

    container.addEventListener('mousemove', updateMask);
    container.addEventListener('touchmove', updateMask, { passive: false });
    container.addEventListener('mouseleave', () => {
      container.style.setProperty('--x', '-1000px');
      container.style.setProperty('--y', '-1000px');
    });

    return () => {
      container.removeEventListener('mousemove', updateMask);
      container.removeEventListener('touchmove', updateMask);
      container.removeEventListener('mouseleave', () => { });
    };
  }, []);

  const handleEnter = () => {
    if (pageRef.current) {
      setIsLeaving(true);
      pageRef.current.classList.add('leaving');
    }
    window.setTimeout(() => {
      navigate('/selection');
    }, 320);
  };

  return (
    <div className={`landing-page${isLeaving ? ' leaving' : ''}`} ref={pageRef}>
      <div className="custom-cursor" ref={cursorRef} />

      <section className="hero-section section-reveal active">
        <div className="hero-inner">
          <h1 className="hero-title">IMPULSANDO EL ÉXITO HUMANO</h1>
          <p className="hero-copy">Interfaz de alto desempeño para la experiencia Multival 360.</p>
          <button className="hero-button" onClick={handleEnter}>
            INGRESAR AL SISTEMA
          </button>
        </div>
        <span className="scroll-indicator">SCROLL ↓</span>
      </section>

      <section className="section-reveal xray-section">
        <div className="section-card">
          <div className="section-header">
            <span className="section-chip">CORE TECHNOLOGY</span>
            <h2>Descubrimientos del area</h2>
            <p>Descubre el núcleo de datos con una máscara dinámica y etiquetas flotantes.</p>
          </div>
          <div className="xray-container" ref={xrayRef}>
            {/* Capa Base */}
            <div className="xray-base" />
            
            {/* Capa Revelada con imagen_x_ray.png */}
            <div 
              className="xray-overlay" 
              style={{
                maskImage: `circle(150px at var(--x) var(--y))`,
                WebkitMaskImage: `circle(150px at var(--x) var(--y))`
              }}
            >
              <img src={xrayImg} alt="X-Ray View" className="xray-image-internal" />
            </div>

            <div className="xray-caption">NÚCLEO DIGITAL ACTIVADO</div>
            <div className="xray-label xray-label-left">Quantum Core</div>
            <div className="xray-label xray-label-right">Biometría Activa</div>
          </div>
        </div>
      </section>

      <section className="slogan-section section-reveal">
        <p className="slogan-text">
          "Conectamos personas, Potenciamos Talento, Transformamos Futuros."
        </p>
      </section>

      {/* MOTOR DE TALENTO HUMANO: Interactive Section */}
      <section className="engine-section section-reveal">
        <div className="motor-box">
          {/* Engranaje de fondo */}
          <div className="gear-bg">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </div>

          <h2 className="engine-title">MOTOR DE TALENTO HUMANO</h2>

          {/* Hilera de perfiles inicial */}
          <div className="profiles-row">
            {workers.map(worker => (
              <div
                key={worker.id}
                className="profile-circle"
                onClick={() => setSelectedWorker(worker)}
                title={worker.name}
              >
                <img src={worker.image} alt={worker.name} />
              </div>
            ))}
          </div>

          <p className="engine-dedication">Sin este grupo nada sería posible</p>

          {/* Panel de Detalle (Expandido) */}
          <div className={`detail-overlay ${selectedWorker ? 'active' : ''}`}>
            {selectedWorker && (
              <>
                <button className="close-audit" onClick={() => setSelectedWorker(null)}>
                  CERRAR AUDITORÍA
                </button>

                <div className="detail-image-container">
                  <img src={selectedWorker.image} alt={selectedWorker.name} />
                </div>

                <div className="detail-info">
                  <h2 className="detail-name">{selectedWorker.name}</h2>
                  <div className="detail-role">{selectedWorker.role}</div>
                  <div className="detail-separator" />
                  <p className="detail-bio">{selectedWorker.bio}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
