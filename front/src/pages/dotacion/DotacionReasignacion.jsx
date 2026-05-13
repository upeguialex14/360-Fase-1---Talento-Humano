import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, RotateCcw, UserMinus, UserPlus, Info, CheckCircle2, AlertCircle, PackageCheck } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import '../../styles/DotacionLiquidEther.css';

const reasignacionesIniciales = [
  { id: 1, nombresApellidos: 'Pedro Infante', cedula: '123456', cargo: 'Operario', empresa: 'MULTIVALORES', fechaEntrega: '2026-04-15', cantidadCamisas: 3, cantidadPantalones: 3, cantidadCamisasBlancasMangaLarga: 0, estado: 'Activo' },
  { id: 2, nombresApellidos: 'Juan Gabriel', cedula: '654321', cargo: 'Supervisor', empresa: 'MULTIVALORES', fechaEntrega: '2026-03-20', cantidadCamisas: 2, cantidadPantalones: 2, cantidadCamisasBlancasMangaLarga: 1, estado: 'Inactivo' },
];

export default function DotacionReasignacion() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('multival_dotacion_reasignacion');
    return saved ? JSON.parse(saved) : reasignacionesIniciales;
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('multival_dotacion_reasignacion', JSON.stringify(data));
  }, [data]);

  const stats = {
    totalActivos: data.filter(d => d.estado === 'Activo').length,
    prendasEnUso: data.reduce((acc, d) => acc + d.cantidadCamisas + d.cantidadPantalones + d.cantidadCamisasBlancasMangaLarga, 0),
    pendientesRetorno: data.filter(d => d.estado === 'Inactivo').length,
  };

  const filtered = data.filter(d => 
    d.nombresApellidos.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.cedula.includes(searchTerm)
  );

  return (
    <div className="nexus-page-container nexus-scrollbar">
      <Toaster position="top-right" richColors />
      <div className="nexus-card">
        <header className="nexus-header">
            <div className="flex justify-between items-start">
                <div>
                    <h1>Reasignación de Dotación</h1>
                    <p>Gestión de retornos de prendas y reasignación a stock para personal nuevo o activo</p>
                </div>
                <Button variant="outline" className="nexus-btn nexus-btn-ghost"><RotateCcw className="h-4 w-4 mr-2" /> Limpiar Todo</Button>
            </div>
        </header>

        <div className="nexus-stats-grid">
            <div className="nexus-stat-card">
                <div className="nexus-stat-label flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Personal Activo</div>
                <div className="nexus-stat-value">{stats.totalActivos}</div>
            </div>
            <div className="nexus-stat-card">
                <div className="nexus-stat-label flex items-center gap-2"><PackageCheck className="h-4 w-4 text-[#FFCD04]" /> Prendas en Uso</div>
                <div className="nexus-stat-value">{stats.prendasEnUso}</div>
            </div>
            <div className="nexus-stat-card">
                <div className="nexus-stat-label flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-400" /> Pendientes Retorno</div>
                <div className="nexus-stat-value" style={{ color: '#f87171' }}>{stats.pendientesRetorno}</div>
            </div>
        </div>

        <div className="nexus-section">
            <div className="nexus-section-title">Control de Inventario Personal</div>
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input placeholder="Buscar por nombre, cédula o cargo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="nexus-input pl-10" />
                </div>
                <Button className="nexus-btn nexus-btn-primary">Generar Datos Demo</Button>
            </div>
        </div>

        <div className="nexus-table-container">
            <table className="nexus-table">
                <thead>
                    <tr>
                        <th>Colaborador</th>
                        <th>Cargo / Empresa</th>
                        <th className="text-center">C / P / CB</th>
                        <th>Última Entrega</th>
                        <th>Estado</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(item => (
                        <tr key={item.id}>
                            <td>
                                <p className="font-bold text-white text-sm">{item.nombresApellidos}</p>
                                <p className="text-[10px] text-gray-500 font-mono">CC: {item.cedula}</p>
                            </td>
                            <td>
                                <p className="text-xs text-gray-300">{item.cargo}</p>
                                <p className="text-[10px] text-[#FFCD04]/60 uppercase font-black">{item.empresa}</p>
                            </td>
                            <td className="text-center">
                                <div className="flex justify-center gap-1">
                                    <span className="bg-white/5 px-2 py-1 rounded text-[10px] font-bold" title="Camisas">{item.cantidadCamisas}</span>
                                    <span className="bg-white/5 px-2 py-1 rounded text-[10px] font-bold" title="Pantalones">{item.cantidadPantalones}</span>
                                    <span className="bg-white/5 px-2 py-1 rounded text-[10px] font-bold" title="Camisas Blancas">{item.cantidadCamisasBlancasMangaLarga}</span>
                                </div>
                            </td>
                            <td className="text-xs text-gray-400 font-mono">{item.fechaEntrega}</td>
                            <td>
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                                    item.estado === 'Activo' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                    {item.estado}
                                </span>
                            </td>
                            <td className="text-center">
                                <div className="flex justify-center gap-2">
                                    <button className="nexus-btn nexus-btn-ghost !p-2 !h-8 hover:bg-[#FFCD04] hover:text-black" title="Reasginar a Stock"><RotateCcw className="h-4 w-4" /></button>
                                    <button className="nexus-btn nexus-btn-ghost !p-2 !h-8 hover:bg-red-500 hover:text-white" title="Retirar Personal"><UserMinus className="h-4 w-4" /></button>
                                </div>
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
