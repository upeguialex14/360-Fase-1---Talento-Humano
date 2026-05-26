import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Filter, Download, ChevronRight, ShoppingBag, Clock, CheckCircle, Send, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import api from '../../services/api';
import '../../styles/DotacionLiquidEther.css';

const COLUMNAS_PERMITIDAS = [
  "EMPRESA", "CEDULA", "NOMBRES Y APELLIDOS", "GENERO", "ESTADO EN LA COMPAÑIA", "CIUDAD", 
  "UNIDAD DE NEGOCIO", "OFICINA", "TALLA CAMISA", "TALLA PANTALON", "CANTIDAD PANTALONES", "CANTIDAD CAMISAS", 
  "CANTIDAD DE CAMISAS BLANCAS MANGA LARGA ENTREGA 1", "CANTIDAD DE CAMISAS AZULES MANGA LARGA ENTREGA 1", 
  "CANTIDAD DE CAMISAS AZULES MANGA LARGA ENTREGA 2", "CANTIDAD DE CAMISAS AZULES MANGA LARGA ENTREGA 3", 
  "CANTIDAD PANTALON LINO DAMA ESPECIALIZADO ENTREGA 1", "CANTIDAD PANTALON LINO DAMA ESPECIALIZADO ENTREGA 2", 
  "CANTIDAD PANTALON LINO DAMA ESPECIALIZADO ENTREGA 3", "CANTIDAD DE FALDAS ENTREGA 1", "CANTIDAD DE FALDAS ENTREGA 2", 
  "CANTIDAD DE FALDAS ENTREGA 3", "CANTIDAD PANTALON DRIL AZUL ENTREGA 1", "CANTIDAD PANTALON DRIL AZUL ENTREGA 2", 
  "CANTIDAD PANTALON DRIL AZUL ENTREGA 3", "CANTIDAD PANTALON DRIL CAQUI ENTREGA 3", "CANTIDAD DE CAMISETAS POLO AZULES ENTREGA 1", 
  "CANTIDAD DE CAMISETAS POLO AZULES ENTREGA 2", "CANTIDAD DE CAMISETAS POLO AZULES ENTREGA 3", "CANTIDAD DE CAMISETAS POLO BLANCAS ENTREGA 1", 
  "CANTIDAD DE CAMISETAS POLO BLANCAS ENTREGA 2", "CANTIDAD SERVICIOS GENERALES ENTREGA 1", "CANTIDAD SERVICIOS GENERALES ENTREGA 2", 
  "CANTIDAD SERVICIOS GENERALES ENTREGA 3", "JEFES O LIDERES DE EXCELENCIA", "CIUDAD DE ENVIO", "MUNICIPIO PARA ENVIO", 
  "DIRECCION", "NOMBRE DE CONTACTO PARA ENVIO", "NUMERO TELEFNICO PERSONA ENVIO", "OFICINA DE ENVIO"
];

export default function DotacionSolicitud() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [showModalProveedor, setShowModalProveedor] = useState(false);
  const [proveedorData, setProveedorData] = useState({ email: '', nombre: '', notas: '' });
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const fetchBaseDatos = async () => {
      setLoading(true);
      try {
        const response = await api.get('/etl/base-datos');
        if (response.success && response.data) {
          const mappedData = response.data.map(user => {
            return {
              "EMPRESA": user.empresa || user.compania || '',
              "CEDULA": user.cedula || '',
              "NOMBRES Y APELLIDOS": user.apellidos_nombres || '',
              "GENERO": user.genero || '',
              "ESTADO EN LA COMPAÑIA": user.estado || '',
              "CIUDAD": user.ciudad || '',
              "UNIDAD DE NEGOCIO": user.unidad_negocio || '',
              "OFICINA": user.oficina || '',
              "TALLA CAMISA": user.t_camisa || '',
              "TALLA PANTALON": user.t_pantalon || '',
              "CANTIDAD PANTALONES": '',
              "CANTIDAD CAMISAS": '',
              "CANTIDAD DE CAMISAS BLANCAS MANGA LARGA ENTREGA 1": '',
              "CANTIDAD DE CAMISAS AZULES MANGA LARGA ENTREGA 1": '',
              "CANTIDAD DE CAMISAS AZULES MANGA LARGA ENTREGA 2": '',
              "CANTIDAD DE CAMISAS AZULES MANGA LARGA ENTREGA 3": '',
              "CANTIDAD PANTALON LINO DAMA ESPECIALIZADO ENTREGA 1": '',
              "CANTIDAD PANTALON LINO DAMA ESPECIALIZADO ENTREGA 2": '',
              "CANTIDAD PANTALON LINO DAMA ESPECIALIZADO ENTREGA 3": '',
              "CANTIDAD DE FALDAS ENTREGA 1": '',
              "CANTIDAD DE FALDAS ENTREGA 2": '',
              "CANTIDAD DE FALDAS ENTREGA 3": '',
              "CANTIDAD PANTALON DRIL AZUL ENTREGA 1": '',
              "CANTIDAD PANTALON DRIL AZUL ENTREGA 2": '',
              "CANTIDAD PANTALON DRIL AZUL ENTREGA 3": '',
              "CANTIDAD PANTALON DRIL CAQUI ENTREGA 3": '',
              "CANTIDAD DE CAMISETAS POLO AZULES ENTREGA 1": '',
              "CANTIDAD DE CAMISETAS POLO AZULES ENTREGA 2": '',
              "CANTIDAD DE CAMISETAS POLO AZULES ENTREGA 3": '',
              "CANTIDAD DE CAMISETAS POLO BLANCAS ENTREGA 1": '',
              "CANTIDAD DE CAMISETAS POLO BLANCAS ENTREGA 2": '',
              "CANTIDAD SERVICIOS GENERALES ENTREGA 1": '',
              "CANTIDAD SERVICIOS GENERALES ENTREGA 2": '',
              "CANTIDAD SERVICIOS GENERALES ENTREGA 3": '',
              "JEFES O LIDERES DE EXCELENCIA": user.lider || '',
              "CIUDAD DE ENVIO": user.ciudad_residencia || user.ciudad || '',
              "MUNICIPIO PARA ENVIO": user.ciudad_residencia || user.ciudad || '',
              "DIRECCION": user.direccion || '',
              "NOMBRE DE CONTACTO PARA ENVIO": user.apellidos_nombres || '',
              "NUMERO TELEFNICO PERSONA ENVIO": user.telefono || '',
              "OFICINA DE ENVIO": user.oficina || ''
            };
          });
          setSolicitudes(mappedData);
        } else {
          toast.error('Error al cargar datos de la base de datos maestra');
        }
      } catch (error) {
        console.error('Error loading base datos data:', error);
        toast.error('Ocurrió un error al consultar la base de datos maestra');
      } finally {
        setLoading(false);
      }
    };

    fetchBaseDatos();
  }, []);

  const filtered = solicitudes.filter(s => {
    const searchString = searchTerm.toLowerCase();
    const matchSearch = 
        (s["NOMBRES Y APELLIDOS"] && s["NOMBRES Y APELLIDOS"].toLowerCase().includes(searchString)) || 
        (s["CEDULA"] && s["CEDULA"].includes(searchString));
    
    const estadoLocal = s["ESTADO EN LA COMPAÑIA"] || 'Pendiente';
    const matchEstado = filtroEstado === 'Todos' || estadoLocal === filtroEstado;
    return matchSearch && matchEstado;
  });

  const stats = {
    pendientes: solicitudes.filter(s => s["ESTADO EN LA COMPAÑIA"] === 'Pendiente').length,
    aprobadas: solicitudes.filter(s => s["ESTADO EN LA COMPAÑIA"] === 'Aprobado' || s["ESTADO EN LA COMPAÑIA"] === 'Activo').length,
    enviadas: solicitudes.filter(s => s["ESTADO EN LA COMPAÑIA"] === 'Enviado' || s["ESTADO EN LA COMPAÑIA"] === 'Entregado').length,
  };

  const handleEnviarProveedor = async () => {
    if (!proveedorData.email || !proveedorData.nombre) {
        toast.error('Complete el nombre y correo del proveedor');
        return;
    }
    if (!filtered || filtered.length === 0) {
        toast.error('No hay datos para enviar');
        return;
    }
    
    setProcesando(true);
    try {
        const payload = {
            nombre: proveedorData.nombre,
            email: proveedorData.email,
            notas: proveedorData.notas,
            jsonDatos: filtered
        };
        
        const response = await api.post('/dotacion/providers/orders/bulk-excel', payload);
        
        if (response.success) {
            toast.success(`Orden enviada a ${proveedorData.email} y guardada en historial.`);
            setShowModalProveedor(false);
            setProveedorData({ email: '', nombre: '', notas: '' });
        } else {
            toast.error('Error al enviar la solicitud al proveedor: ' + response.message);
        }
    } finally {
        setProcesando(false);
    }
  };

  return (
    <div className="nexus-page-container nexus-scrollbar">
      <Toaster position="top-right" richColors />
      <div className="nexus-card">
        <header className="nexus-header">
            <div className="flex justify-between items-center">
                <div>
                    <h1>Solicitudes a Proveedor</h1>
                    <p>Envía la solicitud de dotación al proveedor con la información directa de la Base de Datos Maestra</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={() => {
                        if(filtered.length === 0) {
                            toast.warning('No hay datos para enviar');
                            return;
                        }
                        setShowModalProveedor(true);
                    }} className="nexus-btn nexus-btn-primary h-10">
                        <Send className="h-5 w-5 mr-2" /> Enviar a Proveedor
                    </Button>
                </div>
            </div>
        </header>

        <div className="nexus-stats-grid">
            <div className="nexus-stat-card">
                <div className="nexus-stat-label flex items-center gap-2"><Clock className="h-4 w-4 text-orange-400" /> Pendientes</div>
                <div className="nexus-stat-value" style={{ color: '#fb923c' }}>{stats.pendientes}</div>
            </div>
            <div className="nexus-stat-card">
                <div className="nexus-stat-label flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Aprobadas/Activas</div>
                <div className="nexus-stat-value" style={{ color: '#4ade80' }}>{stats.aprobadas}</div>
            </div>
            <div className="nexus-stat-card">
                <div className="nexus-stat-label flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-blue-400" /> Enviadas/Entregadas</div>
                <div className="nexus-stat-value" style={{ color: '#60a5fa' }}>{stats.enviadas}</div>
            </div>
        </div>

        <div className="nexus-section">
            <div className="nexus-section-title">Filtros y Búsqueda</div>
            <div className="nexus-grid">
                <div className="nexus-form-group">
                    <label>Búsqueda Rápida</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input placeholder="Nombre o cédula..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="nexus-input pl-10" />
                    </div>
                </div>
                <div className="nexus-form-group">
                    <label>Filtrar por Estado en la Compañía</label>
                    <select className="nexus-input" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                        <option value="Todos">Todos los estados</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="nexus-table-container">
            <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-left border-collapse min-w-max">
                <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                        {COLUMNAS_PERMITIDAS.map((key, index) => (
                            <th key={index} className="py-4 px-4 font-medium whitespace-nowrap">{key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={COLUMNAS_PERMITIDAS.length} className="text-center py-8">Cargando colaboradores de la base de datos maestra...</td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan={COLUMNAS_PERMITIDAS.length} className="text-center py-8 text-gray-500">No se encontraron registros de colaboradores</td></tr>
                    ) : (
                        filtered.map((s, index) => (
                            <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                {COLUMNAS_PERMITIDAS.map((colName, i) => (
                                    <td key={i} className="py-3 px-4 text-xs whitespace-nowrap">{s[colName] || '-'}</td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        </div>
      </div>

      {/* MODAL ENVÍO A PROVEEDOR */}
      {showModalProveedor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="nexus-card w-full max-w-lg">
            <header className="nexus-header mb-8 flex justify-between items-start">
                <div>
                    <h2 className="text-[#FFCD04] font-black text-xl uppercase">Enviar a Proveedor</h2>
                    <p className="text-xs">Se enviarán las solicitudes con la plantilla oficial de 41 columnas</p>
                </div>
                <button onClick={() => setShowModalProveedor(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </header>
            
            <div className="space-y-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                    <span className="font-bold text-white">Registros a incluir:</span>
                    <span className="text-[#FFCD04] font-black text-xl">{filtered.length}</span>
                </div>

                <div className="nexus-form-group">
                    <label>Nombre del Proveedor</label>
                    <Input 
                        placeholder="Ej: Confecciones Textiles S.A." 
                        value={proveedorData.nombre} 
                        onChange={e => setProveedorData({...proveedorData, nombre: e.target.value})} 
                        className="nexus-input" 
                    />
                </div>

                <div className="nexus-form-group">
                    <label>Correo Electrónico</label>
                    <Input 
                        type="email"
                        placeholder="proveedor@empresa.com" 
                        value={proveedorData.email} 
                        onChange={e => setProveedorData({...proveedorData, email: e.target.value})} 
                        className="nexus-input" 
                    />
                </div>

                <div className="nexus-form-group">
                    <label>Notas Adicionales (Cuerpo del correo)</label>
                    <textarea 
                        rows={3}
                        placeholder="Instrucciones especiales, plazos de entrega..." 
                        value={proveedorData.notes} 
                        onChange={e => setProveedorData({...proveedorData, notes: e.target.value})} 
                        className="nexus-input w-full p-3 rounded-lg" 
                    />
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={() => setShowModalProveedor(false)} className="nexus-btn nexus-btn-ghost flex-1">Cancelar</Button>
                <Button onClick={handleEnviarProveedor} disabled={procesando} className="nexus-btn nexus-btn-primary flex-1">
                    <Send className="h-4 w-4 mr-2" /> {procesando ? 'Enviando...' : 'Generar y Enviar'}
                </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
