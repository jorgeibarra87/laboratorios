// hook/usePriorityData.js
import { useState, useEffect, useCallback } from 'react';
import SolicitudesService from '../Services/SolicitudesService';
import ExamenesTomadosService from '../Services/ExamenesTomadosService';

export const usePriorityData = (prioridad, filtroActual) => {
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
                fechaTomado: examen.fechaTomado
            });
        });

        return Object.values(pacientesAgrupados);
    }

    function filtrarPorPrioridad(pacientes, prioridad) {
        return pacientes.filter(patient => {
            if (!patient.prioridad) return false;
            const patientPriority = patient.prioridad.toLowerCase();

            if (prioridad === 'urgentes') return patientPriority.includes('urgente');
            if (prioridad === 'prioritario') return patientPriority.includes('prioritaria');
            if (prioridad === 'rutinario') return patientPriority.includes('rutinario');

            return false;
        });
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
            let response;

            if (filtroActual === 'actuales') {
                // ACTUALES: Solo pacientes de API externa
                if (prioridad === 'urgentes') {
                    response = await SolicitudesService.getResumenPacientesUrgentes(page, pageSize);
                } else if (prioridad === 'prioritario') {
                    response = await SolicitudesService.getResumenPacientesPrioritarios(page, pageSize);
                } else {
                    response = await SolicitudesService.getResumenPacientesRutinarios(page, pageSize);
                }

            } else if (filtroActual === 'pendientes') {
                // PENDIENTES: Solo de base local con estadoResultado PENDIENTE
                const allData = await ExamenesTomadosService.getExamenesTomados();
                const pacientesAgrupados = agruparPorPaciente(allData, 'PENDIENTE');
                const filtrados = filtrarPorPrioridad(pacientesAgrupados, prioridad);

                response = crearRespuestaPaginada(filtrados, page, pageSize);

            } else if (filtroActual === 'tomadas') {
                // TOMADAS: Solo de base local con estadoResultado COMPLETADO  
                const allData = await ExamenesTomadosService.getExamenesTomados();
                const pacientesAgrupados = agruparPorPaciente(allData, 'COMPLETADO');
                const filtrados = filtrarPorPrioridad(pacientesAgrupados, prioridad);

                response = crearRespuestaPaginada(filtrados, page, pageSize);
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

            if (filtroActual === 'actuales') {
                // ... código existente sin cambios
            } else {
                // Para pendientes/tomadas, obtener datos reales de BD
                const allLocal = await ExamenesTomadosService.getExamenesPorHistoria(historia);
                const filtroEstado = filtroActual === 'pendientes' ? 'PENDIENTE' : 'COMPLETADO';
                const examenesDelPaciente = allLocal.filter(e => e.estadoResultado === filtroEstado);

                const examsWithStatus = examenesDelPaciente.map((exam, index) => ({
                    id: exam.id, // ID real de la base de datos
                    realId: exam.id, // ID para actualización
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
            console.warn('Error loading patient exams:', err);
            setPatientExams(prev => ({ ...prev, [patientId]: [] }));
        }
    }, [data, filtroActual]);

    // MARCAR COMO PENDIENTE (Solo en actuales)
    const markExamAsPending = useCallback(async (patient, examIndex, observaciones = '') => {
        try {
            // Función helper para pedir observaciones
            const pedirObservaciones = () => {
                return prompt('Observaciones (opcional):') || '';
            };

            if (examIndex === 'all') {
                const exams = patientExams[patient.id] || [];
                const disponibles = exams.filter(ex => ex.estado === 'disponible');
                const obs = pedirObservaciones();

                for (let exam of disponibles) {
                    const payload = {
                        historia: patient.historia,
                        nomPaciente: patient.paciente,
                        numeroIngreso: String(patient.ingreso),
                        numeroFolio: String(patient.folio),
                        codServicio: exam.id,
                        nomServicio: exam.nombre,
                        estadoResultado: 'PENDIENTE',
                        // CORREGIR FECHA - fecha_pendiente, no fecha_tomado
                        fechaPendiente: new Date().toISOString(),
                        edad: patient.edad,
                        cama: patient.cama,
                        nomCama: patient.cama,
                        areaSolicitante: patient.areaSolicitante,
                        prioridad: patient.prioridad,
                        fechaSolicitud: patient.fechaSolicitud,
                        responsable: 'Sistema Web',
                        observaciones: obs // Agregar observaciones
                    };

                    await ExamenesTomadosService.crearExamenPendiente(payload);
                }

                setPatientExams(prev => ({
                    ...prev,
                    [patient.id]: prev[patient.id].map(exam =>
                        exam.estado === 'disponible' ? { ...exam, estado: 'pendiente' } : exam
                    )
                }));

            } else {
                const exam = patientExams[patient.id][examIndex];
                if (exam.estado !== 'disponible') return;

                const obs = observaciones || pedirObservaciones();

                const payload = {
                    historia: patient.historia,
                    nomPaciente: patient.paciente,
                    numeroIngreso: String(patient.ingreso),
                    numeroFolio: String(patient.folio),
                    codServicio: exam.id,
                    nomServicio: exam.nombre,
                    estadoResultado: 'PENDIENTE',
                    // 🔥 CORREGIR FECHA
                    fechaPendiente: new Date().toISOString(),
                    edad: patient.edad,
                    cama: patient.cama,
                    nomCama: patient.cama,
                    areaSolicitante: patient.areaSolicitante,
                    prioridad: patient.prioridad,
                    fechaSolicitud: patient.fechaSolicitud,
                    responsable: 'Sistema Web',
                    observaciones: obs
                };

                await ExamenesTomadosService.crearExamenPendiente(payload);

                setPatientExams(prev => ({
                    ...prev,
                    [patient.id]: prev[patient.id].map((ex, idx) =>
                        idx === examIndex ? { ...ex, estado: 'pendiente' } : ex
                    )
                }));
            }

        } catch (err) {
            console.error('Error marking exam as pending:', err);
            alert('Error al marcar como pendiente: ' + err.message);
        }
    }, [patientExams]);

    // COMPLETAR EXAMEN (Solo en pendientes)
    const completarExamen = useCallback(async (patient, examIndex) => {
        try {
            const pedirObservaciones = () => {
                const obs = prompt('Observaciones (opcional):');
                return obs === null ? '' : obs;
            };

            if (examIndex === 'all') {
                const exams = patientExams[patient.id] || [];
                const pendientes = exams.filter(ex => ex.estado === 'pendiente');
                const obs = pedirObservaciones();

                for (let exam of pendientes) {
                    console.log('Completando examen ID:', exam.realId); // Debug

                    // SOLO ACTUALIZAR - No eliminar
                    await ExamenesTomadosService.actualizarExamen(exam.realId, {
                        estadoResultado: 'COMPLETADO',
                        fechaTomado: new Date().toISOString(),
                        observaciones: obs
                    });
                }

                // Actualizar UI
                setPatientExams(prev => ({
                    ...prev,
                    [patient.id]: prev[patient.id].map(exam =>
                        exam.estado === 'pendiente' ? { ...exam, estado: 'completado' } : exam
                    )
                }));

                // USAR loadData en lugar de refetch
                setTimeout(() => loadData(currentPage), 500);

            } else {
                // Completar examen individual
                const exam = patientExams[patient.id][examIndex];
                const obs = pedirObservaciones();

                console.log('Completando examen individual ID:', exam.realId); // Debug

                // SOLO ACTUALIZAR
                await ExamenesTomadosService.actualizarExamen(exam.realId, {
                    estadoResultado: 'COMPLETADO',
                    fechaTomado: new Date().toISOString(),
                    observaciones: obs
                });

                // Actualizar UI
                setPatientExams(prev => ({
                    ...prev,
                    [patient.id]: prev[patient.id].map((ex, idx) =>
                        idx === examIndex ? { ...ex, estado: 'completado' } : ex
                    )
                }));

                setTimeout(() => loadData(currentPage), 500);
            }
        } catch (err) {
            console.error('Error completando examen:', err);
            alert('Error al completar examen: ' + err.message);
        }
    }, [patientExams, loadData, currentPage]);

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
                    // SOLO ACTUALIZAR - No eliminar
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

                // SOLO ACTUALIZAR
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
