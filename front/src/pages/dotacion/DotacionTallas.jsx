import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, User, Save, RefreshCw, Ruler, Shirt, Footprints } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import api from '../../services/api';
import '../../styles/DotacionLiquidEther.css';

export default function DotacionTallas() {
  const [tallas, setTallas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchTallas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/etl/base-datos');
      if (response && response.success) {
        const mapped = response.data.map((p, index) => ({
          id: p.people_id || index,
          nombre: p.apellidos_nombres || 'Sin Nombre',
          cedula: p.cedula || 'N/A',
          empresa: p.empresa || p.compania || 'MULTIVALORES',
          tallaCamisa: p.t_camisa || '',
          tallaPantalon: p.t_pantalon || '',
          tallaZapatos: p.t_zapatos || ''
        }));
        setTallas(mapped);
        
        // Mantener la referencia del usuario seleccionado actualizada
        if (selectedUser) {
          const currentSelected = mapped.find(u => u.cedula === selectedUser.cedula);
          if (currentSelected) {
            setSelectedUser(currentSelected);
          }
        }
      } else {
        toast.error('Error al obtener datos del servidor');
      }
    } catch (error) {
      console.error('Error fetching tallas:', error);
      toast.error('Error al cargar la base de datos maestra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTallas();
  }, []);

  const filtered = tallas.filter(t => 
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.cedula.includes(searchTerm)
  );

  const handleUpdateTalla = (field, value) => {
    if (!selectedUser) return;
    const updated = tallas.map(t => t.id === selectedUser.id ? { ...t, [field]: value } : t);
    setTallas(updated);
    setSelectedUser({ ...selectedUser, [field]: value });
  };

  const handleSaveTallas = async (userToSave) => {
    if (!userToSave) {
      toast.warning('Por favor seleccione un colaborador');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        cedula: userToSave.cedula,
        t_camisa: userToSave.tallaCamisa,
        t_pantalon: userToSave.tallaPantalon,
        t_zapatos: userToSave.tallaZapatos
      };
      const response = await api.put('/etl/base-datos/tallas', payload);
      if (response && response.success) {
        toast.success(`Tallas de ${userToSave.nombre} actualizadas con éxito en Base de Datos`);
        fetchTallas();
      } else {
        toast.error(response?.message || 'Error al guardar las tallas');
      }
    } catch (error) {
      console.error('Error saving tallas:', error);
      toast.error('Error de conexión al guardar tallas');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="nexus-page-container nexus-scrollbar">
      <Toaster position="top-right" richColors />
      <div className="nexus-card">
        <header className="nexus-header">
            <div className="flex justify-between items-start">
                <div>
                    <h1>Gestión de Tallas</h1>
                    <p>Registro y actualización de medidas antropométricas del personal vinculadas a la Base de Datos Maestra</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={fetchTallas} disabled={loading} className="nexus-btn nexus-btn-ghost">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={() => handleSaveTallas(selectedUser)} disabled={saving || !selectedUser} className="nexus-btn nexus-btn-primary">
                        <Save className="h-4 w-4 mr-2" /> {saving ? 'Guardando...' : 'Guardar Todo'}
                    </Button>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Personal */}
            <div className="lg:col-span-1 space-y-6">
                <div className="nexus-section-title">Colaboradores</div>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="nexus-input pl-10" />
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto nexus-scrollbar pr-2">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center gap-3">
                            <RefreshCw className="h-6 w-6 animate-spin text-[#FFCD04]" />
                            <span>Cargando colaboradores...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No se encontraron colaboradores
                        </div>
                    ) : (
                        filtered.map(user => (
                            <button 
                                key={user.id} 
                                onClick={() => setSelectedUser(user)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                                    selectedUser?.id === user.id ? 'bg-[#FFCD04]/10 border-[#FFCD04]/30' : 'bg-white/5 border-white/5 hover:border-white/20'
                                }`}
                            >
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${selectedUser?.id === user.id ? 'bg-[#FFCD04] text-black' : 'bg-white/10 text-white'}`}>
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-white">{user.nombre}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">CC: {user.cedula}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Formulario de Tallas */}
            <div className="lg:col-span-2">
                <div className="nexus-section-title">Detalle de Medidas</div>
                {selectedUser ? (
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                             <div className="h-20 w-20 rounded-3xl bg-[#FFCD04] flex items-center justify-center shadow-[0_0_30px_rgba(255,205,4,0.3)]">
                                <Ruler className="h-10 w-10 text-black" />
                             </div>
                             <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{selectedUser.nombre}</h2>
                                <p className="text-[#FFCD04] font-bold text-sm">{selectedUser.empresa}</p>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="nexus-form-group">
                                <label className="flex items-center gap-2"><Shirt className="h-3 w-3" /> Talla Camisa</label>
                                <Input value={selectedUser.tallaCamisa} onChange={e => handleUpdateTalla('tallaCamisa', e.target.value)} className="nexus-input text-center text-xl font-black" />
                            </div>
                            <div className="nexus-form-group">
                                <label className="flex items-center gap-2"><Shirt className="h-3 w-3 rotate-180" /> Talla Pantalón</label>
                                <Input value={selectedUser.tallaPantalon} onChange={e => handleUpdateTalla('tallaPantalon', e.target.value)} className="nexus-input text-center text-xl font-black" />
                            </div>
                            <div className="nexus-form-group">
                                <label className="flex items-center gap-2"><Footprints className="h-3 w-3" /> Talla Zapatos</label>
                                <Input value={selectedUser.tallaZapatos} onChange={e => handleUpdateTalla('tallaZapatos', e.target.value)} className="nexus-input text-center text-xl font-black" />
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button className="nexus-btn nexus-btn-primary w-full" onClick={() => handleSaveTallas(selectedUser)} disabled={saving}>
                                {saving ? 'Guardando Cambios...' : 'Actualizar Perfil'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <User className="h-10 w-10 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">Seleccione un colaborador</h3>
                        <p className="text-sm text-gray-600 max-w-xs mt-2">Haga clic en un empleado de la lista para gestionar sus tallas de dotación.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
