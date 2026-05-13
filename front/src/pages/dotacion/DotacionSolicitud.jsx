import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Download, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast, Toaster } from 'sonner';
import '../../styles/DotacionSolicitud.css';

const initialData = [
  {
    id: 1,
    empresa: 'MULTIVAL SAS',
    cedula: '1234567890',
    nombresApellidos: 'Juan Pérez García',
    genero: 'Masculino',
    cargo: 'Operario',
    fechaIngreso: '2024-01-15',
    tiempoCompania: '1 año 2 meses',
    contrato: 'Término Indefinido',
    tipoEmpleado: 'Directo',
    regional: 'Bogotá',
    zona: 'Norte',
    ciudad: 'Bogotá',
    unidadNegocio: 'Operaciones',
    cliente: 'Cliente ABC',
    empresaCliente: 'ABC Corp',
    ptr: 'PTR-001',
    ccHelisa: 'CC-12345',
    oficina: 'Oficina Principal',
    vacanteSobrante: 'Vacante',
    plantaAprobada: 'Sí',
    supervisorGerente: 'María González',
    status: 'Activo',
    tallaCamisa: 'M',
    tallaPantalon: '32',
    cantidadPantalones: '2',
    cantidadCamisas: '3',
    cantidadCamisasBlancasMangaLarga: '1',
  }
];

export default function DotacionSolicitud() {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = data.filter(
    (item) =>
      item.nombresApellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cedula.includes(searchTerm) ||
      item.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        EMPRESA: item.empresa,
        CÉDULA: item.cedula,
        'NOMBRES Y APELLIDOS': item.nombresApellidos,
        GÉNERO: item.genero,
        CARGO: item.cargo,
        'FECHA DE INGRESO': item.fechaIngreso,
        'TIEMPO EN LA COMPAÑÍA MESES Y AÑOS': item.tiempoCompania,
        CONTRATO: item.contrato,
        'TIPO DE EMPLEADO': item.tipoEmpleado,
        REGIONAL: item.regional,
        ZONA: item.zona,
        CIUDAD: item.ciudad,
        'UNIDAD DE NEGOCIO': item.unidadNegocio,
        CLIENTE: item.cliente,
        'EMPRESA CLIENTE': item.empresaCliente,
        PTR: item.ptr,
        'C.C HELISA': item.ccHelisa,
        OFICINA: item.oficina,
        'VACANTE- SOBRANTE': item.vacanteSobrante,
        'PLANTA APROBADA': item.plantaAprobada,
        'SUPERVISOR / GERENTE': item.supervisorGerente,
        STATUS: item.status,
        'TALLA DE CAMISA': item.tallaCamisa,
        'TALLA DE PANTALÓN': item.tallaPantalon,
        'CANTIDAD DE PANTALONES': item.cantidadPantalones,
        'CANTIDAD DE CAMISAS': item.cantidadCamisas,
        'CANTIDAD DE CAMISAS BLANCAS - MANGA LARGA': item.cantidadCamisasBlancasMangaLarga,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitud Dotación');
    XLSX.writeFile(workbook, 'solicitud_dotacion.xlsx');
    toast.success('Archivo Excel exportado correctamente');
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
        setData(data.filter((item) => item.id !== id));
        toast.success('Registro eliminado correctamente');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditedData(item);
  };

  const handleSave = () => {
    setData(data.map((item) => (item.id === editingId ? { ...item, ...editedData } : item)));
    setEditingId(null);
    setEditedData({});
    toast.success('Registro actualizado correctamente');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const renderCell = (item, field, type = "text") => {
    const isEditing = editingId === item.id;
    if (isEditing) {
        return (
            <Input
                type={type}
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  useEffect(() => {
    localStorage.setItem('multival_dotacion_solicitudes', JSON.stringify(solicitudes));
  }, [solicitudes]);

  const filtered = solicitudes.filter(s => {
    const matchSearch = s.colaborador.toLowerCase().includes(searchTerm.toLowerCase()) || s.cedula.includes(searchTerm);
    const matchEstado = filtroEstado === 'Todos' || s.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const stats = {
    pendientes: solicitudes.filter(s => s.estado === 'Pendiente').length,
    aprobadas: solicitudes.filter(s => s.estado === 'Aprobado').length,
    enviadas: solicitudes.filter(s => s.estado === 'Enviado').length,
  };

  return (
    <div className="nexus-page-container nexus-scrollbar">
      <Toaster position="top-right" richColors />
          <Input
            placeholder="Buscar por nombre, cédula, empresa..."
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
              <th className="bg-rosa">EMPRESA</th>
              <th className="bg-rosa">CÉDULA</th>
              <th className="bg-rosa">NOMBRES Y APELLIDOS</th>
              <th className="bg-rosa">GÉNERO</th>
              <th className="bg-rosa">CARGO</th>
              <th className="bg-rosa">FECHA DE INGRESO</th>
              <th className="bg-rosa">TIEMPO COMPAÑÍA</th>
              <th className="bg-rosa">CONTRATO</th>
              <th className="bg-rosa">TIPO EMPLEADO</th>
              <th className="bg-rosa">REGIONAL</th>
              <th className="bg-rosa">ZONA</th>
              <th className="bg-rosa">CIUDAD</th>
              <th className="bg-rosa">UNIDAD NEGOCIO</th>
              <th className="bg-cyan">CLIENTE</th>
              <th className="bg-cyan">EMPRESA CLIENTE</th>
              <th className="bg-cyan">PTR</th>
              <th className="bg-cyan">C.C HELISA</th>
              <th className="bg-rosa">OFICINA</th>
              <th className="bg-cyan">VACANTE-SOBRANTE</th>
              <th className="bg-cyan">PLANTA APROBADA</th>
              <th className="bg-cyan">SUPERVISOR / GERENTE</th>
              <th className="bg-cyan">STATUS</th>
              <th className="bg-naranja">TALLA CAMISA</th>
              <th className="bg-naranja">TALLA PANTALÓN</th>
              <th className="bg-naranja">CANT. PANTALONES</th>
              <th className="bg-naranja">CANT. CAMISAS</th>
              <th className="bg-verde-claro">CANT. CAMISAS BLANCAS</th>
              <th className="bg-gray-header actions-cell">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item) => (
                <tr key={item.id}>
                  <td>{renderCell(item, 'empresa')}</td>
                  <td>{renderCell(item, 'cedula')}</td>
                  <td>{renderCell(item, 'nombresApellidos')}</td>
                  <td>{renderCell(item, 'genero')}</td>
                  <td>{renderCell(item, 'cargo')}</td>
                  <td>{renderCell(item, 'fechaIngreso', 'date')}</td>
                  <td>{renderCell(item, 'tiempoCompania')}</td>
                  <td>{renderCell(item, 'contrato')}</td>
                  <td>{renderCell(item, 'tipoEmpleado')}</td>
                  <td>{renderCell(item, 'regional')}</td>
                  <td>{renderCell(item, 'zona')}</td>
                  <td>{renderCell(item, 'ciudad')}</td>
                  <td>{renderCell(item, 'unidadNegocio')}</td>
                  <td>{renderCell(item, 'cliente')}</td>
                  <td>{renderCell(item, 'empresaCliente')}</td>
                  <td>{renderCell(item, 'ptr')}</td>
                  <td>{renderCell(item, 'ccHelisa')}</td>
                  <td>{renderCell(item, 'oficina')}</td>
                  <td>{renderCell(item, 'vacanteSobrante')}</td>
                  <td>{renderCell(item, 'plantaAprobada')}</td>
                  <td>{renderCell(item, 'supervisorGerente')}</td>
                  <td>{renderCell(item, 'status')}</td>
                  <td>{renderCell(item, 'tallaCamisa')}</td>
                  <td>{renderCell(item, 'tallaPantalon')}</td>
                  <td>{renderCell(item, 'cantidadPantalones')}</td>
                  <td>{renderCell(item, 'cantidadCamisas')}</td>
                  <td>{renderCell(item, 'cantidadCamisasBlancasMangaLarga')}</td>
                  <td className="actions-cell">
                    <div className="flex gap-2">
                      {editingId === item.id ? (
                        <>
                          <Button onClick={handleSave} className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button onClick={handleCancel} className="h-8 w-8 p-0 bg-gray-500 hover:bg-gray-600 text-white">
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
                <td colSpan={28} className="p-8 text-center text-gray-500">
                  No se encontraron registros.
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
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
