import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, RotateCcw, UserMinus, UserPlus, Info, CheckCircle2, AlertCircle, PackageCheck, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import api from '../../services/api';
import '../../styles/DotacionLiquidEther.css';

export default function DotacionReasignacion() {
  const [data, setData] = useState([]);
  const [historialTraslados, setHistorialTraslados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para Modal de Traslado
  const [showTrasladoModal, setShowTrasladoModal] = useState(false);
  const [origenSeleccionado, setOrigenSeleccionado] = useState(null);
  const [destinoBusqueda, setDestinoBusqueda] = useState('');
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null);
  const [seleccionTraslado, setSeleccionTraslado] = useState({
    camisas: 0,
    pantalones: 0,
    camisasBlancas: 0
  });
  const [notasTraslado, setNotasTraslado] = useState('');

  useEffect(() => {
    fetchReasignacionData();
    fetchHistorialTraslados();
  }, []);

  const fetchHistorialTraslados = async () => {
    try {
      const response = await api.get('/dotacion/traslados');
      if (response && response.success) {
        setHistorialTraslados(response.data);
      }
    } catch (error) {
      console.error('Error fetching traslados:', error);
    }
  };

  const fetchReasignacionData = async () => {
    try {
      // Obtenemos los trabajadores directamente de la tabla real
      const response = await api.get('/planta-operacion');
      if (response && response.success) {
        // Mapeamos los datos para adaptarlos a la vista actual
        const mapped = response.data.map((p, index) => ({
            id: p.id_planta || index,
            nombresApellidos: p.nombre || p.nombres_apellidos || 'Sin Nombre',
            cedula: p.cedula || 'N/A',
            cargo: p.cargo || 'No Definido',
            empresa: p.empresa || p.empleador || 'MULTIVALORES',
            fechaEntrega: p.fecha_ingreso ? p.fecha_ingreso.slice(0,10) : 'Pendiente',
            // Simulamos temporalmente cantidades hasta tener la conexión completa con el kardex individual
            cantidadCamisas: Math.floor(Math.random() * 3) + 1,
            cantidadPantalones: Math.floor(Math.random() * 3) + 1,
            cantidadCamisasBlancasMangaLarga: Math.floor(Math.random() * 2),
            estado: p.status === 'Activo' || p.estado === 'Activo' ? 'Activo' : 'Inactivo'
        }));
        setData(mapped);
      }
    } catch (error) {
      console.error('Error fetching reasignacion data:', error);
      toast.error('Error al cargar la planta de operaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTraslado = (item) => {
    setOrigenSeleccionado(item);
    setDestinoSeleccionado(null);
    setDestinoBusqueda('');
    setSeleccionTraslado({
      camisas: 0,
      pantalones: 0,
      camisasBlancas: 0
    });
    setNotasTraslado('');
    setShowTrasladoModal(true);
  };

  const handleConfirmTraslado = async () => {
    if (!origenSeleccionado || !destinoSeleccionado) {
        toast.error('Debe seleccionar un destino');
        return;
    }

    const items = [];
    if (seleccionTraslado.camisas > 0) items.push(`${seleccionTraslado.camisas} Camisas`);
    if (seleccionTraslado.pantalones > 0) items.push(`${seleccionTraslado.pantalones} Pantalones`);
    if (seleccionTraslado.camisasBlancas > 0) items.push(`${seleccionTraslado.camisasBlancas} Camisas Blancas`);

    if (items.length === 0) {
        toast.error('Debe seleccionar al menos una prenda para trasladar');
        return;
    }

    const prendasStr = items.join(', ');

    try {
        const payload = {
            origenId: origenSeleccionado.cedula || origenSeleccionado.id,
            origenNombre: origenSeleccionado.nombresApellidos,
            destinoId: destinoSeleccionado.cedula || destinoSeleccionado.id,
            destinoNombre: destinoSeleccionado.nombresApellidos,
            prendas: prendasStr,
            notas: notasTraslado
        };

        const response = await api.post('/dotacion/traslados', payload);
        if (response.success) {
            toast.success('Traslado registrado en Base de Datos exitosamente');
            setShowTrasladoModal(false);
            fetchHistorialTraslados(); 
        } else {
            toast.error('Error: ' + response.message);
        }
    } catch (error) {
        toast.error('Ocurrió un error al registrar el traslado');
    }
  };

  const destinosFiltrados = data.filter(d => 
    d.id !== origenSeleccionado?.id && 
    (d.nombresApellidos.toLowerCase().includes(destinoBusqueda.toLowerCase()) || d.cedula.includes(destinoBusqueda))
  );

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
                <Button onClick={fetchReasignacionData} className="nexus-btn nexus-btn-primary">
                    <RotateCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sincronizar con Base de Datos
                </Button>
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
                                    <button onClick={() => handleOpenTraslado(item)} className="nexus-btn nexus-btn-ghost !p-2 !h-8 hover:bg-[#FFCD04] hover:text-black" title="Trasladar a otro empleado"><RotateCcw className="h-4 w-4" /></button>
                                    <button className="nexus-btn nexus-btn-ghost !p-2 !h-8 hover:bg-red-500 hover:text-white" title="Retirar Personal"><UserMinus className="h-4 w-4" /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      <div className="nexus-card mt-8">
        <header className="nexus-header mb-4">
            <h2 className="text-xl font-black text-white">Histórico de Traslados (Base de Datos)</h2>
        </header>
        <div className="nexus-table-container">
            <table className="nexus-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>De (Origen)</th>
                        <th>A (Destino)</th>
                        <th>Prendas Trasladadas</th>
                        <th>Notas</th>
                    </tr>
                </thead>
                <tbody>
                    {historialTraslados.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4 text-gray-500">No hay traslados registrados aún.</td></tr>
                    ) : historialTraslados.map(h => (
                        <tr key={h.id}>
                            <td className="text-xs">{new Date(h.fecha).toLocaleString()}</td>
                            <td className="text-red-400 font-bold">{h.origen_nombre} <br/><span className="text-[10px] text-gray-500">CC: {h.origen_id}</span></td>
                            <td className="text-green-400 font-bold">{h.destino_nombre} <br/><span className="text-[10px] text-gray-500">CC: {h.destino_id}</span></td>
                            <td className="text-sm font-mono text-[#FFCD04]">{h.prendas}</td>
                            <td className="text-xs text-gray-400">{h.notas || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {showTrasladoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="nexus-card w-full max-w-lg">
            <header className="nexus-header mb-8">
                <h2 className="text-[#FFCD04] font-black text-xl uppercase">Trasladar Dotación</h2>
                <p className="text-xs">Registrar traslado físico entre colaboradores en Base de Datos</p>
            </header>
            
            <div className="space-y-4">
                <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    <p className="text-[10px] text-red-400 uppercase font-black">Origen (Quien entrega)</p>
                    <p className="font-bold text-white">{origenSeleccionado?.nombresApellidos}</p>
                </div>

                <div className="nexus-form-group">
                    <label className="text-green-400">Destino (Quien recibe)</label>
                    {!destinoSeleccionado ? (
                        <div className="space-y-2">
                            <Input placeholder="Buscar destino por nombre o cédula..." value={destinoBusqueda} onChange={e => setDestinoBusqueda(e.target.value)} className="nexus-input" />
                            {destinoBusqueda && (
                                <div className="max-h-32 overflow-y-auto nexus-scrollbar bg-black/40 rounded-xl border border-white/5">
                                    {destinosFiltrados.map(d => (
                                        <button key={d.id} onClick={() => setDestinoSeleccionado(d)} className="w-full text-left p-2 hover:bg-[#FFCD04]/10 transition-all border-b border-white/5 text-sm">
                                            {d.nombresApellidos} - CC: {d.cedula}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20 flex justify-between items-center">
                            <p className="font-bold text-white">{destinoSeleccionado.nombresApellidos}</p>
                            <button onClick={() => setDestinoSeleccionado(null)} className="text-green-400"><X className="h-4 w-4" /></button>
                        </div>
                    )}
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                    <p className="text-[10px] text-[#FFCD04] uppercase font-black">Prendas a trasladar</p>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400">Camisas (Máx: {origenSeleccionado?.cantidadCamisas})</label>
                            <Input 
                                type="number" 
                                min="0" 
                                max={origenSeleccionado?.cantidadCamisas} 
                                value={seleccionTraslado.camisas}
                                onChange={e => setSeleccionTraslado({...seleccionTraslado, camisas: parseInt(e.target.value) || 0})}
                                className="nexus-input" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400">Pantalones (Máx: {origenSeleccionado?.cantidadPantalones})</label>
                            <Input 
                                type="number" 
                                min="0" 
                                max={origenSeleccionado?.cantidadPantalones} 
                                value={seleccionTraslado.pantalones}
                                onChange={e => setSeleccionTraslado({...seleccionTraslado, pantalones: parseInt(e.target.value) || 0})}
                                className="nexus-input" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400">Blancas (Máx: {origenSeleccionado?.cantidadCamisasBlancasMangaLarga})</label>
                            <Input 
                                type="number" 
                                min="0" 
                                max={origenSeleccionado?.cantidadCamisasBlancasMangaLarga} 
                                value={seleccionTraslado.camisasBlancas}
                                onChange={e => setSeleccionTraslado({...seleccionTraslado, camisasBlancas: parseInt(e.target.value) || 0})}
                                className="nexus-input" 
                            />
                        </div>
                    </div>
                </div>

                <div className="nexus-form-group">
                    <label>Notas Adicionales</label>
                    <Input value={notasTraslado} onChange={e => setNotasTraslado(e.target.value)} className="nexus-input" placeholder="Opcional..." />
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={() => setShowTrasladoModal(false)} className="nexus-btn nexus-btn-ghost flex-1">Cancelar</Button>
                <Button onClick={handleConfirmTraslado} disabled={!destinoSeleccionado || (seleccionTraslado.camisas === 0 && seleccionTraslado.pantalones === 0 && seleccionTraslado.camisasBlancas === 0)} className="nexus-btn nexus-btn-primary flex-1">Confirmar Traslado</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
