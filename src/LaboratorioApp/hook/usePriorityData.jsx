// hook/usePriorityData.js
import { useState, useEffect, useCallback } from 'react';
import SolicitudesService from '../Services/SolicitudesService';
import ExamenesTomadosService from '../Services/ExamenesTomadosService';

export const usePriorityData = (prioridad, filtroActual, onOpenModal) => {
    const [data, setData] = useState([]);
    const [patientExams, setPatientExams] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // FUNCIONES HELPER (definidas antes de usarse)
    function agruparPorPaciente(examenes, estado) {
        const pacientesAgrupados = {};

        // Filtrar por estadoResultado
        const examenesFiltrados = (examenes || []).filter(examen =>
            examen.estadoResultado === estado
        );

        examenesFiltrados.forEach(examen => {
            const historia = examen.historia;

            if (!pacientesAgrupados[historia]) {
                pacientesAgrupados[historia] = {
                    id: historia,
                    historia: historia,
                    paciente: examen.nomPaciente,
                    edad: examen.edad,
                    ingreso: examen.numeroIngreso,
                    folio: examen.numeroFolio,
                    cama: examen.cama,
                    nomCama: examen.nomCama || examen.cama,
                    areaSolicitante: examen.areaSolicitante,
                    prioridad: examen.prioridad,
                    fechaSolicitud: examen.fechaSolicitud,
                    fechaPendiente: examen.fechaPendiente,
                    fechaTomado: examen.fechaTomado,
                    responsable: examen.responsable,
                    cantidadExamenes: 0,
                    examenes: []
                };
            }

            pacientesAgrupados[historia].cantidadExamenes++;
            pacientesAgrupados[historia].examenes.push({
                nombre: examen.nomServicio,
                codigo: examen.codServicio,
                fechaPendiente: examen.fechaPendiente,
                fechaTomado: examen.fechaTomado,
                observaciones: examen.observaciones
            });

            if (estado === 'PENDIENTE' && examen.fechaPendiente) {
                // Tomar la fecha más reciente si hay múltiples exámenes
                if (!pacientesAgrupados[historia].fechaPendiente ||
                    new Date(examen.fechaPendiente) > new Date(pacientesAgrupados[historia].fechaPendiente)) {
                    pacientesAgrupados[historia].fechaPendiente = examen.fechaPendiente;
                }
            }
        });

        return Object.values(pacientesAgrupados);
    }

    function filtrarPorPrioridad(pacientes, prioridad) {
        console.log('🎯 Filtrando por prioridad:', prioridad);
        console.log('📊 Pacientes antes del filtro:', pacientes);

        const resultado = pacientes.filter(patient => {
            if (!patient.prioridad) return false;
            const patientPriority = patient.prioridad.toLowerCase();

            console.log(`👤 Paciente ${patient.historia}: prioridad="${patientPriority}"`);

            if (prioridad === 'urgentes') {
                const match = patientPriority.includes('urgente');
                console.log(`   🔍 Buscando "urgente" en "${patientPriority}": ${match}`);
                return match;
            }
            if (prioridad === 'prioritario') {
                // 🔥 CORREGIR: Buscar tanto "prioritaria" como "prioritario"  
                const match = patientPriority.includes('prioritaria') || patientPriority.includes('prioritario');
                console.log(`   🔍 Buscando "prioritaria/prioritario" en "${patientPriority}": ${match}`);
                return match;
            }
            if (prioridad === 'rutinario') {
                const match = patientPriority.includes('rutinario');
                console.log(`   🔍 Buscando "rutinario" en "${patientPriority}": ${match}`);
                return match;
            }

            return false;
        });

        console.log('✅ Pacientes después del filtro:', resultado);
        return resultado;
    }

    function crearRespuestaPaginada(data, page, size) {
        const start = page * size;
        const content = data.slice(start, start + size);

        return {
            content,
            totalElements: data.length,
            totalPages: Math.ceil(data.length / size),
            size,
            number: page,
            first: page === 0,
            last: page >= Math.ceil(data.length / size) - 1
        };
    }

    function getExamStatus(nombreExamen, tomados, pendientes) {
        if (tomados.some(t => t.nomServicio === nombreExamen)) return 'tomado';
        if (pendientes.some(p => p.nomServicio === nombreExamen)) return 'pendiente';
        return 'disponible';
    }

    // FUNCIÓN PRINCIPAL loadData
    const loadData = useCallback(async (page = 0) => {
        setLoading(true);
        setError(null);

        try {
            // 🔥 INICIALIZAR response con valores por defecto
            let response = {
                content: [],
                totalElements: 0,
                totalPages: 0
            };

            if (filtroActual === 'actuales') {
                // ACTUALES: Solo pacientes de API externa
                let solicitudesData;

                if (prioridad === 'urgentes') {
                    solicitudesData = await SolicitudesService.getResumenPacientesUrgentes(page, pageSize);
                } else if (prioridad === 'prioritario') {
                    solicitudesData = await SolicitudesService.getResumenPacientesPrioritarios(page, pageSize);
                } else {
                    solicitudesData = await SolicitudesService.getResumenPacientesRutinarios(page, pageSize);
                }

                const content = solicitudesData.content || solicitudesData || [];

                // 🔥 FILTRAR pacientes que YA NO tienen exámenes disponibles
                const pacientesConExamenesDisponibles = [];

                for (let patient of content) {
                    try {
                        // Obtener exámenes de API externa para este paciente
                        const examsFromAPI = await SolicitudesService.getExamenesPaciente(patient.historia);

                        // Obtener exámenes procesados localmente
                        const allLocal = await ExamenesTomadosService.getExamenesPorHistoria(patient.historia);
                        const tomados = allLocal.filter(e => e.estadoResultado === 'COMPLETADO');
                        const pendientes = allLocal.filter(e => e.estadoResultado === 'PENDIENTE');

                        // Verificar si tiene al menos UN examen disponible
                        const tieneExamenesDisponibles = examsFromAPI.some(exam => {
                            const estado = getExamStatus(exam.nombre, tomados, pendientes);
                            return estado === 'disponible';
                        });

                        if (tieneExamenesDisponibles) {
                            // Actualizar contador de exámenes disponibles
                            const examenesDisponibles = examsFromAPI.filter(exam => {
                                const estado = getExamStatus(exam.nombre, tomados, pendientes);
                                return estado === 'disponible';
                            }).length;

                            pacientesConExamenesDisponibles.push({
                                ...patient,
                                cantidadExamenes: examenesDisponibles // 🔥 Solo contar disponibles
                            });
                        }
                        // Si no tiene exámenes disponibles, NO se agrega a la lista

                    } catch (error) {
                        console.warn(`Error verificando exámenes para paciente ${patient.historia}:`, error);
                        // En caso de error, incluir el paciente para no perder datos
                        pacientesConExamenesDisponibles.push(patient);
                    }
                }

                console.log(`📊 Filtrado: ${content.length} → ${pacientesConExamenesDisponibles.length} pacientes con exámenes disponibles`);

                response = {
                    content: pacientesConExamenesDisponibles,
                    totalElements: pacientesConExamenesDisponibles.length,
                    totalPages: Math.ceil(pacientesConExamenesDisponibles.length / pageSize)
                };

            } else if (filtroActual === 'pendientes') {
                try {
                    const allData = await ExamenesTomadosService.getExamenesTomados();
                    console.log('📊 Datos pendientes obtenidos:', allData?.length || 0);

                    const pacientesAgrupados = agruparPorPaciente(allData, 'PENDIENTE');
                    console.log('👥 Pacientes agrupados pendientes:', pacientesAgrupados?.length || 0);

                    const filtrados = filtrarPorPrioridad(pacientesAgrupados, prioridad);
                    console.log('🎯 Pacientes filtrados pendientes:', filtrados?.length || 0);

                    response = crearRespuestaPaginada(filtrados, page, pageSize);
                    console.log('📄 Response pendientes:', response);

                } catch (error) {
                    console.error('Error procesando pendientes:', error);
                    // response ya tiene valores por defecto
                }

            } else if (filtroActual === 'tomadas') {
                try {
                    const allData = await ExamenesTomadosService.getExamenesTomados();
                    console.log('📊 Datos tomadas obtenidos:', allData?.length || 0);

                    const pacientesAgrupados = agruparPorPaciente(allData, 'COMPLETADO');
                    console.log('👥 Pacientes agrupados tomadas:', pacientesAgrupados?.length || 0);

                    const filtrados = filtrarPorPrioridad(pacientesAgrupados, prioridad);
                    console.log('🎯 Pacientes filtrados tomadas:', filtrados?.length || 0);

                    response = crearRespuestaPaginada(filtrados, page, pageSize);
                    console.log('📄 Response tomadas:', response);

                } catch (error) {
                    console.error('Error procesando tomadas:', error);
                    // response ya tiene valores por defecto
                }
            }

            setData(response.content || []);
            setTotalElements(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
            setCurrentPage(page);

        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [prioridad, filtroActual, pageSize]);

    // CARGAR EXÁMENES SOLO AL HACER CLIC (Solo en actuales)
    const loadPatientExams = useCallback(async (patientId) => {
        try {
            const patient = data.find(p => p.id === patientId);
            const historia = patient?.historia;

            console.log('🔍 LoadPatientExams - Filtro:', filtroActual, 'Historia:', historia, 'Patient:', patient);

            if (filtroActual === 'actuales') {
                // 🔥 CORREGIR: Cargar exámenes de API externa
                const exams = await SolicitudesService.getExamenesPaciente(historia);
                console.log('📋 Exámenes de API externa:', exams);

                if (!exams || exams.length === 0) {
                    console.log('❌ No hay exámenes de API externa para historia', historia);
                    setPatientExams(prev => ({ ...prev, [patientId]: [] }));
                    return;
                }

                // Comparar con base local
                const allLocal = await ExamenesTomadosService.getExamenesPorHistoria(historia);
                console.log('📊 Exámenes locales encontrados:', allLocal);

                const tomados = allLocal.filter(e => e.estadoResultado === 'COMPLETADO');
                const pendientes = allLocal.filter(e => e.estadoResultado === 'PENDIENTE');

                // Marcar estado de cada examen
                const examsWithStatus = exams.map(exam => {
                    const estado = getExamStatus(exam.nombre, tomados, pendientes);
                    console.log(`🎯 Examen: ${exam.nombre} - Estado: ${estado}`);

                    return {
                        ...exam,
                        estado: estado
                    };
                });

                console.log('✅ Exámenes procesados para actuales:', examsWithStatus);

                setPatientExams(prev => ({
                    ...prev,
                    [patientId]: examsWithStatus
                }));

            } else {
                // Para pendientes/tomadas - usar los exámenes ya agrupados
                const allLocal = await ExamenesTomadosService.getExamenesPorHistoria(historia);
                const filtroEstado = filtroActual === 'pendientes' ? 'PENDIENTE' : 'COMPLETADO';
                const examenesDelPaciente = allLocal.filter(e => e.estadoResultado === filtroEstado);

                console.log(`📋 Exámenes ${filtroActual}:`, examenesDelPaciente);

                const examsWithStatus = examenesDelPaciente.map((exam, index) => ({
                    id: exam.id,
                    realId: exam.id,
                    nombre: exam.nomServicio,
                    codigo: exam.codServicio,
                    fechaTomado: exam.fechaTomado,
                    fechaPendiente: exam.fechaPendiente,
                    observaciones: exam.observaciones,
                    estado: filtroActual === 'pendientes' ? 'pendiente' : 'tomado'
                }));

                setPatientExams(prev => ({
                    ...prev,
                    [patientId]: examsWithStatus
                }));
            }

        } catch (err) {
            console.error('❌ Error loading patient exams:', err);
            setPatientExams(prev => ({ ...prev, [patientId]: [] }));
        }
    }, [data, filtroActual]);

    // MARCAR COMO PENDIENTE (Solo en actuales)
    const markExamAsPending = useCallback(async (patient, examIndex) => {
        // Función para procesar con observaciones
        const procesarConObservaciones = async (observaciones) => {
            try {
                if (examIndex === 'all') {
                    const exams = patientExams[patient.id] || [];
                    const disponibles = exams.filter(ex => ex.estado === 'disponible');

                    for (let exam of disponibles) {
                        const payload = {
                            historia: patient.historia,
                            nomPaciente: patient.paciente,
                            numeroIngreso: String(patient.ingreso),
                            numeroFolio: String(patient.folio),
                            codServicio: exam.id,
                            nomServicio: exam.nombre,
                            estadoResultado: 'PENDIENTE',
                            fechaPendiente: new Date().toISOString(),
                            edad: patient.edad,
                            cama: patient.cama,
                            nomCama: patient.cama,
                            areaSolicitante: patient.areaSolicitante,
                            prioridad: patient.prioridad,
                            fechaSolicitud: patient.fechaSolicitud,
                            responsable: 'Sistema Web',
                            observaciones: observaciones
                        };

                        await ExamenesTomadosService.crearExamenPendiente(payload);
                    }

                    // REFRESH
                    await loadData(currentPage);

                    // Limpiar exámenes expandidos para que se recarguen
                    setPatientExams(prev => ({ ...prev, [patient.id]: undefined }));

                } else {
                    // Similar para individual
                    const exam = patientExams[patient.id][examIndex];
                    if (exam.estado !== 'disponible') return;

                    const payload = {
                        historia: patient.historia,
                        nomPaciente: patient.paciente,
                        numeroIngreso: String(patient.ingreso),
                        numeroFolio: String(patient.folio),
                        codServicio: exam.id,
                        nomServicio: exam.nombre,
                        estadoResultado: 'PENDIENTE',
                        fechaPendiente: new Date().toISOString(),
                        edad: patient.edad,
                        cama: patient.cama,
                        nomCama: patient.cama,
                        areaSolicitante: patient.areaSolicitante,
                        prioridad: patient.prioridad,
                        fechaSolicitud: patient.fechaSolicitud,
                        responsable: 'Sistema Web',
                        observaciones: observaciones
                    };

                    await ExamenesTomadosService.crearExamenPendiente(payload);

                    // REFRESH 
                    await loadData(currentPage);
                    setPatientExams(prev => ({ ...prev, [patient.id]: undefined }));
                }

            } catch (err) {
                console.error('Error marking exam as pending:', err);
                alert('Error al marcar como pendiente: ' + err.message);
            }
        };

        // ABRIR MODAL
        onOpenModal(
            'Marcar como Pendiente',
            'Observaciones para marcar como pendiente (opcional)...',
            procesarConObservaciones
        );

    }, [patientExams, loadData, currentPage, onOpenModal]);

    // COMPLETAR EXAMEN (Solo en pendientes)
    const completarExamen = useCallback(async (patient, examIndex) => {
        const procesarConObservaciones = async (observaciones) => {
            try {
                if (examIndex === 'all') {
                    const exams = patientExams[patient.id] || [];
                    const pendientes = exams.filter(ex => ex.estado === 'pendiente');

                    for (let exam of pendientes) {
                        const payload = {
                            historia: patient.historia,
                            nomPaciente: patient.paciente,
                            edad: patient.edad,
                            numeroIngreso: patient.ingreso,
                            numeroFolio: patient.folio,
                            cama: patient.cama,
                            nomCama: patient.cama,
                            areaSolicitante: patient.areaSolicitante,
                            prioridad: patient.prioridad,
                            codServicio: exam.codigo,
                            nomServicio: exam.nombre,
                            fechaSolicitud: patient.fechaSolicitud,
                            responsable: 'Sistema Web',
                            estadoResultado: 'COMPLETADO',
                            fechaTomado: new Date().toISOString(),
                            observaciones: observaciones
                        };

                        await ExamenesTomadosService.actualizarExamenCompleto(exam.realId, payload);
                    }

                    // REFRESH
                    await loadData(currentPage);
                    setPatientExams(prev => ({ ...prev, [patient.id]: undefined }));

                } else {
                    // Similar para individual
                    const exam = patientExams[patient.id][examIndex];

                    const payload = {
                        historia: patient.historia,
                        nomPaciente: patient.paciente,
                        edad: patient.edad,
                        numeroIngreso: patient.ingreso,
                        numeroFolio: patient.folio,
                        cama: patient.cama,
                        nomCama: patient.cama,
                        areaSolicitante: patient.areaSolicitante,
                        prioridad: patient.prioridad,
                        codServicio: exam.codigo,
                        nomServicio: exam.nombre,
                        fechaSolicitud: patient.fechaSolicitud,
                        responsable: 'Sistema Web',
                        estadoResultado: 'COMPLETADO',
                        fechaTomado: new Date().toISOString(),
                        observaciones: observaciones
                    };

                    await ExamenesTomadosService.actualizarExamenCompleto(exam.realId, payload);

                    // REFRESH
                    await loadData(currentPage);
                    setPatientExams(prev => ({ ...prev, [patient.id]: undefined }));
                }
            } catch (err) {
                console.error('Error completando examen:', err);
                alert('Error al completar examen: ' + err.message);
            }
        };

        // ABRIR MODAL
        onOpenModal(
            'Completar Examen',
            'Observaciones para completar examen (opcional)...',
            procesarConObservaciones
        );

    }, [patientExams, loadData, currentPage, onOpenModal]);

    // función para volver a pendiente
    const marcarComoPendiente = useCallback(async (patient, examIndex) => {
        try {
            const pedirObservaciones = () => {
                const obs = prompt('Observaciones para volver a pendiente (opcional):');
                return obs === null ? '' : obs;
            };

            if (examIndex === 'all') {
                const exams = patientExams[patient.id] || [];
                const tomados = exams.filter(ex => ex.estado === 'tomado');
                const obs = pedirObservaciones();

                for (let exam of tomados) {
                    // ACTUALIZAR
                    await ExamenesTomadosService.actualizarExamen(exam.realId, {
                        estadoResultado: 'PENDIENTE',
                        fechaTomado: null, // Limpiar fecha_tomado
                        fechaPendiente: new Date().toISOString(),
                        observaciones: obs
                    });
                }

                setPatientExams(prev => ({
                    ...prev,
                    [patient.id]: prev[patient.id].map(exam =>
                        exam.estado === 'tomado' ? { ...exam, estado: 'pendiente' } : exam
                    )
                }));

                setTimeout(() => loadData(currentPage), 500);

            } else {
                const exam = patientExams[patient.id][examIndex];
                const obs = pedirObservaciones();

                // ACTUALIZAR
                await ExamenesTomadosService.actualizarExamen(exam.realId, {
                    estadoResultado: 'PENDIENTE',
                    fechaTomado: null,
                    fechaPendiente: new Date().toISOString(),
                    observaciones: obs
                });

                setPatientExams(prev => ({
                    ...prev,
                    [patient.id]: prev[patient.id].map((ex, idx) =>
                        idx === examIndex ? { ...ex, estado: 'pendiente' } : ex
                    )
                }));

                setTimeout(() => loadData(currentPage), 500);
            }
        } catch (err) {
            console.error('Error marcando como pendiente:', err);
            alert('Error al marcar como pendiente: ' + err.message);
        }
    }, [patientExams, loadData, currentPage]);

    // FUNCIONES DE PAGINACIÓN
    const goToPage = useCallback((page) => {
        if (page >= 0 && page < totalPages) {
            loadData(page);
        }
    }, [totalPages, loadData]);

    const nextPage = useCallback(() => {
        goToPage(currentPage + 1);
    }, [currentPage, goToPage]);

    const prevPage = useCallback(() => {
        goToPage(currentPage - 1);
    }, [currentPage, goToPage]);

    // CARGAR DATOS INICIALES
    useEffect(() => {
        loadData(0);
    }, [prioridad, filtroActual]);

    // RETURN - Exportar funciones
    return {
        data,
        patientExams,
        loading,
        error,
        refetch: () => loadData(currentPage),
        loadPatientExams,
        markExamAsPending,    //Para actuales
        completarExamen,    //Para pendientes
        marcarComoPendiente,
        currentPage,
        pageSize,
        totalElements,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        hasNextPage: currentPage < totalPages - 1,
        hasPrevPage: currentPage > 0
    };
};
