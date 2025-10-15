import React, { useState, useCallback } from 'react';
import { API_CONFIG } from '../../config/api';
import ConfirmDialog from './ConfirmDialog';
import {
    ChevronDown,
    ChevronRight,
    Check,
    RefreshCw,
    MapPin,
    TestTube,
    Database,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    CheckCircle2,
    Search,
    X
} from 'lucide-react';
import { useSolicitudes } from '../../hook/useSolicitudes';

// Componente de input de filtro
const InputFiltro = ({ campo, placeholder, valor, onChange, ancho = "w-full" }) => (
    <div className={`relative ${ancho}`}>
        <input
            type="text"
            placeholder={placeholder}
            value={valor}
            onChange={(e) => {
                e.stopPropagation();
                onChange(campo, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            // ESTILOS
            className="w-full px-2 py-1.5 text-sm font-medium text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-gray-400 transition-all duration-200 shadow-sm"
        />
        {valor && (
            <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    onChange(campo, '');
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-0.5 bg-white rounded"
                type="button"
                tabIndex={-1}
            >
                <X className="w-3 h-3" />
            </button>
        )}
    </div>
);

const ExamenesTable = () => {
    const [expandedPatients, setExpandedPatients] = useState({});
    const [checkedExams, setCheckedExams] = useState({});
    const [filtroActual, setFiltroActual] = useState('actuales');
    // estados para confirmación
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    // Estados para los filtros de búsqueda
    const [filtros, setFiltros] = useState({
        historia: '',
        paciente: '',
        ingreso: '',
        folio: '',
        area: ''
    });
    const [filtrosActivos, setFiltrosActivos] = useState(false);

    const USAR_DATOS_PRUEBA = API_CONFIG.USE_TEST_DATA;

    //console.log('🧪 Modo de datos:', USAR_DATOS_PRUEBA ? 'PRUEBA' : 'PRODUCCIÓN');

    // Usar el custom hook
    const {
        solicitudesData,
        loading,
        error,
        cargarSolicitudes,
        expandirPaciente,
        paginateData,
        changePage,
        currentPage,
        itemsPerPage,
        marcarExamenIndividual,
        marcarTodosLosExamenes
    } = useSolicitudes(filtroActual, USAR_DATOS_PRUEBA, 300000); // Polling cada 5 minutos

    const togglePatient = async (categoria, pacienteIndex) => {
        const key = `${categoria}-${pacienteIndex}`;
        const isCurrentlyExpanded = expandedPatients[key];

        setExpandedPatients(prev => ({
            ...prev,
            [key]: !prev[key]
        }));

        // Si se está expandiendo y el paciente no tiene exámenes detallados, cargarlos
        if (!isCurrentlyExpanded) {
            const paciente = solicitudesData[categoria][pacienteIndex];
            if (paciente && !paciente.examenesDetallados) {
                console.log(`🔄 Expandiendo paciente: ${paciente.paciente}, cargando exámenes...`);
            }
        }
    };

    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return 'No disponible';

        const fecha = new Date(fechaISO);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();
        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');

        return `${dia}/${mes}/${año} ${horas}:${minutos}`;
    };

    // Función para manejar cambios en los filtros
    const handleFiltroChange = useCallback((campo, valor) => {
        setFiltros(prev => {
            const newFiltros = {
                ...prev,
                [campo]: valor
            };

            // Verificar si hay filtros activos
            const tienesFiltros = Object.values(newFiltros).some(filtro => filtro.trim() !== '');
            setFiltrosActivos(tienesFiltros);

            return newFiltros;
        });
    }, []);

    // Función para limpiar todos los filtros
    const limpiarFiltros = useCallback(() => {
        setFiltros({
            historia: '',
            paciente: '',
            ingreso: '',
            folio: '',
            area: ''
        });
        setFiltrosActivos(false);
    }, []);

    // FUNCIÓN PARA NORMALIZAR TEXTO (quitar tildes y convertir a minúsculas)
    const normalizarTexto = (texto) => {
        if (!texto) return '';
        return texto
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remover tildes
            .trim();
    };

    // Función para filtrar los datos
    const filtrarDatos = useCallback((solicitudes) => {
        if (!filtrosActivos) return solicitudes;

        return solicitudes.filter(solicitud => {
            // Normalizar datos de la solicitud
            const historia = normalizarTexto(solicitud.historia);
            const paciente = normalizarTexto(solicitud.paciente);
            const ingreso = normalizarTexto(solicitud.ingreso);
            const folio = normalizarTexto(solicitud.folio);
            const area = normalizarTexto(solicitud.areaSolicitante);

            // Normalizar filtros
            const filtroHistoria = normalizarTexto(filtros.historia);
            const filtroPaciente = normalizarTexto(filtros.paciente);
            const filtroIngreso = normalizarTexto(filtros.ingreso);
            const filtroFolio = normalizarTexto(filtros.folio);
            const filtroArea = normalizarTexto(filtros.area);

            return (
                (!filtroHistoria || historia.includes(filtroHistoria)) &&
                (!filtroPaciente || paciente.includes(filtroPaciente)) &&
                (!filtroIngreso || ingreso.includes(filtroIngreso)) &&
                (!filtroFolio || folio.includes(filtroFolio)) &&
                (!filtroArea || area.includes(filtroArea))
            );
        });
    }, [filtrosActivos, filtros]);

    // Función para marcar/desmarcar todos los exámenes de un paciente
    const toggleAllExams = async (categoria, pacienteIndex, examenes, solicitud) => {
        // No permitir cambios en "tomadas"
        if (filtroActual === 'tomadas') return;

        const baseKey = `${categoria}-${pacienteIndex}`;
        const allExamKeys = examenes.map((_, examIndex) => `${baseKey}-exam-${examIndex}`);
        const allChecked = allExamKeys.every(key => checkedExams[key]);

        if (!allChecked) {
            // Mostrar confirmación antes de marcar como tomados
            setConfirmAction({
                type: 'all',
                categoria,
                pacienteIndex,
                examenes,
                solicitud,
                allExamKeys,
                message: `¿Está seguro de marcar TODOS los exámenes (${examenes.length}) del paciente ${solicitud.paciente} como tomados?`,
                title: 'Confirmar exámenes tomados'
            });
            setShowConfirm(true);
        } else {
            // Solo desmarcar localmente (no enviar al backend)
            setCheckedExams(prev => {
                const newState = { ...prev };
                allExamKeys.forEach(key => {
                    delete newState[key];
                });
                return newState;
            });
        }
    };

    // Función para marcar/desmarcar un examen individual
    const toggleSingleExam = async (categoria, pacienteIndex, examIndex, solicitud) => {
        // No permitir cambios en "tomadas"
        if (filtroActual === 'tomadas') return;

        const examKey = `${categoria}-${pacienteIndex}-exam-${examIndex}`;
        const wasChecked = checkedExams[examKey];
        const nombreExamen = solicitud.examenes[examIndex];

        if (!wasChecked) {
            // Mostrar confirmación antes de marcar como tomado
            setConfirmAction({
                type: 'single',
                categoria,
                pacienteIndex,
                examIndex,
                solicitud,
                examKey,
                message: `¿Está seguro de marcar el examen "${nombreExamen}" del paciente ${solicitud.paciente} como tomado?`,
                title: 'Confirmar examen tomado'
            });
            setShowConfirm(true);
        } else {
            // Solo desmarcar localmente (no enviar al backend)
            setCheckedExams(prev => {
                const newState = { ...prev };
                delete newState[examKey];
                return newState;
            });
        }
    };

    // FUNCIÓN para ejecutar la acción confirmada
    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        setIsProcessing(true);
        setShowConfirm(false);

        try {
            if (confirmAction.type === 'all') {
                // Marcar como checked localmente primero
                setCheckedExams(prev => {
                    const newState = { ...prev };
                    confirmAction.allExamKeys.forEach(key => {
                        newState[key] = true;
                    });
                    return newState;
                });

                // Enviar todos los exámenes al backend
                const result = await marcarTodosLosExamenes(confirmAction.solicitud);

                if (!result.success) {
                    // Revertir cambios locales si falla
                    setCheckedExams(prev => {
                        const newState = { ...prev };
                        confirmAction.allExamKeys.forEach(key => {
                            delete newState[key];
                        });
                        return newState;
                    });
                    alert(`Error al guardar exámenes: ${result.error}`);
                } else {
                    console.log('✅ Todos los exámenes marcados como tomados exitosamente');
                }

            } else if (confirmAction.type === 'single') {
                // Marcar como checked localmente primero
                setCheckedExams(prev => ({
                    ...prev,
                    [confirmAction.examKey]: true
                }));

                // Enviar examen individual al backend
                const result = await marcarExamenIndividual(confirmAction.solicitud, confirmAction.examIndex);

                if (!result.success) {
                    // Revertir si falla
                    setCheckedExams(prev => {
                        const newState = { ...prev };
                        delete newState[confirmAction.examKey];
                        return newState;
                    });
                    alert(`Error al guardar examen: ${result.error}`);
                } else {
                    console.log('✅ Examen marcado como tomado exitosamente');
                }
            }

        } catch (error) {
            console.error('Error procesando acción:', error);
            alert(`Error inesperado: ${error.message}`);
        } finally {
            setIsProcessing(false);
            setConfirmAction(null);
        }
    };

    // FUNCIÓN para cancelar la acción
    const handleCancelAction = () => {
        setShowConfirm(false);
        setConfirmAction(null);
    };

    // Verificar si todos los exámenes están marcados
    const areAllExamsChecked = (categoria, pacienteIndex, examenes) => {
        // En "tomadas", todos los exámenes están completados
        if (filtroActual === 'tomadas') return true;

        const baseKey = `${categoria}-${pacienteIndex}`;
        const allExamKeys = examenes.map((_, examIndex) => `${baseKey}-exam-${examIndex}`);
        return allExamKeys.every(key => checkedExams[key]);
    };

    // Verificar si un examen individual está marcado
    const isExamChecked = (categoria, pacienteIndex, examIndex) => {
        // En "tomadas", todos los exámenes están completados
        if (filtroActual === 'tomadas') return true;

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

    // Componente de paginación
    const Pagination = ({ categoria, paginationData }) => {
        const { totalPages, currentPage: page, totalItems } = paginationData;

        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
                <div className="text-sm text-gray-700">
                    Mostrando {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, totalItems)} de {totalItems} registros
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => changePage(categoria, 1)}
                        disabled={page === 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Primera página"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => changePage(categoria, page - 1)}
                        disabled={page === 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Página anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex space-x-1">
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNum = index + 1;
                            return (
                                <button
                                    key={`${categoria}-page-${pageNum}`}
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

                    <button
                        onClick={() => changePage(categoria, page + 1)}
                        disabled={page === totalPages}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Página siguiente"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

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
        const solicitudesFiltradas = filtrarDatos(solicitudes);
        const paginationData = paginateData(solicitudesFiltradas, categoria);
        const isTomadas = filtroActual === 'tomadas';

        return (
            <div className="mb-8">
                <div className={`${colorHeader} text-white px-4 py-2 rounded-t-lg font-bold text-lg flex items-center justify-between`}>
                    <div className="flex items-center">
                        {titulo}
                        {isTomadas && <CheckCircle2 className="w-5 h-5 ml-2" />}
                    </div>
                    {/* Indicador de filtros activos DENTRO del header */}
                    {filtrosActivos && (
                        <div className="flex items-center space-x-2">
                            <Search className="w-4 h-4" />
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">
                                {solicitudesFiltradas.length} de {solicitudes.length}
                            </span>
                            <button
                                onClick={limpiarFiltros}
                                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded flex items-center"
                            >
                                <X className="w-3 h-3 mr-1" />
                                Limpiar
                            </button>
                        </div>
                    )}
                </div>

                {paginationData.items.length === 0 && solicitudes.length > 0 && filtrosActivos ? (
                    <div className="bg-white shadow-lg rounded-b-lg p-8 text-center text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No se encontraron resultados con los filtros aplicados</p>
                        <button
                            onClick={limpiarFiltros}
                            className="mt-2 text-blue-600 hover:underline text-sm"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                ) : paginationData.items.length === 0 ? (
                    <div className="bg-white shadow-lg rounded-b-lg p-8 text-center text-gray-500">
                        <TestTube className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No hay solicitudes {titulo.toLowerCase()} en este momento</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-lg rounded-b-lg overflow-hidden">
                        {/* Headers con filtros */}
                        <div className="bg-gray-800 text-white">
                            {/* Fila de títulos */}
                            <div className={`grid ${isTomadas ? 'grid-cols-18' : 'grid-cols-17'} gap-1 px-4 py-3 font-semibold text-sm bg-gray-800`}>
                                <div className="col-span-1 flex items-center">
                                    <Database className="w-4 h-4 mr-1" />
                                    Historia
                                </div>
                                <div className="col-span-3 flex items-center">
                                    <span className="w-4 h-4 mr-1">👤</span>
                                    Paciente
                                </div>
                                <div className="col-span-1 text-center">Edad</div>
                                <div className="col-span-1 flex items-center justify-center">
                                    <span className="w-4 h-4 mr-1">🏥</span>
                                    Ingreso
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                    <span className="w-4 h-4 mr-1">📄</span>
                                    Folio
                                </div>
                                <div className="col-span-2 flex items-center justify-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    Cama
                                </div>
                                <div className="col-span-2 flex items-center ">
                                    <TestTube className="w-4 h-4 mr-1" />
                                    Exámenes
                                </div>
                                <div className="col-span-2 flex items-center">
                                    <span className="w-4 h-4 mr-1">📅</span>
                                    Fecha Solicitud
                                </div>
                                {/* fecha para tomadas: */}
                                {isTomadas && (
                                    <div className="col-span-2 flex items-center">
                                        <span className="w-4 h-4 mr-1">📅</span>
                                        Fecha Tomado
                                    </div>
                                )}
                                <div className="col-span-3 flex items-center">
                                    <span className="w-4 h-4 mr-1">🏢</span>
                                    Área Solicitante
                                </div>
                                {!isTomadas && <div className="col-span-1 text-center">Acciones</div>}
                            </div>

                            {/* Fila de filtros */}
                            <div className={`grid ${isTomadas ? 'grid-cols-18' : 'grid-cols-17'} gap-2 px-4 py-4 bg-gradient-to-r from-gray-700 to-gray-600 border-t border-gray-600`}>
                                <div className="col-span-1">
                                    <InputFiltro
                                        campo="historia"
                                        placeholder="Historia..."
                                        valor={filtros.historia}
                                        onChange={handleFiltroChange}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <InputFiltro
                                        campo="paciente"
                                        placeholder="Nombre Paciente..."
                                        valor={filtros.paciente}
                                        onChange={handleFiltroChange}
                                    />
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                    <span className="text-xs text-gray-300">-</span>
                                </div>
                                <div className="col-span-1">
                                    <InputFiltro
                                        campo="ingreso"
                                        placeholder="N° Ingreso..."
                                        valor={filtros.ingreso}
                                        onChange={handleFiltroChange}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <InputFiltro
                                        campo="folio"
                                        placeholder="N° Folio..."
                                        valor={filtros.folio}
                                        onChange={handleFiltroChange}
                                    />
                                </div>
                                <div className="col-span-2 flex items-center justify-center">
                                    <span className="text-xs text-gray-300">-</span>
                                </div>
                                {/* 2 columnas para exámenes */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <span className="text-xs text-gray-300">-</span>
                                </div>
                                {/* 2 columnas para fecha */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <span className="text-xs text-gray-300">-</span>
                                </div>
                                {/* AGREGAR: 2 columnas para fecha tomado - solo para tomadas */}
                                {isTomadas && (
                                    <div className="col-span-2 flex items-center justify-center">
                                        <span className="text-xs text-gray-300">-</span>
                                    </div>
                                )}
                                <div className="col-span-3">
                                    <InputFiltro
                                        campo="area"
                                        placeholder="Área solicitante..."
                                        valor={filtros.area}
                                        onChange={handleFiltroChange}
                                    />
                                </div>
                                {!isTomadas && (
                                    <div className="col-span-1 flex items-center justify-center">
                                        {filtrosActivos && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    limpiarFiltros();
                                                }}
                                                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center transition-colors"
                                                title="Limpiar todos los filtros"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contenido */}
                        <div className="divide-y divide-gray-200">
                            {paginationData.items.map((solicitud, index) => {
                                const pacienteKey = `${categoria}-${index}`;
                                const isExpanded = expandedPatients[pacienteKey];
                                const allExamsChecked = areAllExamsChecked(categoria, index, solicitud.examenes);

                                return (
                                    <div key={`${categoria}-${solicitud.id}-${index}`}>
                                        {/* Fila del paciente */}
                                        <div
                                            className={`grid ${isTomadas ? 'grid-cols-18' : 'grid-cols-17'} gap-1 px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${isTomadas ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}`}
                                            onClick={() => togglePatient(categoria, index)}
                                        >
                                            <div className="col-span-1 font-medium text-sm">{solicitud.historia}</div>
                                            <div className="col-span-3 font-medium text-sm flex items-center">
                                                {isExpanded ?
                                                    <ChevronDown className="w-4 h-4 mr-1 flex-shrink-0" /> :
                                                    <ChevronRight className="w-4 h-4 mr-1 flex-shrink-0" />
                                                }
                                                <span className="truncate text-sm">{solicitud.paciente}</span>
                                            </div>
                                            <div className="col-span-1 text-sm font-medium text-gray-700">
                                                {solicitud.edad} años
                                            </div>
                                            <div className="col-span-1 text-sm font-medium text-blue-500">
                                                {solicitud.ingreso}
                                            </div>
                                            <div className="col-span-1 text-sm font-medium text-blue-800">
                                                {solicitud.folio}
                                            </div>
                                            <div className="col-span-2 text-sm">
                                                <div className="flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1 text-gray-500 flex-shrink-0" />
                                                    <span className="text-xs leading-tight" title={solicitud.cama}>
                                                        {solicitud.cama}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <TestTube className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0" />
                                                    {isTomadas ? (
                                                        // En pestaña TOMADOS: mostrar cantidad exámenes tomados
                                                        <span>
                                                            {solicitud.cantidadExamenes || solicitud.examenes.length} examen{(solicitud.cantidadExamenes || solicitud.examenes.length) !== 1 ? 'es' : ''} tomado{(solicitud.cantidadExamenes || solicitud.examenes.length) !== 1 ? 's' : ''}
                                                            <span className="ml-1 text-green-600 font-semibold">✓</span>
                                                        </span>
                                                    ) : (
                                                        // En pestaña ACTUALES: mostrar pendientes y tomados
                                                        <span>
                                                            {solicitud.cantidadPendientes || 0} pendiente{(solicitud.cantidadPendientes || 0) !== 1 ? 's' : ''}
                                                            {solicitud.cantidadTomados > 0 && (
                                                                <span className="text-green-600 ml-1">
                                                                    ({solicitud.cantidadTomados} tomado{solicitud.cantidadTomados !== 1 ? 's' : ''})
                                                                </span>
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-sm">
                                                {formatearFecha(solicitud.fechaSolicitud)}
                                            </div>
                                            {/* Fecha Tomado - 2 columnas - solo para tomadas */}
                                            {isTomadas && (
                                                <div className="col-span-2 text-sm">
                                                    {solicitud.fechaTomado ? formatearFecha(solicitud.fechaTomado) :
                                                        solicitud.FechaTomado ? formatearFecha(solicitud.FechaTomado) :
                                                            'No disponible'}
                                                </div>
                                            )}
                                            <div className="col-span-3 text-xs text-gray-600">
                                                <span className="truncate block">{solicitud.areaSolicitante}</span>
                                            </div>

                                            {/* Columna de acciones solo si NO es "tomadas" */}
                                            {!isTomadas && (
                                                <div className="col-span-1 flex space-x-1 justify-center">
                                                    <button
                                                        className={`p-1 ${allExamsChecked ? 'text-green-800 bg-green-100' : 'text-green-600 hover:text-green-800'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleAllExams(categoria, index, solicitud.examenes, solicitud);
                                                        }}
                                                        disabled={isProcessing}
                                                        title={allExamsChecked ? "Desmarcar todos los exámenes" : "Marcar todos los exámenes como tomados"}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Lista de exámenes expandible */}
                                        {isExpanded && (
                                            <div className="bg-gray-50">
                                                <div className="px-4 py-2 border-l-4 border-gray-300 ml-4">
                                                    <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                                        {isTomadas ? (
                                                            // En TOMADOS: mostrar tomados
                                                            <>
                                                                Exámenes de laboratorio realizados ({solicitud.cantidadExamenes || solicitud.examenes.length})
                                                                <span className="ml-2 text-green-600 text-xs bg-green-100 px-2 py-1 rounded">COMPLETADOS</span>
                                                            </>
                                                        ) : (
                                                            // En ACTUALES: mostrar total con estado
                                                            <>
                                                                Exámenes de laboratorio solicitados ({solicitud.cantidadExamenes || 0})
                                                                {solicitud.cantidadTomados > 0 && (
                                                                    <span className="ml-2 text-green-600 text-xs bg-green-100 px-2 py-1 rounded">
                                                                        {solicitud.cantidadTomados} COMPLETADO{solicitud.cantidadTomados !== 1 ? 'S' : ''}
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {(solicitud.examenesConEstado || solicitud.examenes.map(ex => ({ nombre: ex, tomado: isTomadas }))).map((examen, examIndex) => {
                                                            const isChecked = isTomadas ? true : (examen.tomado || isExamChecked(categoria, index, examIndex));
                                                            const nombreExamen = examen.nombre || examen;

                                                            return (
                                                                <div key={`${categoria}-${solicitud.id}-${index}-exam-${examIndex}`}
                                                                    className={`flex items-center justify-between rounded p-2 shadow-sm ${isTomadas ? 'bg-green-50 border border-green-200' :
                                                                        (isChecked ? 'bg-green-50 border border-green-200 opacity-60' : 'bg-white')
                                                                        }`}>
                                                                    <div className="flex items-center">
                                                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mr-3 flex-shrink-0 ${isChecked ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-800'
                                                                            }`}>
                                                                            {examIndex + 1}
                                                                        </span>
                                                                        <span className={`text-sm ${isTomadas ? 'text-gray-800' : // En TOMADOS: texto normal, sin tachado
                                                                            (isChecked ? 'text-gray-500 line-through' : 'text-gray-800') // En ACTUALES: tachado si está completado
                                                                            }`}>
                                                                            {nombreExamen}
                                                                        </span>
                                                                        {isChecked && (
                                                                            <span className="ml-2 text-xs text-green-600 font-semibold">
                                                                                ✓ {isTomadas ? 'Realizado' : 'Completado'}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Botones de acción solo para exámenes pendientes en ACTUALES */}
                                                                    {!isTomadas && !examen.tomado && (
                                                                        <div className="flex space-x-1">
                                                                            <button
                                                                                className={`p-1 ${isChecked ? 'text-green-800 bg-green-200' : 'text-green-600 hover:text-green-800'
                                                                                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleSingleExam(categoria, index, examIndex, solicitud);
                                                                                }}
                                                                                disabled={isProcessing}
                                                                                title={isChecked ? "Marcar como pendiente" : "Marcar como tomado"}
                                                                            >
                                                                                <Check className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    {/* Para TOMADOS, mostrar solo indicador visual */}
                                                                    {isTomadas && (
                                                                        <div className="flex space-x-1">
                                                                            <CheckCircle2 className="w-5 h-5 text-green-600" title="Examen realizado" />
                                                                        </div>
                                                                    )}
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
                    {/* <button
                        onClick={() => cambiarFiltro('pendientes')}
                        className={`px-6 py-2 text-sm font-medium ${filtroActual === 'pendientes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Pendientes
                    </button> */}
                    <button
                        onClick={() => cambiarFiltro('tomadas')}
                        className={`px-6 py-2 rounded-r text-sm font-medium flex items-center ${filtroActual === 'tomadas' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Tomadas
                        {filtroActual === 'tomadas' && <CheckCircle2 className="w-4 h-4 ml-1" />}
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
                    {filtroActual === 'tomadas' && <CheckCircle2 className="w-6 h-6 ml-2 text-green-600" />}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Sistema de gestión Laboratorio Hospital San José Popayán
                    {filtroActual === 'tomadas' && ' - Exámenes completados'}
                </p>
            </div>
            {/* MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-[9]">
                    <ConfirmDialog
                        isOpen={showConfirm}
                        onClose={handleCancelAction}
                        onConfirm={handleConfirmAction}
                        title={confirmAction?.title || ''}
                        message={confirmAction?.message || ''}
                        confirmText="Sí, marcar como tomado"
                        cancelText="Cancelar"
                    />
                </div>
            )}

            {/* Indicador de procesamiento */}
            {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg flex flex-col justify-center items-center gap-4">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-lg font-semibold text-gray-700">Guardando examen(es) tomado(s)...</span>
                    </div>
                </div>
            )}

            {/* Indicador global de filtros activos */}
            {filtrosActivos && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <Search className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">
                                    Filtros activos
                                </span>
                            </div>

                            {/* Mostrar filtros activos */}
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(filtros).map(([key, value]) => {
                                    if (!value.trim()) return null;
                                    const labels = {
                                        historia: 'Historia',
                                        paciente: 'Paciente',
                                        ingreso: 'Ingreso',
                                        folio: 'Folio',
                                        area: 'Área'
                                    };

                                    return (
                                        <span
                                            key={key}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200"
                                        >
                                            <strong>{labels[key]}:</strong>&nbsp;{value}
                                            <button
                                                onClick={() => handleFiltroChange(key, '')}
                                                className="ml-1 text-blue-600 hover:text-blue-800"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={limpiarFiltros}
                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1 rounded-md transition-all"
                        >
                            <X className="w-4 h-4" />
                            <span>Limpiar todos</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Tablas por categoría */}
            {renderTablaCategoria('urgentes', solicitudesData.urgentes, 'URGENTES', 'bg-red-600')}
            {renderTablaCategoria('prioritario', solicitudesData.prioritario, 'PRIORITARIAS', 'bg-yellow-500')}
            {renderTablaCategoria('rutinario', solicitudesData.rutinario, 'RUTINARIAS', 'bg-green-600')}
        </div>
    );
};

export default ExamenesTable;
