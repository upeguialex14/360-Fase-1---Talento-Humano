import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Search, Eye,
  ShieldCheck, AlertTriangle, Users, Mail, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '../../services/api';
import '../../styles/DotacionLiquidEther.css';

interface EntregaFirma {
  id: number;
  fecha_solicitud: string;
  nombres_apellidos: string;
  cedula: string;
  empresa: string;
  cargo: string;
  itemsCount: number;
  estado_firma: string;
  fecha_envio_firma?: string;
  fecha_firma?: string;
  firma_base64?: string;
  correo_enviado?: string;
}

export function DotacionEnvioFirma() {
  const [data, setData] = useState<EntregaFirma[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<number | null>(null);

  // Modal para ver firma registrada
  const [showFirmaModal, setShowFirmaModal] = useState(false);
  const [entregaParaVer, setEntregaParaVer] = useState<EntregaFirma | null>(null);

  useEffect(() => {
    fetchFirmas();
  }, []);

  const fetchFirmas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dotacion/firmas');
      if (res && res.success) {
        setData(res.data || []);
      } else {
        toast.error('Error al cargar datos de firmas');
      }
    } catch (error: any) {
      toast.error('Error de conexión al cargar firmas');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarFirma = async (item: EntregaFirma) => {
    setSendingId(item.id);
    const toastId = toast.loading(`Enviando correo a ${item.nombres_apellidos}...`);
    try {
      const res = await api.post(`/dotacion/firmas/send/${item.id}`, {});
      if (res && res.success) {
        const emailTarget = res.email || item.correo_enviado || 'el colaborador';
        toast.success(`Enlace enviado a ${emailTarget}`, { id: toastId });
        if (res.simulated) {
          toast.warning('Correo simulado. Revisa la consola del backend para obtener el enlace.', { duration: 6000 });
        }
        // Refrescar datos
        await fetchFirmas();
      } else {
        toast.error(res?.message || 'No se pudo enviar el correo', { id: toastId });
      }
    } catch (error: any) {
      toast.error('Error al enviar la solicitud de firma', { id: toastId });
    } finally {
      setSendingId(null);
    }
  };

  const filteredData = data.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      (item.nombres_apellidos || '').toLowerCase().includes(term) ||
      (item.cedula || '').includes(searchTerm);
    const estadoItem = item.estado_firma || 'Pendiente Envío';
    const matchEstado = filtroEstado === 'Todos' || estadoItem === filtroEstado;
    return matchSearch && matchEstado;
  });

  const stats = {
    pendientes_envio: data.filter(e => !e.estado_firma || e.estado_firma === 'Pendiente Envío').length,
    pendientes_firma: data.filter(e => e.estado_firma === 'Pendiente Firma').length,
    firmados: data.filter(e => e.estado_firma === 'Firmado').length,
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const getEstadoBadgeClass = (estado?: string) => {
    switch (estado) {
      case 'Firmado': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'Pendiente Firma': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  return (
    <div className="nexus-page-container nexus-scrollbar">
      <Toaster position="top-right" richColors />
      <div className="nexus-card">
        <header className="nexus-header">
          <div className="flex justify-between items-start">
            <div>
              <h1>Envío y Firma de Recibido</h1>
              <p>Gestiona los envíos de dotación y el proceso de firma digital de los colaboradores</p>
            </div>
            <div className="flex gap-3">
              <Button className="nexus-btn nexus-btn-ghost" onClick={fetchFirmas} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </header>

        {/* Estadísticas */}
        <div className="nexus-stats-grid">
          <div className="nexus-stat-card">
            <div className="nexus-stat-label flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-400" /> Sin Enviar
            </div>
            <div className="nexus-stat-value" style={{ color: '#60a5fa' }}>
              {stats.pendientes_envio}
            </div>
          </div>
          <div className="nexus-stat-card">
            <div className="nexus-stat-label flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-400" /> Por Firmar
            </div>
            <div className="nexus-stat-value" style={{ color: '#fb923c' }}>
              {stats.pendientes_firma}
            </div>
          </div>
          <div className="nexus-stat-card">
            <div className="nexus-stat-label flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-400" /> Firmados
            </div>
            <div className="nexus-stat-value" style={{ color: '#4ade80' }}>
              {stats.firmados}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="nexus-section">
          <div className="nexus-section-title">Registro de Solicitudes</div>
          <div className="nexus-grid">
            <div className="nexus-form-group">
              <label>Búsqueda</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Nombre o cédula..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="nexus-input pl-10"
                />
              </div>
            </div>
            <div className="nexus-form-group">
              <label>Estado</label>
              <select
                className="nexus-input"
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Pendiente Envío">Pendiente Envío</option>
                <option value="Pendiente Firma">Pendiente Firma</option>
                <option value="Firmado">Firmados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="nexus-table-container">
          <table className="nexus-table">
            <thead>
              <tr>
                <th>Fecha Solicitud</th>
                <th>Colaborador</th>
                <th>Cargo / Empresa</th>
                <th className="text-center">Items</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#FFCD04]" />
                    Cargando datos...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 italic">
                    {data.length === 0
                      ? 'No hay registros. Envía una dotación al proveedor desde el módulo Solicitud primero.'
                      : 'No se encontraron registros con los filtros aplicados.'}
                  </td>
                </tr>
              ) : (
                filteredData.map(item => {
                  const estado = item.estado_firma || 'Pendiente Envío';
                  const isSending = sendingId === item.id;
                  return (
                    <tr key={item.id}>
                      <td className="text-xs font-mono">{formatDate(item.fecha_solicitud)}</td>
                      <td>
                        <p className="font-bold text-white">{item.nombres_apellidos}</p>
                        <p className="text-[10px] text-gray-500">CC: {item.cedula}</p>
                      </td>
                      <td>
                        <p className="text-xs text-gray-300">{item.cargo}</p>
                        <p className="text-[10px] text-gray-500">{item.empresa}</p>
                      </td>
                      <td className="text-center">
                        <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] font-black">
                          {item.itemsCount}
                        </span>
                      </td>
                      <td>
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${getEstadoBadgeClass(estado)}`}>
                          {estado}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-2">
                          {/* Botón Enviar Firma (estado inicial o pendiente envío) */}
                          {(estado === 'Pendiente Envío' || !item.estado_firma) && (
                            <Button
                              size="sm"
                              disabled={isSending}
                              onClick={() => handleEnviarFirma(item)}
                              className="nexus-btn nexus-btn-primary !h-8 !px-3 !text-[10px]"
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              {isSending ? 'Enviando...' : 'Enviar Firma'}
                            </Button>
                          )}

                          {/* Botón Re-enviar (ya se envió pero aún no firma) */}
                          {estado === 'Pendiente Firma' && (
                            <Button
                              size="sm"
                              disabled={isSending}
                              onClick={() => handleEnviarFirma(item)}
                              className="nexus-btn nexus-btn-ghost !h-8 !px-3 !text-[10px] !text-orange-400 border border-orange-500/30 hover:bg-orange-500/10"
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {isSending ? 'Enviando...' : 'Re-enviar'}
                            </Button>
                          )}

                          {/* Botón Ver firma (ya firmó) */}
                          {estado === 'Firmado' && (
                            <Button
                              variant="ghost"
                              title="Ver firma registrada"
                              className="nexus-btn !h-8 !w-8 !p-0 !text-green-400 border border-green-500/30 bg-green-500/5 hover:bg-green-500/20"
                              onClick={() => { setEntregaParaVer(item); setShowFirmaModal(true); }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Visor de Firma Registrada */}
      {showFirmaModal && entregaParaVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="nexus-card w-full max-w-xl border border-green-500/30">
            <header className="nexus-header mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-green-400 font-black text-xl uppercase flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6" /> Acta Firmada
                </h2>
                <Button
                  variant="ghost"
                  className="nexus-btn nexus-btn-ghost !h-8 !w-8 !p-0"
                  onClick={() => setShowFirmaModal(false)}
                >
                  ✕
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Confirmación de entrega registrada por el colaborador</p>
            </header>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Colaborador</p>
                <p className="text-white font-bold">{entregaParaVer.nombres_apellidos}</p>
                <p className="text-xs text-gray-400">CC: {entregaParaVer.cedula}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Fecha de Firma</p>
                <p className="text-white font-bold">{formatDate(entregaParaVer.fecha_firma)}</p>
                <p className="text-xs text-gray-400">{entregaParaVer.correo_enviado}</p>
              </div>
            </div>

            <div className="bg-black/40 border border-[#FFCD04]/20 rounded-xl p-4 mb-6">
              <p className="text-[10px] text-[#FFCD04] uppercase font-bold mb-3 text-center tracking-widest">
                Firma Biométrica Registrada
              </p>
              {entregaParaVer.firma_base64 ? (
                <img
                  src={entregaParaVer.firma_base64}
                  alt="Firma del colaborador"
                  className="max-w-full h-auto mx-auto rounded-lg"
                  style={{ maxHeight: '180px', objectFit: 'contain' }}
                />
              ) : (
                <div className="text-center text-gray-500 py-8 italic text-sm">
                  No se encontró imagen de firma en el registro.
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFirmaModal(false)}
              className="nexus-btn nexus-btn-ghost w-full"
            >
              Cerrar Visor
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
