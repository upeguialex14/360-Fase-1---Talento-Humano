import React from 'react';
import { useNavigate } from 'react-router-dom';

const Upcoming = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0b0f1a',
            color: 'white',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: 'rgba(255, 205, 4, 0.1)',
                padding: '4rem',
                borderRadius: '3rem',
                border: '1px solid rgba(255, 205, 4, 0.2)',
                maxWidth: '600px'
            }}>
                <h1 style={{ color: '#FFCD04', fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 900 }}>Software en proceso</h1>
                <p style={{ fontSize: '1.5rem', opacity: 0.8, marginBottom: '2rem' }}>
                    PROXIMAMENTE en la fase 2
                </p>
                <button 
                    onClick={() => navigate('/selection')}
                    style={{
                        padding: '1rem 2rem',
                        background: '#FFCD04',
                        border: 'none',
                        borderRadius: '999px',
                        color: '#0b0f1a',
                        fontWeight: 800,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}
                >
                    Volver a Selección
                </button>
            </div>
        </div>
    );
};

export default Upcoming;
