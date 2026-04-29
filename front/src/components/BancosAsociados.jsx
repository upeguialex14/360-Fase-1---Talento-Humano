import React from 'react';
import './BancosAsociados.css';
import banco1 from '../IMG/banco_1.jpeg';
import banco2 from '../IMG/Banco_2.jpeg';
import banco3 from '../IMG/banco_3.jpeg';
import banco4 from '../IMG/banco_4.jpeg';
import banco5 from '../IMG/banco_5.jpeg';
import banco6 from '../IMG/banco_6.jpeg';
import banco7 from '../IMG/banco_7.jpeg';
import banco8 from '../IMG/banco_8.jpeg';

const BancosAsociados = ({ showTitle = true }) => {
    // Array with all 8 bank logos
    const banks = [banco1, banco2, banco3, banco4, banco5, banco6, banco7, banco8];

    return (
        <div className="bancos-section">
            {showTitle && <h2 className="bancos-title">Bancos Asociados</h2>}
            <div className="ticker-wrapper">
                <div className="ticker-track">
                    {/* Duplicate the array 4 times to create a seamless infinite scroll effect on wide screens */}
                    {[...banks, ...banks, ...banks, ...banks].map((img, i) => (
                        <img key={i} src={img} alt={`Banco Asociado ${i}`} className="banco-logo" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BancosAsociados;
