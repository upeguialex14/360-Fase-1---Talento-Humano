import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Download, UserPlus, X, Check, Plus, Box, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast, Toaster } from 'sonner';
import '../styles/DotacionLiquidEther.css';

const stockInicial = [
  // ===== CAMISAS HOMBRE =====
  { id: 1, tipoArticulo: 'Camisa', genero: 'Hombre', talla: 'XS', color: 'Azul', cantidad: 15 },
  { id: 2, tipoArticulo: 'Camisa', genero: 'Hombre', talla: 'S', color: 'Azul', cantidad: 25 },
  { id: 3, tipoArticulo: 'Camisa', genero: 'Hombre', talla: 'M', color: 'Azul', cantidad: 40 },
  { id: 4, tipoArticulo: 'Camisa', genero: 'Hombre', talla: 'L', color: 'Azul', cantidad: 35 },
  { id: 5, tipoArticulo: 'Camisa', genero: 'Hombre', talla: 'XL', color: 'Azul', cantidad: 30 },
  { id: 6, tipoArticulo: 'Camisa', genero: 'Hombre', talla: 'XXL', color: 'Azul', cantidad: 20 },
  // ===== CAMISAS MUJER =====
  { id: 7, tipoArticulo: 'Camisa', genero: 'Mujer', talla: 'XS', color: 'Azul', cantidad: 18 },
  { id: 8, tipoArticulo: 'Camisa', genero: 'Mujer', talla: 'S', color: 'Azul', cantidad: 28 },
  { id: 9, tipoArticulo: 'Camisa', genero: 'Mujer', talla: 'M', color: 'Azul', cantidad: 35 },
  { id: 10, tipoArticulo: 'Camisa', genero: 'Mujer', talla: 'L', color: 'Azul', cantidad: 22 },
  { id: 11, tipoArticulo: 'Camisa', genero: 'Mujer', talla: 'XL', color: 'Azul', cantidad: 15 },
  // ===== PANTALONES HOMBRE =====
  { id: 12, tipoArticulo: 'Pantalón', genero: 'Hombre', talla: '28', color: 'Negro', cantidad: 12 },
  { id: 13, tipoArticulo: 'Pantalón', genero: 'Hombre', talla: '30', color: 'Negro', cantidad: 25 },
  { id: 14, tipoArticulo: 'Pantalón', genero: 'Hombre', talla: '32', color: 'Negro', cantidad: 38 },
  { id: 15, tipoArticulo: 'Pantalón', genero: 'Hombre', talla: '34', color: 'Negro', cantidad: 32 },
  { id: 16, tipoArticulo: 'Pantalón', genero: 'Hombre', talla: '36', color: 'Negro', cantidad: 28 },
  { id: 17, tipoArticulo: 'Pantalón', genero: 'Hombre', talla: '38', color: 'Negro', cantidad: 18 },
  // ===== PANTALONES MUJER =====
  { id: 18, tipoArticulo: 'Pantalón', genero: 'Mujer', talla: '6', color: 'Negro', cantidad: 16 },
  { id: 19, tipoArticulo: 'Pantalón', genero: 'Mujer', talla: '8', color: 'Negro', cantidad: 24 },
  { id: 20, tipoArticulo: 'Pantalón', genero: 'Mujer', talla: '10', color: 'Negro', cantidad: 30 },
  { id: 21, tipoArticulo: 'Pantalón', genero: 'Mujer', talla: '12', color: 'Negro', cantidad: 20 },
  { id: 22, tipoArticulo: 'Pantalón', genero: 'Mujer', talla: '14', color: 'Negro', cantidad: 14 },
  // ===== CAMISAS BLANCAS HOMBRE =====
  { id: 23, tipoArticulo: 'Camisa Blanca Manga Larga', genero: 'Hombre', talla: 'S', color: 'Blanco', cantidad: 20 },
  { id: 24, tipoArticulo: 'Camisa Blanca Manga Larga', genero: 'Hombre', talla: 'M', color: 'Blanco', cantidad: 30 },
  { id: 25, tipoArticulo: 'Camisa Blanca Manga Larga', genero: 'Hombre', talla: 'L', color: 'Blanco', cantidad: 25 },
  // ===== CAMISAS BLANCAS MUJER =====
  { id: 26, tipoArticulo: 'Camisa Blanca Manga Larga', genero: 'Mujer', talla: 'S', color: 'Blanco', cantidad: 22 },
  { id: 27, tipoArticulo: 'Camisa Blanca Manga Larga', genero: 'Mujer', talla: 'M', color: 'Blanco', cantidad: 28 },
  { id: 28, tipoArticulo: 'Camisa Blanca Manga Larga', genero: 'Mujer', talla: 'L', color: 'Blanco', cantidad: 18 },
];

export default function DotacionStock() {
  const [stock, setStock] = useState(() => {
    const saved = localStorage.getItem('multival_dotacion_stock');
    return saved ? JSON.parse(saved) : stockInicial;
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('Todos');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  
  // Estado Modal Asignación
  const [showModal, setShowModal] = useState(false);
  const [itemSelected, setItemSelected] = useState(null);
  const [cantidadAsignar, setCantidadAsignar] = useState(1);
  const [searchPersona, setSearchPersona] = useState('');
  const [personaSelected, setPersonaSelected] = useState(null);
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    const savedPersonas = localStorage.getItem('multival_dotacion_reasignacion');
    if (savedPersonas) setPersonas(JSON.parse(savedPersonas));
  }, []);

  useEffect(() => {
    localStorage.setItem('multival_dotacion_stock', JSON.stringify(stock));
  }, [stock]);

  const stats = {
    totalHombre: stock.filter(i => i.genero === 'Hombre').reduce((s, i) => s + i.cantidad, 0),
    totalMujer: stock.filter(i => i.genero === 'Mujer').reduce((s, i) => s + i.cantidad, 0),
    total: stock.reduce((acc, i) => acc + i.cantidad, 0)
  };

  const filteredStock = stock.filter(item => {
    const matchSearch = item.tipoArticulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.talla.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGen = filtroGenero === 'Todos' || item.genero === filtroGenero;
    const matchTipo = filtroTipo === 'Todos' || item.tipoArticulo === filtroTipo;
    return matchSearch && matchGen && matchTipo;
  });

  const handleOpenModal = (item) => {
    setItemSelected(item);
    setCantidadAsignar(1);
    setSearchPersona('');
    setPersonaSelected(null);
    setShowModal(true);
  };

  const personasFiltradas = personas.filter(p => 
    p.nombresApellidos.toLowerCase().includes(searchPersona.toLowerCase()) ||
    p.cedula.includes(searchPersona)
  );

  const handleConfirmAsignacion = () => {
    if (!itemSelected || !personaSelected) return;
    if (cantidadAsignar > itemSelected.cantidad) {
      toast.error('No hay suficiente stock');
      return;
    }
    const newStock = stock.map(s => s.id === itemSelected.id ? { ...s, cantidad: s.cantidad - cantidadAsignar } : s);
    setStock(newStock);
    toast.success(`Asignación completada`);
    setShowModal(false);
  };

  return (
    <div className="nexus-page-container nexus-scrollbar">
      <Toaster position="top-right" richColors />
      <div className="nexus-card">
        <header className="nexus-header">
            <div className="flex justify-between items-start">
                <div>
                    <h1>Stock de Dotación</h1>
                    <p>Gestión de inventario físico y asignaciones directas</p>
                </div>
                <Button onClick={() => {}} className="nexus-btn nexus-btn-primary"><Plus className="h-4 w-4" /> Nuevo Artículo</Button>
            </div>
        </header>

        <div className="nexus-stats-grid">
            <div className="nexus-stat-card">
                <div className="nexus-stat-label">Stock Total</div>
                <div className="nexus-stat-value">{stats.total}</div>
            </div>
            <div className="nexus-stat-card">
                <div className="nexus-stat-label">Total Hombre</div>
                <div className="nexus-stat-value" style={{ color: '#38bdf8' }}>{stats.totalHombre}</div>
            </div>
            <div className="nexus-stat-card">
                <div className="nexus-stat-label">Total Mujer</div>
                <div className="nexus-stat-value" style={{ color: '#f472b6' }}>{stats.totalMujer}</div>
            </div>
        </div>

        <div className="nexus-section">
            <div className="nexus-section-title">Filtros de Búsqueda</div>
            <div className="nexus-grid">
                <div className="nexus-form-group">
                    <label>Buscar</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input placeholder="Ej: Camisa, Talla M..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="nexus-input pl-10" />
                    </div>
                </div>
                <div className="nexus-form-group">
                    <label>Género</label>
                    <select className="nexus-input" value={filtroGenero} onChange={e => setFiltroGenero(e.target.value)}>
                        <option value="Todos">Todos</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                    </select>
                </div>
                <div className="nexus-form-group">
                    <label>Tipo</label>
                    <select className="nexus-input" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                        <option value="Todos">Todos</option>
                        <option value="Camisa">Camisa</option>
                        <option value="Pantalón">Pantalón</option>
                        <option value="Camisa Blanca Manga Larga">Camisa Blanca</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="nexus-table-container">
            <table className="nexus-table">
                <thead>
                    <tr>
                        <th>Artículo</th>
                        <th>Género</th>
                        <th className="text-center">Talla</th>
                        <th>Stock</th>
                        <th className="text-center">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStock.map(item => (
                        <tr key={item.id}>
                            <td className="font-bold">{item.tipoArticulo}</td>
                            <td>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${item.genero === 'Hombre' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>
                                    {item.genero}
                                </span>
                            </td>
                            <td className="text-center font-mono">{item.talla}</td>
                            <td>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold ${item.cantidad <= 10 ? 'text-red-400' : 'text-green-400'}`}>{item.cantidad}</span>
                                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.cantidad <= 10 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(item.cantidad * 2, 100)}%` }}></div>
                                    </div>
                                </div>
                            </td>
                            <td className="text-center">
                                <Button size="sm" onClick={() => handleOpenModal(item)} disabled={item.cantidad === 0} className="nexus-btn nexus-btn-ghost !p-2 !h-8">
                                    <UserPlus className="h-4 w-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {showModal && itemSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="nexus-card w-full max-w-lg">
            <header className="nexus-header mb-8">
                <h2 className="text-[#FFCD04] font-black text-xl uppercase">Asignar Dotación</h2>
                <p className="text-xs">Seleccione el colaborador para asignar el artículo</p>
            </header>
            
            <div className="space-y-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-2">Artículo Seleccionado</p>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{itemSelected.tipoArticulo} - Talla {itemSelected.talla}</span>
                        <span className="text-[#FFCD04] font-black">{itemSelected.cantidad} Disp.</span>
                    </div>
                </div>

                <div className="nexus-form-group">
                    <label>Cantidad a Asignar</label>
                    <Input type="number" min="1" max={itemSelected.cantidad} value={cantidadAsignar} onChange={e => setCantidadAsignar(parseInt(e.target.value) || 1)} className="nexus-input" />
                </div>

                <div className="nexus-form-group">
                    <label>Buscar Colaborador</label>
                    {!personaSelected ? (
                        <div className="space-y-3">
                            <Input placeholder="Nombre o cédula..." value={searchPersona} onChange={e => setSearchPersona(e.target.value)} className="nexus-input" />
                            {searchPersona && (
                                <div className="max-h-40 overflow-y-auto nexus-scrollbar bg-black/40 rounded-xl border border-white/5">
                                    {personasFiltradas.map(p => (
                                        <button key={p.id} onClick={() => setPersonaSelected(p)} className="w-full text-left p-3 hover:bg-[#FFCD04]/10 transition-all border-b border-white/5 last:border-0">
                                            <p className="text-sm font-bold text-white">{p.nombresApellidos}</p>
                                            <p className="text-[10px] text-gray-500 uppercase">CC: {p.cedula}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-[#FFCD04]/10 p-4 rounded-2xl border border-[#FFCD04]/20 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold text-[#FFCD04]">{personaSelected.nombresApellidos}</p>
                                <p className="text-[10px] text-[#FFCD04]/60 uppercase">CC: {personaSelected.cedula}</p>
                            </div>
                            <button onClick={() => setPersonaSelected(null)} className="text-[#FFCD04] hover:scale-110 transition-all"><X className="h-5 w-5" /></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4 mt-10">
                <Button variant="outline" onClick={() => setShowModal(false)} className="nexus-btn nexus-btn-ghost flex-1">Cancelar</Button>
                <Button disabled={!personaSelected} onClick={handleConfirmAsignacion} className="nexus-btn nexus-btn-primary flex-1">Confirmar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
