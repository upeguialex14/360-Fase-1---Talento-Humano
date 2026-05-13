import React, { useEffect, useState } from 'react';
import useDotacion from '../hooks/useDotacion';
import dotacionService from '../services/dotacionService';
import { 
    Download, RefreshCcw, Plus, Package, CheckCircle2, 
    AlertCircle, Calendar, ChevronRight, TrendingUp 
} from 'lucide-react';
import '../styles/DotacionLiquidEther.css';

const DotacionDashboard = () => {
    const { loading, error } = useDotacion();
    const [stats, setStats] = useState(null);
    const [lowStock, setLowStock] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);
    const [activeTab, setActiveTab] = useState('inventory');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const year = new Date().getFullYear();
            const [statsRes, lowStockRes, invRes] = await Promise.all([
                dotacionService.getDashboardStats(year, 1),
                dotacionService.getLowStock(),
                dotacionService.getInventory()
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (lowStockRes.success) setLowStock(lowStockRes.data || []);
            if (invRes.success) setInventory(invRes.data || []);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        }
    };

    const handleUploadInventory = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await dotacionService.uploadInventoryExcel(formData);
            if (response.success) {
                loadData();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading && !stats) return <div className="nexus-page-container"><div className="nexus-card">Cargando dashboard premium...</div></div>;

    return (
        <div className="nexus-page-container nexus-scrollbar">
            <div className="nexus-card">
                <header className="nexus-header">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1>Dashboard de Dotación</h1>
                            <p>Control centralizado de inventario y elegibilidad • <span className="text-[#FFCD04] font-bold">{stats?.eligibility?.period?.name || 'Periodo Actual'} {stats?.eligibility?.period?.year}</span></p>
                        </div>
                        <div className="flex gap-3">
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUploadInventory} accept=".xlsx,.xls" />
                            <button className="nexus-btn nexus-btn-ghost" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                                <Download className="h-4 w-4" /> {uploading ? 'Subiendo...' : 'Importar'}
                            </button>
                            <button className="nexus-btn nexus-btn-ghost" onClick={loadData}><RefreshCcw className="h-4 w-4" /></button>
                            <button className="nexus-btn nexus-btn-primary"><Plus className="h-5 w-5" /> Nuevo Plan</button>
                        </div>
                    </div>
                </header>

                {/* Estadísticas Principales */}
                <div className="nexus-stats-grid">
                    <div className="nexus-stat-card">
                        <div className="nexus-stat-label flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#FFCD04]" /> Elegibles</div>
                        <div className="nexus-stat-value">{stats?.eligibility?.total_eligible || 0}</div>
                        <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#FFCD04]" style={{ width: '65%' }}></div>
                        </div>
                    </div>
                    <div className="nexus-stat-card">
                        <div className="nexus-stat-label flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Firmados</div>
                        <div className="nexus-stat-value" style={{ color: '#4ade80' }}>
                            {stats?.eligibility?.total_eligible - (stats?.eligibility?.total_pending_signature || 0)}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 uppercase font-black">Proceso completado</p>
                    </div>
                    <div className="nexus-stat-card">
                        <div className="nexus-stat-label flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-400" /> Alertas</div>
                        <div className="nexus-stat-value" style={{ color: '#f87171' }}>{lowStock.length}</div>
                        <p className="text-[10px] text-red-400/60 mt-2 uppercase font-black">Criticidad: Alta</p>
                    </div>
                    <div className="nexus-stat-card">
                        <div className="nexus-stat-label flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-400" /> Próximo</div>
                        <div className="nexus-stat-value" style={{ fontSize: '1.8rem', paddingTop: '1rem' }}>
                            {stats?.eligibility?.next_period?.name || 'Abril 2026'}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 uppercase font-black">Proyección anual</p>
                    </div>
                </div>

                {/* Selector de Vistas (Tabs) */}
                <div className="flex gap-8 mb-8 border-b border-white/5">
                    <button onClick={() => setActiveTab('inventory')} className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'text-[#FFCD04] border-b-2 border-[#FFCD04]' : 'text-gray-500 hover:text-gray-300'}`}>
                        📦 Inventario
                    </button>
                    <button onClick={() => setActiveTab('eligible')} className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'eligible' ? 'text-[#FFCD04] border-b-2 border-[#FFCD04]' : 'text-gray-500 hover:text-gray-300'}`}>
                        👤 Elegibles ({stats?.eligibility?.total_eligible || 0})
                    </button>
                </div>

                {activeTab === 'inventory' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="nexus-section-title">Stock por Referencia</div>
                            <div className="nexus-table-container">
                                <table className="nexus-table">
                                    <thead>
                                        <tr>
                                            <th>Prenda</th>
                                            <th>Talla</th>
                                            <th>Disponible</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventory.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-20 text-gray-500">No hay datos. Importe un archivo Excel.</td></tr>
                                        ) : (
                                            inventory.slice(0, 8).map((item, index) => {
                                                const isLow = item.quantity_available <= (item.min_stock_alert || 5);
                                                return (
                                                    <tr key={index}>
                                                        <td className="font-bold">{item.item_name}</td>
                                                        <td><span className="bg-white/5 px-2 py-1 rounded text-[10px] font-black">{item.size}</span></td>
                                                        <td className="font-mono">{item.quantity_available}</td>
                                                        <td>
                                                            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${isLow ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                                                {isLow ? 'Reabastecer' : 'Normal'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="nexus-section-title">Alertas Críticas</div>
                            <div className="space-y-4">
                                {lowStock.map((alert, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center hover:border-red-500/30 transition-all">
                                        <div>
                                            <h4 className="text-sm font-black text-gray-200">{alert.item_name}</h4>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Talla: {alert.size} • Stock: <span className="text-red-400">{alert.quantity_available}</span></p>
                                        </div>
                                        <button className="h-8 w-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#FFCD04] hover:text-black transition-all">
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="nexus-section">
                        <div className="nexus-section-title">Personal Calificado</div>
                        <div className="nexus-table-container">
                            <table className="nexus-table">
                                <thead>
                                    <tr>
                                        <th>Empleado</th>
                                        <th>Cédula</th>
                                        <th>Unidad</th>
                                        <th>Tallas</th>
                                        <th>Estado</th>
                                        <th className="text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.eligibility?.people_list?.map((person, idx) => (
                                        <tr key={idx}>
                                            <td className="font-bold text-sm">{person.nombre_completo}</td>
                                            <td className="font-mono text-xs text-gray-400">{person.cedula}</td>
                                            <td className="text-xs uppercase">{person.unidad}</td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <span className="text-[9px] bg-white/5 p-1 rounded">C: {person.talla_camisa || '-'}</span>
                                                    <span className="text-[9px] bg-white/5 p-1 rounded">P: {person.talla_pantalon || '-'}</span>
                                                </div>
                                            </td>
                                            <td><span className="bg-green-500/10 text-green-400 text-[9px] font-black px-2 py-0.5 rounded">ELEGIBLE</span></td>
                                            <td className="text-center">
                                                <button className="nexus-btn nexus-btn-ghost !p-2 !rounded-lg"><ChevronRight className="h-4 w-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DotacionDashboard;
