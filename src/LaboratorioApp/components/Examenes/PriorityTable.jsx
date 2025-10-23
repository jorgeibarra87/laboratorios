// PriorityTable.jsx
import React, { useState } from 'react';
import {
    RefreshCw, Search, X, CheckCircle2, TestTube, ChevronDown, ChevronRight,
    ChevronLeft, ChevronRight as ChevronRightIcon, ChevronsLeft, ChevronsRight,
    Check
} from 'lucide-react';
import { usePriorityData } from '../../hook/usePriorityData';
import ObservacionesModal from './ObservacionesModal';

const PriorityTable = ({ prioridad, titulo, colorHeader, filtroActual }) => {
    const [filters, setFilters] = useState({
        historia: '', paciente: '', ingreso: '', folio: '', area: ''
    });
    const [expandedPatient, setExpandedPatient] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        placeholder: '',
        onConfirm: null
    });

    // FUNCIÓN para abrir modal
    const abrirModalObservaciones = (title, placeholder, onConfirm) => {
        setModalConfig({ title, placeholder, onConfirm });
        setModalOpen(true);
    };

    const {
        data,
        loading,
        error,
        refetch,
        patientExams,
        loadPatientExams,
        markExamAsPending,
        completarExamen,
        marcarComoPendiente,
        currentPage,
        totalElements,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        hasNextPage,
        hasPrevPage
    } = usePriorityData(prioridad, filtroActual, abrirModalObservaciones);

    // Filtrar datos (solo afecta la página actual)
    const filteredData = data.filter(patient => {
        return Object.entries(filters).every(([key, value]) => {
            if (!value.trim()) return true;

            let fieldValue = '';

            // Mapear correctamente los campos
            switch (key) {
                case 'historia':
                    fieldValue = patient.historia || '';
                    break;
                case 'paciente':
                    fieldValue = patient.paciente || '';
                    break;
                case 'ingreso':
                    fieldValue = patient.ingreso || '';
                    break;
                case 'folio':
                    fieldValue = patient.folio || '';
                    break;
                case 'area':
                    fieldValue = patient.areaSolicitante || '';
                    break;
                default:
                    fieldValue = patient[key] || '';
            }

            return fieldValue.toString().toLowerCase().includes(value.toLowerCase().trim());
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
            await loadPatientExams(patientId);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Componente de paginación
    const PaginationControls = () => {
        if (totalPages <= 1) return null;

        const getVisiblePages = () => {
            const pages = [];
            const maxVisible = 5;

            let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(totalPages, start + maxVisible);

            if (end - start < maxVisible) {
                start = Math.max(0, end - maxVisible);
            }

            for (let i = start; i < end; i++) {
                pages.push(i);
            }

            return pages;
        };

        return (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
                <div className="flex items-center text-sm text-gray-700">
                    <span>
                        Mostrando {(currentPage * 10) + 1} a {Math.min((currentPage + 1) * 10, totalElements)} de {totalElements} resultados
                    </span>
                </div>

                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => goToPage(0)}
                        disabled={!hasPrevPage}
                        className="px-2 py-1 text-sm rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>

                    <button
                        onClick={prevPage}
                        disabled={!hasPrevPage}
                        className="px-2 py-1 text-sm rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {getVisiblePages().map(page => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 text-sm rounded border ${currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'hover:bg-gray-100'
                                }`}
                        >
                            {page + 1}
                        </button>
                    ))}

                    <button
                        onClick={nextPage}
                        disabled={!hasNextPage}
                        className="px-2 py-1 text-sm rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => goToPage(totalPages - 1)}
                        disabled={!hasNextPage}
                        className="px-2 py-1 text-sm rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
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
                    <span className="ml-3 text-sm bg-white/20 px-2 py-1 rounded">
                        {totalElements} total
                    </span>
                </div>

                <div className="flex items-center space-x-4">
                    {hasActiveFilters && (
                        <div className="flex items-center space-x-2">
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">
                                {filteredData.length} de {data.length} (página actual)
                            </span>
                            <button
                                onClick={clearFilters}
                                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center"
                                title="Limpiar filtros"
                            >
                                <X className="w-3 h-3 mr-1" />
                                Limpiar
                            </button>
                        </div>
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
                            'No se encontraron resultados en esta página' :
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
                                {filtroActual === 'pendientes' && <th className="px-4 py-3 text-left">Fecha Pendiente</th>}
                                <th className="px-4 py-3 text-left">Área</th>
                                {filtroActual !== 'tomadas' && <th className="px-4 py-3 text-center">Acciones</th>}
                            </tr>
                            {/* Fila de filtros */}
                            <tr className="bg-gray-700">
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={filters.historia}
                                        onChange={(e) => setFilters(prev => ({ ...prev, historia: e.target.value }))}
                                        placeholder="Historia..."
                                        className="w-full px-2 py-1 text-sm rounded border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={filters.paciente}
                                        onChange={(e) => setFilters(prev => ({ ...prev, paciente: e.target.value }))}
                                        placeholder="Paciente..."
                                        className="w-full px-2 py-1 text-sm rounded border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-2 text-center text-gray-300">-</td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={filters.ingreso}
                                        onChange={(e) => setFilters(prev => ({ ...prev, ingreso: e.target.value }))}
                                        placeholder="Ingreso..."
                                        className="w-full px-2 py-1 text-sm rounded border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={filters.folio}
                                        onChange={(e) => setFilters(prev => ({ ...prev, folio: e.target.value }))}
                                        placeholder="Folio..."
                                        className="w-full px-2 py-1 text-sm rounded border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-2 text-center text-gray-300">-</td>
                                <td className="px-4 py-2 text-center text-gray-300">-</td>
                                <td className="px-4 py-2 text-center text-gray-300">-</td>
                                {filtroActual === 'tomadas' && <td className="px-4 py-2 text-center text-gray-300">-</td>}
                                {filtroActual === 'pendientes' && <td className="px-4 py-2 text-center text-gray-300">-</td>}
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={filters.area}
                                        onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
                                        placeholder="Área..."
                                        className="w-full px-2 py-1 text-sm rounded border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    {/* Botón limpiar */}
                                    {hasActiveFilters ? (
                                        <button
                                            onClick={clearFilters}
                                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center"
                                            title="Limpiar filtros"
                                        >
                                            <X className="w-3 h-3 mr-1" />
                                            Limpiar
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                    )}
                                </td>
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
                                        <td className="px-4 py-3 text-cyan-600">{patient.folio}</td>
                                        <td className="px-4 py-3">{patient.cama}</td>
                                        <td className="px-4 py-3">
                                            {filtroActual === 'actuales' && patient.cantidadExamenes}
                                            {filtroActual === 'pendientes' && `${patient.cantidadExamenes} pendientes`}
                                            {filtroActual === 'tomadas' && `${patient.cantidadExamenes || 1} tomados`}
                                        </td>
                                        <td className="px-4 py-3">{formatDate(patient.fechaSolicitud)}</td>
                                        {filtroActual === 'pendientes' &&
                                            <td className="px-4 py-3"> {patient.fechaPendiente ? formatDate(patient.fechaPendiente) : '-'}</td>
                                        }
                                        {filtroActual === 'tomadas' && (
                                            <td className="px-4 py-3">{formatDate(patient.fechaTomado)}</td>
                                        )}
                                        <td className="px-4 py-3 text-sm">{patient.areaSolicitante}</td>

                                        {/* BOTONES DE ACCIÓN */}
                                        {filtroActual === 'actuales' && (
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('🔥 Clicking markExamAsPending para patient:', patient.historia);
                                                        markExamAsPending(patient, 'all');
                                                    }}
                                                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-500 px-2 py-1 rounded flex items-center justify-center mx-auto"
                                                    title="Marcar todos como pendientes"
                                                >
                                                    📌
                                                </button>
                                            </td>
                                        )}

                                        {filtroActual === 'pendientes' && (
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('🔥 Clicking markExamAsPending para patient:', patient.historia);
                                                        completarExamen(patient, 'all');
                                                    }}
                                                    className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded flex items-center justify-center mx-auto"
                                                    title="Marcar como completados"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
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
                                                                    <span className={
                                                                        exam.estado === 'tomado' ? 'text-green-600 font-semibold bg-green-100 px-1 line-through' :
                                                                            exam.estado === 'pendiente' ? 'text-yellow-600 bg-yellow-100 px-1 line-through' :
                                                                                ''
                                                                    }>
                                                                        {exam.nombre}
                                                                        {exam.estado === 'tomado' && ' ✓'}
                                                                        {exam.estado === 'pendiente' && ' 📌'}
                                                                    </span>
                                                                </div>

                                                                {/* INPUTS */}
                                                                {filtroActual === 'actuales' && (
                                                                    <div className="flex items-center space-x-2">
                                                                        {/* 🔥 MOSTRAR CHECKBOX solo si está disponible */}
                                                                        {exam.estado === 'disponible' && (
                                                                            <>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={false}
                                                                                    onChange={(e) => {
                                                                                        e.stopPropagation();
                                                                                        console.log('🔥 Clicking markExamAsPending para patient:', patient.historia);
                                                                                        markExamAsPending(patient, index);
                                                                                    }}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    className="w-4 h-4 text-yellow-600"
                                                                                />
                                                                                <label className="text-sm text-gray-600 cursor-pointer">
                                                                                    Marcar como Pendiente
                                                                                </label>
                                                                            </>
                                                                        )}

                                                                        {/* solo texto si ya está pendiente o tomado */}
                                                                        {exam.estado === 'pendiente' && (
                                                                            <div className="flex items-center space-x-1">
                                                                                <span className="text-yellow-600 text-sm">📌</span>
                                                                                <span className="text-sm font-medium text-yellow-600">Pendiente</span>
                                                                            </div>
                                                                        )}

                                                                        {exam.estado === 'tomado' && (
                                                                            <div className="flex items-center space-x-1">
                                                                                <span className="text-green-600 text-sm">✔</span>
                                                                                <span className="text-sm font-medium text-green-600">Tomado</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {filtroActual === 'pendientes' && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={false} // Siempre false para poder marcar
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                console.log('🔥 Clicking markExamAsPending para patient:', patient.historia);
                                                                                completarExamen(patient, index);
                                                                            }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="w-4 h-4 text-green-600"
                                                                        />
                                                                        <label className="text-sm text-gray-600">
                                                                            Marcar como Tomado
                                                                        </label>
                                                                    </div>
                                                                )}

                                                                {filtroActual === 'tomadas' && (
                                                                    <div className="flex items-center space-x-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={false}
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                console.log('🔥 Clicking markExamAsPending para patient:', patient.historia);
                                                                                marcarComoPendiente(patient, index);
                                                                            }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="w-4 h-4 text-yellow-600"
                                                                        />
                                                                        <label className="text-sm text-gray-600">
                                                                            Volver a Pendiente
                                                                        </label>
                                                                    </div>
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

                    {/* Controles de paginación */}
                    <PaginationControls />
                </div>
            )}
            {/* Modal */}
            <ObservacionesModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalConfig.title}
                placeholder={modalConfig.placeholder}
                onConfirm={modalConfig.onConfirm}
            />
        </div>
    );
};

export default PriorityTable;
