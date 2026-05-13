import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Download, Upload, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast, Toaster } from 'sonner';
import '../../styles/DotacionTallas.css';
import '../../styles/DotacionSolicitud.css';
import '../../styles/DotacionReasignacion.css';
import '../../styles/DotacionStock.css';

const datosIniciales = [
  {
    id: 1,
    cedula: '1234567890',
    nombresApellidos: 'Juan Pérez García',
    genero: 'Hombre',
    cargo: 'Operario',
    empresa: 'MULTIVAL SAS',
    tallaCamisa: 'M',
    tallaPantalon: '32',
    tallaZapatos: '42',
    observaciones: 'Alérgico a tejidos sintéticos',
  },
  {
    id: 2,
    cedula: '9876543210',
    nombresApellidos: 'María González López',
    genero: 'Mujer',
    cargo: 'Supervisora',
    empresa: 'SEGURIDAD TOTAL LTDA',
    tallaCamisa: 'S',
    tallaPantalon: '8',
    tallaZapatos: '37',
    observaciones: 'Prefiere pantalones de tiro alto',
  },
import '../styles/DotacionLiquidEther.css';

const tallasIniciales = [
  { id: 1, nombre: 'Ana María Prada', cedula: '1010', empresa: 'MULTIVALORES', tallaCamisa: 'S', tallaPantalon: '8', tallaZapatos: '37' },
  { id: 2, nombre: 'Carlos Mario Ruiz', cedula: '2020', empresa: 'MULTIVALORES', tallaCamisa: 'L', tallaPantalon: '34', tallaZapatos: '41' },
];

export default function DotacionTallas() {
  const [tallas, setTallas] = useState(() => {
    const saved = localStorage.getItem('multival_dotacion_tallas');
    return saved ? JSON.parse(saved) : tallasIniciales;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [nuevo, setNuevo] = useState({
    cedula: '', nombresApellidos: '', genero: 'Hombre', cargo: '', empresa: '',
    tallaCamisa: 'M', tallaPantalon: '32', tallaZapatos: '', observaciones: ''
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('multival_datos_talla', JSON.stringify(data));
  }, [data]);

  const stats = {
    total: data.length,
    hombres: data.filter(p => p.genero === 'Hombre').length,
    mujeres: data.filter(p => p.genero === 'Mujer').length,
  };

  const filteredData = data.filter(p => 
    p.nombresApellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cedula.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleGuardarNuevo = () => {
    if (!nuevo.cedula || !nuevo.nombresApellidos || !nuevo.cargo || !nuevo.empresa) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    const reg = { ...nuevo, id: Date.now() };
    setData([...data, reg]);
    setShowAddModal(false);
    setNuevo({
      cedula: '', nombresApellidos: '', genero: 'Hombre', cargo: '', empresa: '',
      tallaCamisa: 'M', tallaPantalon: '32', tallaZapatos: '', observaciones: ''
    });
    toast.success(`✅ Tallas de ${reg.nombresApellidos} registradas`);
  };

  const handleDelete = (id) => {
    setData(data.filter(i => i.id !== id));
    toast.success('Registro eliminado');
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditedData(item);
  };

  const handleSaveEdit = () => {
    setData(data.map(i => i.id === editingId ? { ...i, ...editedData } : i));
    setEditingId(null);
    toast.success('Cambios guardados');
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const wb = XLSX.read(event.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);
        const mapped = json.map((r, i) => ({
          id: Date.now() + i,
          cedula: r['CÉDULA']?.toString() || '',
          nombresApellidos: r['NOMBRES Y APELLIDOS'] || '',
          genero: r['GÉNERO'] === 'Mujer' ? 'Mujer' : 'Hombre',
          cargo: r['CARGO'] || '',
          empresa: r['EMPRESA'] || '',
          tallaCamisa: r['TALLA CAMISA'] || 'M',
          tallaPantalon: r['TALLA PANTALÓN']?.toString() || '32',
          tallaZapatos: r['TALLA ZAPATOS']?.toString() || '',
          observaciones: r['OBSERVACIONES'] || ''
        }));
        setData([...data, ...mapped]);
        toast.success(`✅ ${mapped.length} registros importados`);
      } catch (err) {
        toast.error('Error al importar Excel');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(i => ({
      CÉDULA: i.cedula, 'NOMBRES Y APELLIDOS': i.nombresApellidos, GÉNERO: i.genero,
      CARGO: i.cargo, EMPRESA: i.empresa, 'TALLA CAMISA': i.tallaCamisa,
      'TALLA PANTALÓN': i.tallaPantalon, 'TALLA ZAPATOS': i.tallaZapatos, OBSERVACIONES: i.observaciones
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tallas');
    XLSX.writeFile(wb, 'datos_talla.xlsx');
    toast.success('Excel exportado');
  };

  return (
    <div className="dotacion-container">
      <Toaster position="top-right" richColors />
      <header className="dotacion-header">
        <div>
          <h1 className="dotacion-title">Datos de Talla</h1>
          <p className="dotacion-subtitle">Registra las medidas específicas de cada trabajador</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-[#009C3B] hover:bg-[#007A2E] text-white">
          <Plus className="h-4 w-4 mr-2" /> Agregar Talla
        </Button>
      </header>

      <div className="stats-grid">
        <div className="stat-card bg-total">
          <div className="stat-card-header">📊 Total Registros</div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">registros</div>
        </div>
        <div className="stat-card bg-hombres">
          <div className="stat-card-header">👔 Hombres</div>
          <div className="stat-card-value">{stats.hombres}</div>
          <div className="stat-card-label">registrados</div>
        </div>
        <div className="stat-card bg-mujeres">
          <div className="stat-card-header">👗 Mujeres</div>
          <div className="stat-card-value">{stats.mujeres}</div>
          <div className="stat-card-label">registradas</div>
        </div>
      </div>

      <div className="toolbar-container">
        <div className="search-wrapper max-w-xs">
          <Search className="search-icon" />
          <Input placeholder="Buscar por nombre o cédula..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel} className="border-[#009C3B] text-[#009C3B]">
            <Download className="h-4 w-4 mr-2" /> Exportar
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current.click()} className="border-[#009C3B] text-[#009C3B]">
            <Upload className="h-4 w-4 mr-2" /> Importar
          </Button>
          <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx,.xls" onChange={handleImportExcel} />
        </div>
      </div>

      <div className="table-viewport">
        <table className="dotacion-table">
          <thead>
            <tr>
              <th className="header-personal border-white-r">CÉDULA</th>
              <th className="header-personal border-white-r">NOMBRES Y APELLIDOS</th>
              <th className="header-personal border-white-r">GÉNERO</th>
              <th className="header-personal border-white-r">CARGO</th>
              <th className="header-personal border-white-r">EMPRESA</th>
              <th className="header-tallas border-white-r text-center">TALLA CAMISA</th>
              <th className="header-tallas border-white-r text-center">TALLA PANTALÓN</th>
              <th className="header-tallas border-white-r text-center">TALLA ZAPATOS</th>
              <th className="header-obs border-white-r">OBSERVACIONES</th>
              <th className="actions-cell text-center bg-gray-100">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(item => (
              <tr key={item.id}>
                <td>{editingId === item.id ? <Input value={editedData.cedula || ''} onChange={e => setEditedData({...editedData, cedula: e.target.value})} /> : item.cedula}</td>
                <td>{editingId === item.id ? <Input value={editedData.nombresApellidos || ''} onChange={e => setEditedData({...editedData, nombresApellidos: e.target.value})} /> : item.nombresApellidos}</td>
                <td>
                  {editingId === item.id ? (
                    <select className="custom-select" value={editedData.genero || ''} onChange={e => setEditedData({...editedData, genero: e.target.value})}>
                      <option value="Hombre">Hombre</option>
                      <option value="Mujer">Mujer</option>
                    </select>
                  ) : (
                    <span className={`badge-genero ${item.genero === 'Hombre' ? 'badge-hombre' : 'badge-mujer'}`}>{item.genero}</span>
                  )}
                </td>
                <td>{editingId === item.id ? <Input value={editedData.cargo || ''} onChange={e => setEditedData({...editedData, cargo: e.target.value})} /> : item.cargo}</td>
                <td>{editingId === item.id ? <Input value={editedData.empresa || ''} onChange={e => setEditedData({...editedData, empresa: e.target.value})} /> : item.empresa}</td>
                <td className="text-center">
                  {editingId === item.id ? (
                    <select className="custom-select" value={editedData.tallaCamisa || ''} onChange={e => setEditedData({...editedData, tallaCamisa: e.target.value})}>
                      {['XS','S','M','L','XL','XXL'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : <span className="badge-talla bg-talla-camisa">{item.tallaCamisa}</span>}
                </td>
                <td className="text-center">
                  {editingId === item.id ? (
                    <select className="custom-select" value={editedData.tallaPantalon || ''} onChange={e => setEditedData({...editedData, tallaPantalon: e.target.value})}>
                      {((editedData.genero || item.genero) === 'Hombre' ? ['28','30','32','34','36','38'] : ['6','8','10','12','14']).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  ) : <span className="badge-talla bg-talla-pantalon">{item.tallaPantalon}</span>}
                </td>
                <td className="text-center">
                  {editingId === item.id ? <Input value={editedData.tallaZapatos || ''} onChange={e => setEditedData({...editedData, tallaZapatos: e.target.value})} /> : <span className="badge-talla bg-talla-zapatos">{item.tallaZapatos}</span>}
                </td>
                <td className="max-w-xs">
                  {editingId === item.id ? (
                    <textarea className="textarea-custom" value={editedData.observaciones || ''} onChange={e => setEditedData({...editedData, observaciones: e.target.value})} />
                  ) : <p className="text-sm text-gray-600 truncate">{item.observaciones || '-'}</p>}
                </td>
                <td className="actions-cell">
                  <div className="flex gap-2 justify-center">
                    {editingId === item.id ? (
                      <>
                        <Button onClick={handleSaveEdit} className="h-8 w-8 p-0 bg-green-600 text-white"><Check className="h-4 w-4" /></Button>
                        <Button onClick={() => setEditingId(null)} className="h-8 w-8 p-0 bg-gray-500 text-white"><X className="h-4 w-4" /></Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => handleEdit(item)} className="h-8 w-8 p-0 bg-blue-500 text-white"><Edit2 className="h-4 w-4" /></Button>
                        <Button onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0 bg-red-500 text-white"><Trash2 className="h-4 w-4" /></Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">Agregar Datos de Talla</h2>
              <button onClick={() => setShowAddModal(false)}><X /></button>
            </div>
            <div className="modal-body">
              <p className="modal-section-title">👤 Datos Personales</p>
              <div className="modal-grid-2">
                <Input placeholder="Cédula" value={nuevo.cedula} onChange={e => setNuevo({...nuevo, cedula: e.target.value})} />
                <Input placeholder="Nombres y Apellidos" value={nuevo.nombresApellidos} onChange={e => setNuevo({...nuevo, nombresApellidos: e.target.value})} />
                <select className="custom-select" value={nuevo.genero} onChange={e => setNuevo({...nuevo, genero: e.target.value, tallaPantalon: e.target.value === 'Hombre' ? '32' : '10'})}>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                </select>
                <Input placeholder="Cargo" value={nuevo.cargo} onChange={e => setNuevo({...nuevo, cargo: e.target.value})} />
                <Input placeholder="Empresa" value={nuevo.empresa} onChange={e => setNuevo({...nuevo, empresa: e.target.value})} />
              </div>

              <p className="modal-section-title">📏 Tallas</p>
              <div className="modal-grid-2">
                <select className="custom-select" value={nuevo.tallaCamisa} onChange={e => setNuevo({...nuevo, tallaCamisa: e.target.value})}>
                  {['XS','S','M','L','XL','XXL'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="custom-select" value={nuevo.tallaPantalon} onChange={e => setNuevo({...nuevo, tallaPantalon: e.target.value})}>
                  {(nuevo.genero === 'Hombre' ? ['28','30','32','34','36','38'] : ['6','8','10','12','14']).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <Input placeholder="Talla Zapatos (Ej: 42)" value={nuevo.tallaZapatos} onChange={e => setNuevo({...nuevo, tallaZapatos: e.target.value})} />
              </div>

              <p className="modal-section-title">📝 Observaciones</p>
              <textarea className="textarea-custom" placeholder="Notas especiales..." value={nuevo.observaciones} onChange={e => setNuevo({...nuevo, observaciones: e.target.value})} />
            </div>
            <div className="modal-footer">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
              <Button onClick={handleGuardarNuevo} className="bg-[#009C3B] text-white">Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
