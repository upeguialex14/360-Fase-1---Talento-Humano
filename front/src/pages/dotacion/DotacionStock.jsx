import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Download, UserPlus, X, Check, Plus, Box, Info } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import api from '../../services/api';
import '../../styles/DotacionLiquidEther.css';

export default function DotacionStock() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  // Estado Modal Nuevo Artículo / Carga Stock
  const [showAddModal, setShowAddModal] = useState(false);
  const [masterItems, setMasterItems] = useState([]);
  const [newItem, setNewItem] = useState({
    item_id: '',
    size: '',
    quantity: 0
  });

  useEffect(() => {
    fetchInventory();
    fetchPersonas();
    fetchMasterItems();
  }, []);

  const fetchMasterItems = async () => {
    try {
      const response = await api.get('/dotacion/items');
      if (response && response.success) {
        setMasterItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching master items:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await api.get('/dotacion/inventory');
      if (response && response.success) {
        // Mapear los datos del backend al formato que usa la vista
        const mappedStock = response.data.map(item => ({
            id: item.item_id,
            inventory_id: item.inventory_id,
            tipoArticulo: item.item_name,
            genero: item.item_name.toLowerCase().includes('mujer') || item.item_name.toLowerCase().includes('dama') ? 'Mujer' : 
                   (item.item_name.toLowerCase().includes('hombre') || item.item_name.toLowerCase().includes('caballero') ? 'Hombre' : 'Unisex'),
            talla: item.size,
            cantidad: item.quantity_available,
            color: 'N/A' // Si el backend no tiene color
        }));
        setStock(mappedStock);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Error al cargar el inventario real');
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonas = async () => {
    try {
      const response = await api.get('/planta-operacion');
      if (response && response.success) {
        setPersonas(response.data.map(p => ({
            id: p.people_id || p.id,
            cedula: p.cedula || p.document_number || '',
            nombresApellidos: p.nombres_apellidos || `${p.first_name || ''} ${p.last_name || ''}`.trim()
        })));
      }
    } catch (error) {
      console.error('Error fetching personas:', error);
    }
  };

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

  const handleConfirmAsignacion = async () => {
    if (!itemSelected || !personaSelected) return;
    if (cantidadAsignar > itemSelected.cantidad) {
      toast.error('No hay suficiente stock');
      return;
    }
    
    try {
        // Enviar el ajuste de inventario al backend
        const response = await api.post('/dotacion/inventory/adjust', {
            item_id: itemSelected.id,
            size: itemSelected.talla,
            quantity: -Math.abs(cantidadAsignar),
            reason: `Asignación manual a ${personaSelected.nombresApellidos}`
        });

        if (response.success) {
            // Actualizar estado local inmediatamente
            const newStock = stock.map(s => s.inventory_id === itemSelected.inventory_id ? { ...s, cantidad: s.cantidad - cantidadAsignar } : s);
            setStock(newStock);
            toast.success(`Asignación completada con éxito en BD`);
            setShowModal(false);
        } else {
            toast.error('Error al guardar la asignación: ' + response.message);
        }
    } catch (error) {
        toast.error('Error de conexión al asignar dotación');
    }
  };

  const handleAddStock = async () => {
    if (!newItem.item_id || !newItem.size || newItem.quantity <= 0) {
        toast.error('Complete todos los campos correctamente');
        return;
    }

    try {
        // Usamos upsert o adjust dependiendo de si queremos sumar o setear. 
        // Para "Carga de stock" usualmente es un ajuste positivo.
        const response = await api.post('/dotacion/inventory/adjust', {
            item_id: newItem.item_id,
            size: newItem.size,
            quantity: parseInt(newItem.quantity),
            reason: 'Carga manual de stock inicial/reposición'
        });

        if (response.success) {
            toast.success('Stock actualizado correctamente');
            setShowAddModal(false);
            fetchInventory();
        } else {
            toast.error('Error al actualizar stock: ' + response.message);
        }
    } catch (error) {
        toast.error('Error de conexión');
    }
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
                <Button onClick={() => setShowAddModal(true)} className="nexus-btn nexus-btn-primary"><Plus className="h-4 w-4" /> Nuevo Artículo / Carga</Button>
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="nexus-card w-full max-w-lg">
            <header className="nexus-header mb-8">
                <h2 className="text-[#FFCD04] font-black text-xl uppercase">Cargar Stock / Nuevo</h2>
                <p className="text-xs">Añada unidades al inventario existente o cree uno nuevo</p>
            </header>
            
            <div className="space-y-6">
                <div className="nexus-form-group">
                    <label>Tipo de Prenda</label>
                    <select className="nexus-input" value={newItem.item_id} onChange={e => setNewItem({...newItem, item_id: e.target.value})}>
                        <option value="">Seleccione prenda...</option>
                        {masterItems.map(m => (
                            <option key={m.item_id} value={m.item_id}>{m.item_name} ({m.category})</option>
                        ))}
                    </select>
                </div>

                <div className="nexus-form-group">
                    <label>Talla</label>
                    <Input placeholder="Ej: M, 32, XL..." value={newItem.size} onChange={e => setNewItem({...newItem, size: e.target.value})} className="nexus-input" />
                </div>

                <div className="nexus-form-group">
                    <label>Cantidad a Sumar</label>
                    <Input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} className="nexus-input" />
                </div>
            </div>

            <div className="flex gap-4 mt-10">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="nexus-btn nexus-btn-ghost flex-1">Cancelar</Button>
                <Button onClick={handleAddStock} className="nexus-btn nexus-btn-primary flex-1">Cargar Inventario</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
