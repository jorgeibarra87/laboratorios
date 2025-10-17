// PriorityTable.jsx
import React, { useState } from 'react';
import { RefreshCw, Search, X, CheckCircle2, TestTube, ChevronDown, ChevronRight } from 'lucide-react';
import { usePriorityData } from '../../hook/usePriorityData';

const PriorityTable = ({ prioridad, titulo, colorHeader, filtroActual }) => {
    const [filters, setFilters] = useState({
        historia: '', paciente: '', ingreso: '', folio: '', area: ''
    });
    const [expandedPatient, setExpandedPatient] = useState(null);

    const {
        data,
        loading,
        error,
        refetch,
        patientExams,
        loadPatientExams,
        markExamsTaken
    } = usePriorityData(prioridad, filtroActual);

    // Filtrar datos
    const filteredData = data.filter(patient => {
        return Object.entries(filters).every(([key, value]) => {
            if (!value.trim()) return true;
            return patient[key]?.toString().toLowerCase().includes(value.toLowerCase().trim());
        });
    });

    const clearFilters = () => {
        setFilters({ historia: '', paciente: '', ingreso: '', folio: '', area: '' });
    };

    const hasActiveFilters = Object.values(filters).some(v => v.trim());

    const togglePatient = async (patientId) => {
        if (expandedPatient === patientId) {
            setExpandedPatient(null);
        } else {
            setExpandedPatient(patientId);
            // Cargar exámenes específicos del paciente
            await loadPatientExams(patientId);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="mb-8">
                <div className={`${colorHeader} text-white px-4 py-2 rounded-t-lg font-bold text-lg`}>
                    {titulo}
                </div>
                <div className="bg-white shadow-lg rounded-b-lg p-8 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-2">Cargando {titulo.toLowerCase()}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            {/* Header con controles independientes */}
            <div className={`${colorHeader} text-white px-4 py-2 rounded-t-lg font-bold text-lg flex justify-between`}>
                <div className="flex items-center">
                    {titulo}
                    {filtroActual === 'tomadas' && <CheckCircle2 className="w-5 h-5 ml-2" />}
                </div>

                <div className="flex items-center space-x-4">
                    {hasActiveFilters && (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">
                            {filteredData.length} de {data.length}
                        </span>
                    )}
                    <button
                        onClick={refetch}
                        disabled={loading}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded flex items-center space-x-1"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Actualizar</span>
                    </button>
                </div>
            </div>

            {/* Contenido con tabla HTML estándar */}
            {error ? (
                <div className="bg-red-50 border border-red-200 rounded-b-lg p-4">
                    <p className="text-red-600">Error: {error}</p>
                </div>
            ) : filteredData.length === 0 ? (
                <div className="bg-white shadow-lg rounded-b-lg p-8 text-center text-gray-500">
                    <TestTube className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>
                        {hasActiveFilters ?
                            'No se encontraron resultados' :
                            `No hay solicitudes ${titulo.toLowerCase()}`
                        }
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow-lg rounded-b-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">Historia</th>
                                <th className="px-4 py-3 text-left">Paciente</th>
                                <th className="px-4 py-3 text-left">Edad</th>
                                <th className="px-4 py-3 text-left">Ingreso</th>
                                <th className="px-4 py-3 text-left">Folio</th>
                                <th className="px-4 py-3 text-left">Cama</th>
                                <th className="px-4 py-3 text-left">Exámenes</th>
                                <th className="px-4 py-3 text-left">Fecha Solicitud</th>
                                {filtroActual === 'tomadas' && <th className="px-4 py-3 text-left">Fecha Tomado</th>}
                                <th className="px-4 py-3 text-left">Área</th>
                                {filtroActual !== 'tomadas' && <th className="px-4 py-3 text-center">Acciones</th>}
                            </tr>
                            {/* Fila de filtros */}
                            <tr className="bg-gradient-to-r from-gray-700 to-gray-600">
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={filters.historia}
                                        onChange={(e) => setFilters(prev => ({ ...prev, historia: e.target.value }))}
                                        placeholder="Historia..."
                                        className="w-full px-2 py-1 text-sm rounded border"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={filters.paciente}
                                        onChange={(e) => setFilters(prev => ({ ...prev, paciente: e.target.value }))}
                                        placeholder="Paciente..."
                                        className="w-full px-2 py-1 text-sm rounded border"
                                    />
                                </td>
                                <td className="px-4 py-2 text-center text-gray-300">-</td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={filters.ingreso}
                                        onChange={(e) => setFilters(prev => ({ ...prev, ingreso: e.target.value }))}
                                        placeholder="Ingreso..."
                                        className="w-full px-2 py-1 text-sm rounded border"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={filters.folio}
                                        onChange={(e) => setFilters(prev => ({ ...prev, folio: e.target.value }))}
                                        placeholder="Folio..."
                                        className="w-full px-2 py-1 text-sm rounded border"
                                    />
                                </td>
                                <td className="px-4 py-2 text-center text-gray-300">-</td>
                                <td className="px-4 py-2 text-center text-gray-300">-</td>
                                <td className="px-4 py-2 text-center text-gray-300">-</td>
                                {filtroActual === 'tomadas' && <td className="px-4 py-2 text-center text-gray-300">-</td>}
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={filters.area}
                                        onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
                                        placeholder="Área..."
                                        className="w-full px-2 py-1 text-sm rounded border"
                                    />
                                </td>
                                {filtroActual !== 'tomadas' && (
                                    <td className="px-4 py-2 text-center">
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((patient) => (
                                <React.Fragment key={patient.id}>
                                    <tr
                                        className="hover:bg-gray-50 cursor-pointer border-l-4 border-blue-500"
                                        onClick={() => togglePatient(patient.id)}
                                    >
                                        <td className="px-4 py-3 font-medium">{patient.historia}</td>
                                        <td className="px-4 py-3 flex items-center">
                                            {expandedPatient === patient.id ?
                                                <ChevronDown className="w-4 h-4 mr-2" /> :
                                                <ChevronRight className="w-4 h-4 mr-2" />
                                            }
                                            {patient.paciente}
                                        </td>
                                        <td className="px-4 py-3">{patient.edad}</td>
                                        <td className="px-4 py-3 text-blue-600">{patient.ingreso}</td>
                                        <td className="px-4 py-3 text-purple-600">{patient.folio}</td>
                                        <td className="px-4 py-3">{patient.cama}</td>
                                        <td className="px-4 py-3">
                                            {filtroActual === 'tomadas' ?
                                                `${patient.cantidadExamenes} completados` :
                                                `${patient.cantidadPendientes} pendientes`
                                            }
                                        </td>
                                        <td className="px-4 py-3">{formatDate(patient.fechaSolicitud)}</td>
                                        {filtroActual === 'tomadas' && (
                                            <td className="px-4 py-3">{formatDate(patient.fechaTomado)}</td>
                                        )}
                                        <td className="px-4 py-3 text-sm">{patient.areaSolicitante}</td>
                                        {filtroActual !== 'tomadas' && (
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markExamsTaken(patient, 'all');
                                                    }}
                                                    className="text-green-600 hover:text-green-800"
                                                    title="Marcar todos como tomados"
                                                >
                                                    ✓
                                                </button>
                                            </td>
                                        )}
                                    </tr>

                                    {/* Exámenes expandibles */}
                                    {expandedPatient === patient.id && (
                                        <tr>
                                            <td colSpan="100%" className="px-0 py-0 bg-gray-50">
                                                <div className="px-8 py-4">
                                                    <h4 className="font-semibold text-gray-700 mb-3">
                                                        Exámenes de laboratorio ({patientExams[patient.id]?.length || 0})
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {patientExams[patient.id]?.map((exam, index) => (
                                                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                                                <div className="flex items-center">
                                                                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs mr-3">
                                                                        {index + 1}
                                                                    </span>
                                                                    <span className={exam.tomado ? 'line-through text-gray-500' : ''}>
                                                                        {exam.nombre}
                                                                    </span>
                                                                </div>
                                                                {filtroActual !== 'tomadas' && !exam.tomado && (
                                                                    <button
                                                                        onClick={() => markExamsTaken(patient, index)}
                                                                        className="text-green-600 hover:text-green-800 px-2 py-1 rounded"
                                                                    >
                                                                        Marcar como tomado
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PriorityTable;
