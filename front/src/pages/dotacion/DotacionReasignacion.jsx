import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Download, Plus, Edit2, Trash2, X, Users, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast, Toaster } from 'sonner';
import '../../styles/DotacionReasignacion.css';
import '../../styles/DotacionSolicitud.css'; // Reusing some base styles

const nombresHombres = [
  'Juan Pérez García', 'Carlos Rodríguez López', 'Miguel Ángel Torres',
  'José Luis Martínez', 'David Sánchez Ruiz', 'Jorge Hernández',
  'Luis Fernando Gómez', 'Andrés Felipe Díaz', 'Ricardo Ramírez',
  'Pedro Pablo Jiménez', 'Daniel Castro Vargas', 'Santiago Morales',
  'Alejandro Ortiz', 'Fernando Gutiérrez', 'Oscar Romero Silva',
  'Javier Méndez Cruz', 'Alberto Flores Vega', 'Roberto Reyes',
  'Gabriel Herrera León', 'Raúl Navarro Ríos', 'Manuel Campos',
  'Sergio Aguilar Rojas', 'Pablo Medina Santos', 'Francisco Ruiz',
  'Héctor Vásquez Peña', 'Diego Paredes Luna', 'Antonio Molina',
  'Cristian Núñez Soto', 'Mauricio Salazar', 'Julio César Ramos'
];

const nombresMujeres = [
  'María González Pérez', 'Ana Rodríguez López', 'Claudia Martínez',
  'Laura García Torres', 'Patricia Hernández', 'Diana Sánchez Ruiz',
  'Carolina Gómez Díaz', 'Andrea López Castro', 'Sandra Ramírez',
  'Valentina Jiménez Vargas', 'Natalia Morales Cruz', 'Paola Ortiz',
  'Mónica Gutiérrez Silva', 'Alejandra Romero Vega', 'Juliana Méndez',
  'Camila Flores Reyes', 'Daniela Herrera León', 'Marcela Navarro',
  'Ángela Ríos Campos', 'Beatriz Aguilar Rojas', 'Catalina Medina',
  'Gloria Ruiz Santos', 'Isabel Vásquez Peña', 'Lucía Paredes Luna',
  'Mariana Molina Soto', 'Paula Núñez Ortega', 'Silvia Salazar',
  'Teresa Ramos Moreno', 'Verónica Castro López', 'Yolanda Vargas'
];

const cargos = [
  'Operario', 'Supervisor', 'Guardia de Seguridad', 'Auxiliar de Bodega',
  'Conductor', 'Técnico de Mantenimiento', 'Coordinador', 'Analista',
  'Asistente Administrativo', 'Jefe de Área', 'Auxiliar de Servicios',
  'Inspector de Calidad'
];

const empresas = [
  'MULTIVAL SAS', 'SEGURIDAD TOTAL LTDA', 'OPERACIONES COLOMBIA',
  'SERVICIOS INTEGRALES SA', 'VIGILANCIA NACIONAL'
];

const tallasCamisa = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const tallasPantalonHombre = ['28', '30', '32', '34', '36', '38'];
const tallasPantalonMujer = ['6', '8', '10', '12', '14'];

export default function DotacionReasignacion() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar datos iniciales
  useEffect(() => {
    const saved = localStorage.getItem('multival_dotacion_reasignacion');
    if (saved) {
      setData(JSON.parse(saved));
    }

    const handleStockUpdate = () => {
      const updated = localStorage.getItem('multival_dotacion_reasignacion');
      if (updated) {
        setData(JSON.parse(updated));
      }
    };

    window.addEventListener('dotacion-stock-updated', handleStockUpdate);
    return () => window.removeEventListener('dotacion-stock-updated', handleStockUpdate);
  }, []);

  const generarDatos = () => {
    const nuevasPersonas = [];
    for (let i = 1; i <= 50; i++) {
      const genero = Math.random() > 0.5 ? 'Hombre' : 'Mujer';
      const nombre = genero === 'Hombre'
        ? nombresHombres[Math.floor(Math.random() * nombresHombres.length)]
        : nombresMujeres[Math.floor(Math.random() * nombresMujeres.length)];
      
      const cedula = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const cargo = cargos[Math.floor(Math.random() * cargos.length)];
      const empresa = empresas[Math.floor(Math.random() * empresas.length)];
      const tallaC = tallasCamisa[Math.floor(Math.random() * tallasCamisa.length)];
      const tallaP = genero === 'Hombre'
        ? tallasPantalonHombre[Math.floor(Math.random() * tallasPantalonHombre.length)]
        : tallasPantalonMujer[Math.floor(Math.random() * tallasPantalonMujer.length)];
      
      nuevasPersonas.push({
        id: Date.now() + i,
        cedula,
        nombresApellidos: nombre,
        genero,
        cargo,
        empresa,
        tallaCamisa: tallaC,
        tallaPantalon: tallaP,
        cantidadPantalones: Math.floor(Math.random() * 3) + 1,
        cantidadCamisas: Math.floor(Math.random() * 4) + 1,
        cantidadCamisasBlancasMangaLarga: Math.floor(Math.random() * 3),
      });
    }
    setData(nuevasPersonas);
    localStorage.setItem('multival_dotacion_reasignacion', JSON.stringify(nuevasPersonas));
    toast.success('✅ 50 personas generadas correctamente');
  };

  const handleDelete = (id) => {
    const nuevosData = data.filter((item) => item.id !== id);
    setData(nuevosData);
    localStorage.setItem('multival_dotacion_reasignacion', JSON.stringify(nuevosData));
    toast.success('Registro eliminado correctamente');
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditedData(item);
  };

  const handleSave = () => {
    const nuevosData = data.map((item) => (item.id === editingId ? { ...item, ...editedData } : item));
    setData(nuevosData);
    localStorage.setItem('multival_dotacion_reasignacion', JSON.stringify(nuevosData));
    setEditingId(null);
    setEditedData({});
    toast.success('✅ Registro actualizado correctamente');
  };

  const filteredData = data.filter(
    (item) =>
      item.nombresApellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cedula.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const { totalPersonas, totalHombres, totalMujeres } = {
    totalPersonas: data.length,
    totalHombres: data.filter((p) => p.genero === 'Hombre').length,
    totalMujeres: data.filter((p) => p.genero === 'Mujer').length,
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        CÉDULA: item.cedula,
        'NOMBRES Y APELLIDOS': item.nombresApellidos,
        GÉNERO: item.genero,
        CARGO: item.cargo,
        EMPRESA: item.empresa,
        'TALLA DE CAMISA': item.tallaCamisa,
        'TALLA DE PANTALÓN': item.tallaPantalon,
        'CANTIDAD DE PANTALONES': item.cantidadPantalones,
        'CANTIDAD DE CAMISAS': item.cantidadCamisas,
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
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar-container">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <Input
            placeholder="Buscar por nombre o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <Button variant="outline" onClick={handleExportExcel} className="border-[#009C3B] text-[#009C3B] hover:bg-[#009C3B]/10">
          <Download className="h-4 w-4 mr-2" /> Exportar Excel
        </Button>
      </div>

      {/* TABLE */}
      <div className="table-viewport">
        <table className="dotacion-table">
          <thead>
            <tr>
              <th>CÉDULA</th>
              <th>NOMBRES Y APELLIDOS</th>
              <th>GÉNERO</th>
              <th>CARGO</th>
              <th>EMPRESA</th>
              <th>TALLA CAMISA</th>
              <th>TALLA PANTALÓN</th>
              <th>PANT.</th>
              <th>CAM.</th>
              <th>BLANCAS</th>
              <th className="actions-cell text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item) => (
                <tr key={item.id}>
                  <td>
                    {editingId === item.id ? (
                      <Input value={editedData.cedula || ''} onChange={(e) => setEditedData({ ...editedData, cedula: e.target.value })} />
                    ) : item.cedula}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <Input value={editedData.nombresApellidos || ''} onChange={(e) => setEditedData({ ...editedData, nombresApellidos: e.target.value })} />
                    ) : item.nombresApellidos}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <select className="custom-select" value={editedData.genero || ''} onChange={(e) => setEditedData({ ...editedData, genero: e.target.value })}>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                      </select>
                    ) : (
                      <span className={`badge-genero ${item.genero === 'Hombre' ? 'badge-hombre' : 'badge-mujer'}`}>
                        {item.genero}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <Input value={editedData.cargo || ''} onChange={(e) => setEditedData({ ...editedData, cargo: e.target.value })} />
                    ) : item.cargo}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <Input value={editedData.empresa || ''} onChange={(e) => setEditedData({ ...editedData, empresa: e.target.value })} />
                    ) : item.empresa}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <select className="custom-select" value={editedData.tallaCamisa || ''} onChange={(e) => setEditedData({ ...editedData, tallaCamisa: e.target.value })}>
                        {tallasCamisa.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : item.tallaCamisa}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <select className="custom-select" value={editedData.tallaPantalon || ''} onChange={(e) => setEditedData({ ...editedData, tallaPantalon: e.target.value })}>
                        {(editedData.genero === 'Hombre' ? tallasPantalonHombre : tallasPantalonMujer).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    ) : item.tallaPantalon}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <Input type="number" min="0" value={editedData.cantidadPantalones || 0} onChange={(e) => setEditedData({ ...editedData, cantidadPantalones: parseInt(e.target.value) })} />
                    ) : <span className="badge-cantidad">{item.cantidadPantalones}</span>}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <Input type="number" min="0" value={editedData.cantidadCamisas || 0} onChange={(e) => setEditedData({ ...editedData, cantidadCamisas: parseInt(e.target.value) })} />
                    ) : <span className="badge-cantidad">{item.cantidadCamisas}</span>}
                  </td>
                  <td>
                    {editingId === item.id ? (
                      <Input type="number" min="0" value={editedData.cantidadCamisasBlancasMangaLarga || 0} onChange={(e) => setEditedData({ ...editedData, cantidadCamisasBlancasMangaLarga: parseInt(e.target.value) })} />
                    ) : <span className="badge-cantidad">{item.cantidadCamisasBlancasMangaLarga}</span>}
                  </td>
                  <td className="actions-cell">
                    <div className="flex gap-2 justify-center">
                      {editingId === item.id ? (
                        <>
                          <Button onClick={handleSave} className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => setEditingId(null)} className="h-8 w-8 p-0 bg-gray-500 hover:bg-gray-600 text-white">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={() => handleEdit(item)} className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="p-8 text-center text-gray-500">
                  No hay datos. Haz clic en "Generar Datos" para crear registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination-container">
        <div>
          Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} registros
        </div>
        <div className="pagination-buttons">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
            Anterior
          </Button>
          <Button variant="outline" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
