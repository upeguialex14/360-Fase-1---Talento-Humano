import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Plus, Filter, Download, ChevronRight, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import '../../styles/DotacionLiquidEther.css';

const solicitudesIniciales = [
  { id: 101, fecha: '2026-05-01', colaborador: 'Roberto Gómez', cedula: '102030', articulos: '2 Camisas M, 1 Pantalón 32', estado: 'Aprobado', total: 3 },
  { id: 102, fecha: '2026-05-05', colaborador: 'Lucía Fernández', cedula: '405060', articulos: '1 Camisa Blanca S', estado: 'Pendiente', total: 1 },
  { id: 103, fecha: '2026-05-08', colaborador: 'Marcos Ruiz', cedula: '708090', articulos: '3 Camisas L, 2 Pantalones 34', estado: 'Enviado', total: 5 },
];

export default function DotacionSolicitud() {
  const [solicitudes, setSolicitudes] = useState(() => {
    const saved = localStorage.getItem('multival_dotacion_solicitudes');
    return saved ? JSON.parse(saved) : solicitudesIniciales;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  useEffect(() => {
    localStorage.setItem('multival_dotacion_solicitudes', JSON.stringify(solicitudes));
  }, [solicitudes]);

  const filtered = solicitudes.filter(s => {
    const matchSearch = s.colaborador.toLowerCase().includes(searchTerm.toLowerCase()) || s.cedula.includes(searchTerm);
    const matchEstado = filtroEstado === 'Todos' || s.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const stats = {
    pendientes: solicitudes.filter(s => s.estado === 'Pendiente').length,
    aprobadas: solicitudes.filter(s => s.estado === 'Aprobado').length,
    enviadas: solicitudes.filter(s => s.estado === 'Enviado').length,
  };

  return (
    <div className="nexus-page-container nexus-scrollbar">
      <Toaster position="top-right" richColors />
      <div className="nexus-card">
        <header className="nexus-header">
            <div className="flex justify-between items-start">
                <div>
                    <h1>Solicitudes de Dotación</h1>
                    <p>Seguimiento de requerimientos de prendas por colaborador</p>
                </div>
                <Button className="nexus-btn nexus-btn-primary"><Plus className="h-5 w-5" /> Nueva Solicitud</Button>
            </div>
        </header>

        <div className="nexus-stats-grid">
            <div className="nexus-stat-card">
                <div className="nexus-stat-label flex items-center gap-2"><Clock className="h-4 w-4 text-orange-400" /> Pendientes</div>
                <div className="nexus-stat-value" style={{ color: '#fb923c' }}>{stats.pendientes}</div>
            </div>
            <div className="nexus-stat-card">
                <div className="nexus-stat-label flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Aprobadas</div>
                <div className="nexus-stat-value" style={{ color: '#4ade80' }}>{stats.aprobadas}</div>
            </div>
            <div className="nexus-stat-card">
                <div className="nexus-stat-label flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-blue-400" /> Enviadas</div>
                <div className="nexus-stat-value" style={{ color: '#60a5fa' }}>{stats.enviadas}</div>
            </div>
        </div>

        <div className="nexus-section">
            <div className="nexus-section-title">Gestión de Pedidos</div>
            <div className="nexus-grid">
                <div className="nexus-form-group">
                    <label>Búsqueda Rápida</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input placeholder="Nombre o cédula..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="nexus-input pl-10" />
                    </div>
                </div>
                <div className="nexus-form-group">
                    <label>Filtrar por Estado</label>
                    <select className="nexus-input" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                        <option value="Todos">Todos los estados</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Enviado">Enviado</option>
                    </select>
                </div>
                <div className="nexus-form-group flex items-end">
                    <Button variant="outline" className="nexus-btn nexus-btn-ghost w-full"><Download className="h-4 w-4 mr-2" /> Exportar PDF</Button>
                </div>
            </div>
        </div>

        <div className="nexus-table-container">
            <table className="nexus-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Colaborador</th>
                        <th>Artículos</th>
                        <th>Estado</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(s => (
                        <tr key={s.id}>
                            <td className="font-mono text-[10px] text-gray-500">#{s.id}</td>
                            <td className="text-xs">{s.fecha}</td>
                            <td>
                                <p className="font-bold text-white">{s.colaborador}</p>
                                <p className="text-[10px] text-gray-500 uppercase">CC: {s.cedula}</p>
                            </td>
                            <td className="text-sm italic text-gray-300">{s.articulos}</td>
                            <td>
                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                                    s.estado === 'Pendiente' ? 'bg-orange-500/10 text-orange-400' :
                                    s.estado === 'Aprobado' ? 'bg-green-500/10 text-green-400' :
                                    'bg-blue-500/10 text-blue-400'
                                }`}>
                                    {s.estado}
                                </span>
                            </td>
                            <td className="text-center">
                                <button className="nexus-btn nexus-btn-ghost !p-2 !h-8 hover:bg-[#FFCD04] hover:text-black transition-all">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
