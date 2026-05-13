import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Search, Download, Plus, Eye, Trash2, X, Calendar, 
  PenTool, FileText, Package, Check, ChevronLeft, ChevronRight,
  ShieldCheck, FileSignature, AlertTriangle, Users
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast, Toaster } from 'sonner';
import '../../styles/DotacionLiquidEther.css';

interface ArticuloEntregado {
  tipo: 'Camisa' | 'Pantalón' | 'Camisa Blanca Manga Larga';
  talla: string;
  cantidad: number;
  color: string;
}

interface EntregaDotacion {
  id: number;
  cedula: string;
  nombresApellidos: string;
  cargo: string;
  empresa: string;
  fechaEntrega: string;
  articulosEntregados: ArticuloEntregado[];
  estado: 'Pendiente Firma' | 'Firmado' | 'Rechazado';
  fechaFirma: string;
  responsableEntrega: string;
  observaciones: string;
  firmaBase64: string;
}

const entregasIniciales: EntregaDotacion[] = [
  { id: 1, cedula: '1234567890', nombresApellidos: 'Juan Pérez García', cargo: 'Operario', empresa: 'MULTIVAL SAS', fechaEntrega: '2026-05-10', articulosEntregados: [{ tipo: 'Camisa', talla: 'M', cantidad: 2, color: 'Azul' }], estado: 'Firmado', fechaFirma: '2026-05-10 14:30', responsableEntrega: 'Ana María López', observaciones: '', firmaBase64: '' },
  { id: 2, cedula: '9876543210', nombresApellidos: 'María González López', cargo: 'Supervisora', empresa: 'SEGURIDAD TOTAL LTDA', fechaEntrega: '2026-05-12', articulosEntregados: [{ tipo: 'Camisa', talla: 'S', cantidad: 3, color: 'Azul' }], estado: 'Pendiente Firma', fechaFirma: '', responsableEntrega: 'Carlos Ramírez', observaciones: '', firmaBase64: '' },
];

export function DotacionEnvioFirma() {
  const [data, setData] = useState<EntregaDotacion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [showFirmaModal, setShowFirmaModal] = useState(false);
  const [entregaParaFirmar, setEntregaParaFirmar] = useState<EntregaDotacion | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [decision, setDecision] = useState<'aceptar' | 'rechazar' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('multival_entregas_dotacion');
    setData(saved ? JSON.parse(saved) : entregasIniciales);
  }, []);

  const filteredData = data.filter(item => {
    const matchSearch = item.nombresApellidos.toLowerCase().includes(searchTerm.toLowerCase()) || item.cedula.includes(searchTerm);
    const matchEstado = filtroEstado === 'Todos' || item.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const stats = {
    pendientes: data.filter(e => e.estado === 'Pendiente Firma').length,
    firmados: data.filter(e => e.estado === 'Firmado').length,
    rechazados: data.filter(e => e.estado === 'Rechazado').length,
    total: data.length
  };

  const startDrawing = (e: any) => {
    if (!canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    const ctx = canvasRef.getContext('2d');
    if (ctx) {
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#FFCD04';
      setIsDrawing(true);
    }
  };

  const draw = (e: any) => {
    if (!isDrawing || !canvasRef) return;
    const rect = canvasRef.getBoundingClientRect();
    const ctx = canvasRef.getContext('2d');
    if (ctx) {
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      ctx.lineTo(x, y); ctx.stroke();
    }
  };

  const handleConfirmarFirma = () => {
    if (!entregaParaFirmar || !decision) return;
    const firmaBase64 = decision === 'aceptar' && canvasRef ? canvasRef.toDataURL() : '';
    const actualizada = { ...entregaParaFirmar, estado: decision === 'aceptar' ? 'Firmado' as const : 'Rechazado' as const, fechaFirma: new Date().toLocaleString(), firmaBase64 };
    const nuevosData = data.map(i => i.id === entregaParaFirmar.id ? actualizada : i);
    setData(nuevosData);
    localStorage.setItem('multival_entregas_dotacion', JSON.stringify(nuevosData));
    toast.success('Estado actualizado correctamente');
    setShowFirmaModal(false);
  };

  return (
    <div className="nexus-page-container nexus-scrollbar">
      <Toaster position="top-right" richColors />
      <div className="nexus-card">
        <header className="nexus-header">
            <div className="flex justify-between items-start">
                <div>
                    <h1>Envío y Firma de Recibido</h1>
                    <p>Formalización de entrega de dotación mediante firma digital biométrica</p>
                </div>
                <div className="flex gap-3">
                    <Button className="nexus-btn nexus-btn-ghost"><Download className="h-4 w-4" /></Button>
                    <Button className="nexus-btn nexus-btn-primary"><Plus className="h-4 w-4 mr-2" /> Nueva Entrega</Button>
                </div>
            </div>
        </header>

        <div className="nexus-stats-grid">
            <div className="nexus-stat-card">
                <div className="nexus-stat-label flex items-center gap-2"><Users className="h-4 w-4 text-orange-400" /> Pendientes</div>
                <div className="nexus-stat-value" style={{ color: '#fb923c' }}>{stats.pendientes}</div>
            </div>
            <div className="nexus-stat-card">
                <div className="nexus-stat-label flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-400" /> Firmados</div>
                <div className="nexus-stat-value" style={{ color: '#4ade80' }}>{stats.firmados}</div>
            </div>
            <div className="nexus-stat-card">
                <div className="nexus-stat-label flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> Rechazados</div>
                <div className="nexus-stat-value" style={{ color: '#f87171' }}>{stats.rechazados}</div>
            </div>
        </div>

        <div className="nexus-section">
            <div className="nexus-section-title">Registro de Entregas</div>
            <div className="nexus-grid">
                <div className="nexus-form-group">
                    <label>Búsqueda</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input placeholder="Nombre o cédula..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="nexus-input pl-10" />
                    </div>
                </div>
                <div className="nexus-form-group">
                    <label>Estado</label>
                    <select className="nexus-input" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                        <option value="Todos">Todos</option>
                        <option value="Pendiente Firma">Pendientes</option>
                        <option value="Firmado">Firmados</option>
                        <option value="Rechazado">Rechazados</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="nexus-table-container">
            <table className="nexus-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Colaborador</th>
                        <th>Cargo</th>
                        <th className="text-center">Items</th>
                        <th>Responsable</th>
                        <th>Estado</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(item => (
                        <tr key={item.id}>
                            <td className="text-xs font-mono">{item.fechaEntrega}</td>
                            <td>
                                <p className="font-bold text-white">{item.nombresApellidos}</p>
                                <p className="text-[10px] text-gray-500">CC: {item.cedula}</p>
                            </td>
                            <td className="text-xs">{item.cargo}</td>
                            <td className="text-center">
                                <span className="bg-white/5 border border-white/5 px-2 py-1 rounded text-[10px] font-black">{item.articulosEntregados.length}</span>
                            </td>
                            <td className="text-xs text-gray-400">{item.responsableEntrega}</td>
                            <td>
                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                                    item.estado === 'Firmado' ? 'bg-green-500/10 text-green-400' :
                                    item.estado === 'Rechazado' ? 'bg-red-500/10 text-red-400' :
                                    'bg-orange-500/10 text-orange-400'
                                }`}>
                                    {item.estado}
                                </span>
                            </td>
                            <td className="text-center">
                                <div className="flex justify-center gap-2">
                                    {item.estado === 'Pendiente Firma' ? (
                                        <Button size="sm" onClick={() => { setEntregaParaFirmar(item); setShowFirmaModal(true); }} className="nexus-btn nexus-btn-primary !h-8 !px-3 !text-[10px]">
                                            <FileSignature className="h-3 w-3 mr-1" /> Firmar
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" className="nexus-btn nexus-btn-ghost !h-8 !w-8 !p-0"><Eye className="h-4 w-4" /></Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {showFirmaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="nexus-card w-full max-w-xl">
                <header className="nexus-header mb-8">
                    <h2 className="text-[#FFCD04] font-black text-xl uppercase">Firma Digital Biométrica</h2>
                    <p className="text-xs">Por favor, firme dentro del recuadro para confirmar el recibido</p>
                </header>

                <div className="bg-black/60 border border-[#FFCD04]/20 rounded-2xl overflow-hidden mb-6">
                    <canvas 
                        ref={setCanvasRef} 
                        width={500} 
                        height={250} 
                        className="w-full cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={() => setIsDrawing(false)}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={() => setIsDrawing(false)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button onClick={() => setDecision('aceptar')} className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-black uppercase text-xs ${decision === 'aceptar' ? 'bg-[#FFCD04] text-black border-[#FFCD04]' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'}`}>
                        <Check className="h-4 w-4" /> Aceptar Dotación
                    </button>
                    <button onClick={() => setDecision('rechazar')} className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-black uppercase text-xs ${decision === 'rechazar' ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'}`}>
                        <X className="h-4 w-4" /> Rechazar Entrega
                    </button>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setShowFirmaModal(false)} className="nexus-btn nexus-btn-ghost flex-1">Cerrar</Button>
                    <Button disabled={!decision} onClick={handleConfirmarFirma} className="nexus-btn nexus-btn-primary flex-1">Confirmar Operación</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
