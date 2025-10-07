import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Check,
    Eye,
    RefreshCw,
    MapPin,
    TestTube,
    Database,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { useSolicitudes } from '../../hook/useSolicitudes';

const ExamenesTable = () => {
    const [expandedPatients, setExpandedPatients] = useState({});
    const [checkedExams, setCheckedExams] = useState({});
    const [filtroActual, setFiltroActual] = useState('actuales');

    // Usar el custom hook
    const {
        solicitudesData,
        loading,
        error,
        cargarSolicitudes,
        paginateData,
        changePage,
        currentPage,
        itemsPerPage
    } = useSolicitudes(filtroActual);

    const togglePatient = (categoria, pacienteId) => {
        const key = `${categoria}-${pacienteId}`;
        setExpandedPatients(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Función para marcar/desmarcar todos los exámenes de un paciente
    const toggleAllExams = (categoria, pacienteIndex, examenes) => {
        const baseKey = `${categoria}-${pacienteIndex}`;
        const allExamKeys = examenes.map((_, examIndex) => `${baseKey}-exam-${examIndex}`);

        const allChecked = allExamKeys.every(key => checkedExams[key]);

        setCheckedExams(prev => {
            const newState = { ...prev };
            allExamKeys.forEach(key => {
                if (allChecked) {
                    delete newState[key];
                } else {
                    newState[key] = true;
                }
            });
            return newState;
        });
    };

    // Función para marcar/desmarcar un examen individual
    const toggleSingleExam = (categoria, pacienteIndex, examIndex) => {
        const examKey = `${categoria}-${pacienteIndex}-exam-${examIndex}`;

        setCheckedExams(prev => ({
            ...prev,
            [examKey]: !prev[examKey]
        }));
    };

    // Verificar si todos los exámenes están marcados
    const areAllExamsChecked = (categoria, pacienteIndex, examenes) => {
        const baseKey = `${categoria}-${pacienteIndex}`;
        const allExamKeys = examenes.map((_, examIndex) => `${baseKey}-exam-${examIndex}`);
        return allExamKeys.every(key => checkedExams[key]);
    };

    // Verificar si un examen individual está marcado
    const isExamChecked = (categoria, pacienteIndex, examIndex) => {
        const examKey = `${categoria}-${pacienteIndex}-exam-${examIndex}`;
        return checkedExams[examKey] || false;
    };

    const getPriorityColor = (prioridad) => {
        const prioridadLower = prioridad.toLowerCase();
        if (prioridadLower.includes('urgente')) {
            return 'bg-red-500 text-white';
        } else if (prioridadLower === 'prioritaria') {
            return 'bg-yellow-400 text-black';
        } else {
            return 'bg-green-500 text-white';
        }
    };

    const cambiarFiltro = (nuevoFiltro) => {
        setFiltroActual(nuevoFiltro);
        setExpandedPatients({});
        setCheckedExams({});
    };

    // Componente de paginación corregido
    const Pagination = ({ categoria, paginationData }) => {
        const { totalPages, currentPage: page, totalItems } = paginationData;

        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
                <div className="text-sm text-gray-700">
                    Mostrando {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, totalItems)} de {totalItems} registros
                </div>
                <div className="flex items-center space-x-2">
                    {/* Primera página usando ChevronsLeft (doble chevron izquierda) */}
                    <button
                        onClick={() => changePage(categoria, 1)}
                        disabled={page === 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Primera página"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Página anterior */}
                    <button
                        onClick={() => changePage(categoria, page - 1)}
                        disabled={page === 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Página anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Números de página */}
                    <div className="flex space-x-1">
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNum = index + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => changePage(categoria, pageNum)}
                                    className={`px-3 py-1 text-sm rounded ${page === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    {/* Página siguiente */}
                    <button
                        onClick={() => changePage(categoria, page + 1)}
                        disabled={page === totalPages}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Página siguiente"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Última página usando ChevronsRight (doble chevron derecha) */}
                    <button
                        onClick={() => changePage(categoria, totalPages)}
                        disabled={page === totalPages}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Última página"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    // Mostrar loading
    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-64">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-lg text-gray-600">Cargando solicitudes...</span>
                </div>
            </div>
        );
    }

    const renderTablaCategoria = (categoria, solicitudes, titulo, colorHeader) => {
        const paginationData = paginateData(solicitudes, categoria);

        return (
            <div className="mb-8">
                <div className={`${colorHeader} text-white px-4 py-2 rounded-t-lg font-bold text-lg`}>
                    {titulo}
                </div>

                {paginationData.items.length === 0 ? (
                    <div className="bg-white shadow-lg rounded-b-lg p-8 text-center text-gray-500">
                        <TestTube className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No hay solicitudes {titulo.toLowerCase()} en este momento</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-lg rounded-b-lg overflow-hidden">
                        {/* Headers */}
                        <div className="bg-gray-800 text-white text-sm">
                            <div className="grid grid-cols-12 gap-2 px-4 py-3 font-semibold">
                                <div className="col-span-1">Historia</div>
                                <div className="col-span-2">Paciente</div>
                                <div className="col-span-1">Edad</div>
                                <div className="col-span-1">Cama</div>
                                <div className="col-span-2">Exámenes</div>
                                <div className="col-span-2">Fecha Solicitud</div>
                                <div className="col-span-2">Área Solicitante</div>
                                <div className="col-span-1">Acciones</div>
                            </div>
                        </div>

                        {/* Contenido */}
                        <div className="divide-y divide-gray-200">
                            {paginationData.items.map((solicitud, index) => {
                                const pacienteKey = `${categoria}-${index}`;
                                const isExpanded = expandedPatients[pacienteKey];
                                const allExamsChecked = areAllExamsChecked(categoria, index, solicitud.examenes);

                                return (
                                    <div key={solicitud.id}>
                                        {/* Fila del paciente */}
                                        <div
                                            className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-blue-500 bg-blue-50"
                                            onClick={() => togglePatient(categoria, index)}
                                        >
                                            <div className="col-span-1 font-medium">{solicitud.historia}</div>
                                            <div className="col-span-2 font-semibold text-blue-800 flex items-center">
                                                {isExpanded ?
                                                    <ChevronDown className="w-4 h-4 mr-2" /> :
                                                    <ChevronRight className="w-4 h-4 mr-2" />
                                                }
                                                <span className="truncate">{solicitud.paciente}</span>
                                            </div>
                                            <div className="col-span-1 text-sm font-medium text-gray-700">
                                                {solicitud.edad} años
                                            </div>
                                            <div className="col-span-1 text-sm">
                                                <div className="flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1 text-gray-500" />
                                                    {solicitud.cama}
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <TestTube className="w-4 h-4 mr-1 text-blue-500" />
                                                    {solicitud.examenes.length} examen{solicitud.examenes.length !== 1 ? 'es' : ''}
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-sm">{solicitud.fechaSolicitud}</div>
                                            <div className="col-span-2 text-xs text-gray-600 truncate">
                                                {solicitud.areaSolicitante}
                                            </div>
                                            <div className="col-span-1 flex space-x-1">
                                                <button
                                                    className={`p-1 ${allExamsChecked ? 'text-green-800 bg-green-100' : 'text-green-600 hover:text-green-800'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleAllExams(categoria, index, solicitud.examenes);
                                                    }}
                                                    title={allExamsChecked ? "Desmarcar todos los exámenes" : "Marcar todos los exámenes"}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button className="text-blue-600 hover:text-blue-800 p-1" title="Ver detalles">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Lista de exámenes expandible */}
                                        {isExpanded && (
                                            <div className="bg-gray-50">
                                                <div className="px-4 py-2 border-l-4 border-gray-300 ml-4">
                                                    <div className="text-sm font-semibold text-gray-700 mb-2">
                                                        Exámenes de laboratorio solicitados ({solicitud.examenes.length}):
                                                    </div>
                                                    <div className="space-y-1">
                                                        {solicitud.examenes.map((examen, examIndex) => {
                                                            const isChecked = isExamChecked(categoria, index, examIndex);

                                                            return (
                                                                <div key={examIndex} className={`flex items-center justify-between rounded p-2 shadow-sm ${isChecked ? 'bg-green-50 border border-green-200' : 'bg-white'}`}>
                                                                    <div className="flex items-center">
                                                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mr-3 ${isChecked ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-800'}`}>
                                                                            {examIndex + 1}
                                                                        </span>
                                                                        <span className={`text-sm ${isChecked ? 'text-gray-600 line-through' : 'text-gray-800'}`}>
                                                                            {examen}
                                                                        </span>
                                                                        {isChecked && (
                                                                            <span className="ml-2 text-xs text-green-600 font-semibold">✓ Completado</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex space-x-1">
                                                                        <button
                                                                            className={`p-1 ${isChecked ? 'text-green-800 bg-green-200' : 'text-green-600 hover:text-green-800'}`}
                                                                            onClick={() => toggleSingleExam(categoria, index, examIndex)}
                                                                            title={isChecked ? "Marcar como pendiente" : "Marcar como completado"}
                                                                        >
                                                                            <Check className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {solicitud.observaciones && (
                                                        <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                                                            <span className="text-xs font-semibold text-gray-600">Observaciones: </span>
                                                            <span className="text-xs text-gray-700">{solicitud.observaciones}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Paginación */}
                        <Pagination categoria={categoria} paginationData={paginationData} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6">
            {/* Header con pestañas y botón refresh */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-1">
                    <button
                        onClick={() => cambiarFiltro('actuales')}
                        className={`px-6 py-2 rounded-l text-sm font-medium ${filtroActual === 'actuales' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Actuales
                    </button>
                    <button
                        onClick={() => cambiarFiltro('pendientes')}
                        className={`px-6 py-2 text-sm font-medium ${filtroActual === 'pendientes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => cambiarFiltro('tomadas')}
                        className={`px-6 py-2 rounded-r text-sm font-medium ${filtroActual === 'tomadas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Tomadas
                    </button>
                </div>

                <button
                    onClick={cargarSolicitudes}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                </button>
            </div>

            {/* Mostrar error si existe */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="text-yellow-800">
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Título principal */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
                    <span className="text-green-600 mr-2">🧪</span>
                    SOLICITUDES DE LABORATORIO - {filtroActual.toUpperCase()}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Sistema de gestión hospitalaria con paginación
                </p>
            </div>

            {/* Tablas por categoría con paginación */}
            {renderTablaCategoria('urgentes', solicitudesData.urgentes, 'URGENTES', 'bg-red-600')}
            {renderTablaCategoria('prioritario', solicitudesData.prioritario, 'PRIORITARIAS', 'bg-yellow-500')}
            {renderTablaCategoria('rutinario', solicitudesData.rutinario, 'RUTINARIAS', 'bg-green-600')}
        </div>
    );
};

export default ExamenesTable;
