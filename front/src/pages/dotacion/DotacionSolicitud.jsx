import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Plus, Filter, Download, ChevronRight, ShoppingBag, Clock, CheckCircle, Send, X, Upload } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import '../../styles/DotacionLiquidEther.css';

const solicitudesIniciales = [
  { id: 101, fecha: '2026-05-01', colaborador: 'Roberto Gómez', cedula: '102030', articulos: '2 Camisas M, 1 Pantalón 32', estado: 'Aprobado', total: 3 },
  { id: 102, fecha: '2026-05-05', colaborador: 'Lucía Fernández', cedula: '405060', articulos: '1 Camisa Blanca S', estado: 'Pendiente', total: 1 },
  { id: 103, fecha: '2026-05-08', colaborador: 'Marcos Ruiz', cedula: '708090', articulos: '3 Camisas L, 2 Pantalones 34', estado: 'Enviado', total: 5 },
];


export default function DotacionSolicitud() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [showModalProveedor, setShowModalProveedor] = useState(false);
  const [proveedorData, setProveedorData] = useState({ email: '', nombre: '', notas: '' });
  const [procesando, setProcesando] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState('');

  const filtered = solicitudes.filter(s => {
    const searchString = searchTerm.toLowerCase();
    const matchSearch = 
        (s.nombre_completo && s.nombre_completo.toLowerCase().includes(searchString)) || 
        (s.cedula && s.cedula.includes(searchString));
    
    // Normalizar estados para los filtros
    const estadoLocal = s.status_name || 'Pendiente';
    const matchEstado = filtroEstado === 'Todos' || estadoLocal === filtroEstado;
    return matchSearch && matchEstado;
  });

  const stats = {
    pendientes: solicitudes.filter(s => s.status_name === 'Pendiente').length,
    aprobadas: solicitudes.filter(s => s.status_name === 'Aprobado' || s.status_name === 'En Preparación').length,
    enviadas: solicitudes.filter(s => s.status_name === 'Entregado' || s.status_name === 'Enviado').length,
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNombreArchivo(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data && data.length > 0) {
            setExcelData(data);
            setSolicitudes(data.map((row, index) => ({
                delivery_id: index + 1,
                created_at: new Date().toISOString(),
                nombre_completo: row['NOMBRES Y APELLIDOS'] || row['APELLIDOS Y NOMBRES'] || 'Desconocido',
                cedula: row['CÉDULA'] || row['CEDULA'] || '-',
                period_name: 'Periodo',
                period_year: new Date().getFullYear(),
                status_name: row['ESTADO EN LA COMPAÑÍA'] || 'Pendiente'
            })));
            setLoading(false);
            toast.success(`Excel cargado con ${data.length} registros listos para enviar`);
        } else {
            toast.error('El archivo Excel está vacío o no tiene el formato correcto');
        }
      } catch (error) {
        console.error('Error parsing excel:', error);
        toast.error('Hubo un error al leer el archivo Excel');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleEnviarProveedor = async () => {
    if (!proveedorData.email || !proveedorData.nombre) {
        toast.error('Complete el nombre y correo del proveedor');
        return;
    }
    if (!excelData || excelData.length === 0) {
        toast.error('No se ha cargado ningún archivo Excel');
        return;
    }
    
    setProcesando(true);
    try {
        const payload = {
            nombre: proveedorData.nombre,
            email: proveedorData.email,
            notas: proveedorData.notas,
            jsonDatos: excelData
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
                    <p>Carga el Excel con el formato establecido para enviar al proveedor</p>
                </div>
                <div className="flex items-center gap-4">
                    <label className="nexus-btn nexus-btn-ghost cursor-pointer flex items-center justify-center h-10 px-4">
                        <Upload className="h-5 w-5 mr-2" /> 
                        {nombreArchivo ? nombreArchivo : 'Cargar Excel'}
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <Button onClick={() => {
                        if(!excelData) {
                            toast.warning('Primero debes cargar un Excel');
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
            <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-left border-collapse min-w-max">
                <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                        {excelData && excelData.length > 0 ? (
                            Object.keys(excelData[0]).map((key, index) => (
                                <th key={index} className="py-4 px-4 font-medium whitespace-nowrap">{key}</th>
                            ))
                        ) : (
                            <>
                                <th className="py-4 px-4 font-medium">ID Envío</th>
                                <th className="py-4 px-4 font-medium">Fecha</th>
                                <th className="py-4 px-4 font-medium">Colaborador</th>
                                <th className="py-4 px-4 font-medium">Periodo</th>
                                <th className="py-4 px-4 font-medium">Estado</th>
                                <th className="py-4 px-4 font-medium text-center">Acción</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={excelData ? Object.keys(excelData[0]).length : 6} className="text-center py-8">Procesando archivo...</td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan={excelData ? 1 : 6} className="text-center py-8 text-gray-500">Carga un Excel para visualizar los datos</td></tr>
                    ) : excelData ? (
                        filtered.map((s, index) => (
                            <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                {Object.values(excelData[index]).map((val, i) => (
                                    <td key={i} className="py-3 px-4 text-xs whitespace-nowrap">{val || '-'}</td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        filtered.map(s => (
                        <tr key={s.delivery_id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td className="py-3 px-4 font-mono text-[10px] text-gray-500">#{s.delivery_id}</td>
                            <td className="py-3 px-4 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                                <p className="font-bold text-white">{s.nombre_completo}</p>
                                <p className="text-[10px] text-gray-500 uppercase">CC: {s.cedula}</p>
                            </td>
                            <td className="py-3 px-4 text-sm italic text-gray-300">
                                {s.period_name} - {s.period_year}
                            </td>
                            <td className="py-3 px-4">
                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                                    s.status_name === 'Pendiente' ? 'bg-orange-500/10 text-orange-400' :
                                    (s.status_name === 'Aprobado' || s.status_name === 'Entregado') ? 'bg-green-500/10 text-green-400' :
                                    'bg-blue-500/10 text-blue-400'
                                }`}>
                                    {s.status_name || 'Pendiente'}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                                <button className="nexus-btn nexus-btn-ghost !p-2 !h-8 hover:bg-[#FFCD04] hover:text-black transition-all">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        </div>
      </div>

      {/* MODAL NUEVA SOLICITUD / ENVÍO A PROVEEDOR */}
      {showModalProveedor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="nexus-card w-full max-w-lg">
            <header className="nexus-header mb-8 flex justify-between items-start">
                <div>
                    <h2 className="text-[#FFCD04] font-black text-xl uppercase">Enviar a Proveedor</h2>
                    <p className="text-xs">Se enviará un archivo Excel con las solicitudes listadas en la tabla actual</p>
                </div>
                <button onClick={() => setShowModalProveedor(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </header>
            
            <div className="space-y-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                    <span className="font-bold text-white">Solicitudes a incluir:</span>
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
                        value={proveedorData.notas} 
                        onChange={e => setProveedorData({...proveedorData, notas: e.target.value})} 
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
