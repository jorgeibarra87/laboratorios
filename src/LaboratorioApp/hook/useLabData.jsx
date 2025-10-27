// hooks/useLabData.js
import { useState, useEffect, useCallback } from 'react';
import ApiService from '../Services/ApiService';
import LocalService from '../Services/LocalService';

export const useLabData = (priority, filter, pageSize = 10) => {
    const [data, setData] = useState([]);
    const [exams, setExams] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Paginación simple
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Estado para pacientes sin exámenes disponibles
    const [patientsWithoutExams, setPatientsWithoutExams] = useState(new Set());

    // Cargar datos principales
    const loadData = useCallback(async (page = 0) => {
        setLoading(true);
        setError(null);

        try {
            if (filter === 'actuales') {
                // Obtener pacientes
                const result = await ApiService.getPatients(priority, page, pageSize);
                const allPatients = result.content || [];

                // Obtener TODOS los exámenes locales para pre-filtrar
                console.log('📋 Pre-filtrando pacientes con exámenes procesados...');
                const allLocalExams = await LocalService.getAllExams();

                // Para cada paciente, verificar si tiene exámenes disponibles
                const patientsWithAvailableExams = [];
                const patientsToHide = new Set();

                for (const patient of allPatients) {
                    // Obtener exámenes locales de este paciente
                    const localExamsForPatient = allLocalExams.filter(
                        e => e.historia === patient.historia
                    );

                    // Si no tiene exámenes locales, significa que todos están disponibles
                    if (localExamsForPatient.length === 0) {
                        patientsWithAvailableExams.push(patient);
                        continue;
                    }

                    // Si tiene exámenes locales, verificar si tiene al menos uno disponible comparar
                    try {
                        const apiExams = await ApiService.getPatientExams(patient.historia);

                        // Contar exámenes disponibles (no están en la base local)
                        const availableExams = apiExams.filter(apiExam => {
                            const isProcessed = localExamsForPatient.some(localExam =>
                                localExam.nomServicio === apiExam.nombre &&
                                (localExam.estadoResultado === 'PENDIENTE' || localExam.estadoResultado === 'COMPLETADO')
                            );
                            return !isProcessed; // Si no está procesado, está disponible
                        });

                        console.log(`🔍 ${patient.paciente}: ${availableExams.length}/${apiExams.length} disponibles`);

                        if (availableExams.length > 0) {
                            // Tiene al menos un examen disponible
                            patientsWithAvailableExams.push({
                                ...patient,
                                cantidadExamenes: availableExams.length
                            });
                        } else {
                            // No tiene exámenes disponibles, marcarlo para ocultar
                            patientsToHide.add(patient.historia);
                            console.log(`❌ Ocultando ${patient.paciente}: sin exámenes disponibles`);
                        }
                    } catch (examError) {
                        console.error(`Error verificando exámenes para ${patient.historia}:`, examError);
                        // En caso de error, mostrar el paciente (comportamiento seguro)
                        patientsWithAvailableExams.push(patient);
                    }
                }

                // Actualizar el Set de pacientes sin exámenes
                setPatientsWithoutExams(patientsToHide);

                console.log(`✅ Mostrando ${patientsWithAvailableExams.length} de ${allPatients.length} pacientes`);

                setData(patientsWithAvailableExams);
                setTotalElements(patientsWithAvailableExams.length);
                setTotalPages(Math.ceil(patientsWithAvailableExams.length / pageSize));
            } else {
                // Para pendientes y tomadas
                console.log(`🔍 Cargando datos locales: ${filter} - ${priority}`);
                const allLocalExams = await LocalService.getAllExams();

                const statusMap = {
                    'pendientes': 'PENDIENTE',
                    'tomadas': 'COMPLETADO'
                };

                const filteredExams = allLocalExams.filter(exam => {
                    const matchesStatus = exam.estadoResultado === statusMap[filter];
                    const matchesPriority = exam.prioridad?.toLowerCase() === priority.toLowerCase();
                    return matchesStatus && matchesPriority;
                });

                console.log(`📊 Exámenes filtrados para ${filter}-${priority}:`, filteredExams.length);

                const patients = transformExamsToPatients(filteredExams);
                console.log(`👥 Pacientes agrupados:`, patients.length);

                const paginated = paginateLocal(patients, page, pageSize);

                setData(paginated.content);
                setTotalElements(paginated.totalElements);
                setTotalPages(paginated.totalPages);
            }

            setCurrentPage(page);
        } catch (err) {
            console.error('❌ Error cargando datos:', err);
            setError(err.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [priority, filter, pageSize]);

    // Cargar exámenes de un paciente específico
    const loadPatientExams = useCallback(async (historia) => {
        try {
            if (filter === 'actuales') {
                console.log(`🔍 Cargando exámenes para paciente ${historia}...`);

                const [apiExams, localExams] = await Promise.all([
                    ApiService.getPatientExams(historia),
                    LocalService.getExamsByHistoria(historia)
                ]);

                console.log(`📋 Exámenes API: ${apiExams.length}, Local: ${localExams.length}`);

                const examsWithStatus = apiExams.map(exam => {
                    const status = getExamStatus(exam.nombre, localExams);
                    return {
                        ...exam,
                        status,
                        id: `${historia}-${exam.nombre}`
                    };
                });

                const availableExams = examsWithStatus.filter(exam => exam.status === 'available');

                console.log(`✅ Exámenes disponibles: ${availableExams.length} de ${apiExams.length}`);

                // Si no hay exámenes disponibles, marcar paciente para ocultarlo
                if (availableExams.length === 0) {
                    setPatientsWithoutExams(prev => new Set([...prev, historia]));
                }

                setExams(prev => ({ ...prev, [historia]: availableExams }));

            } else {
                // Para pendientes y tomadas (mantener igual)
                const allLocalExams = await LocalService.getAllExams();
                const statusMap = {
                    'pendientes': 'PENDIENTE',
                    'tomadas': 'COMPLETADO'
                };

                const filtered = allLocalExams.filter(e =>
                    e.historia === historia && e.estadoResultado === statusMap[filter]
                );

                const transformedExams = filtered.map(exam => ({
                    id: exam.id,
                    nombre: exam.nomServicio,
                    status: filter === 'pendientes' ? 'pending' : 'completed',
                    fechaPendiente: exam.fechaPendiente,
                    fechaTomado: exam.fechaTomado,
                    observaciones: exam.observaciones
                }));

                setExams(prev => ({ ...prev, [historia]: transformedExams }));
            }
        } catch (err) {
            console.error('Error loading patient exams:', err);
            setExams(prev => ({ ...prev, [historia]: [] }));
        }
    }, [filter]);


    // Marcar examen como pendiente
    const markAsPending = useCallback(async (historia, examName, observations = '') => {
        try {
            const examData = {
                historia,
                nomServicio: examName,
                estadoResultado: 'PENDIENTE',
                fechaPendiente: new Date().toISOString(),
                observaciones: observations,
                responsable: 'Sistema Web',
                prioridad: priority.toUpperCase()
            };

            await LocalService.createExam(examData);

            // Actualizar estado local del examen
            setExams(prev => ({
                ...prev,
                [historia]: prev[historia]?.map(exam =>
                    exam.nombre === examName
                        ? { ...exam, status: 'pending' }
                        : exam
                ) || []
            }));

            console.log('✅ Examen marcado como pendiente:', examName);
            return true;
        } catch (error) {
            console.error('❌ Error marking exam as pending:', error);
            throw error;
        }
    }, [priority]);

    const markAsCompleted = useCallback(async (examId, observations = '') => {
        try {
            console.log(`🎯 Marcando examen ${examId} como completado...`);

            await LocalService.updateExam(examId, {
                estadoResultado: 'COMPLETADO',
                fechaTomado: new Date().toISOString(),
                observaciones: observations
            });

            console.log('✅ Examen marcado como completado');

            // Recargar datos para refrescar la vista
            await loadData(currentPage);

            return true;
        } catch (error) {
            console.error('❌ Error marcando examen como completado:', error);
            throw error;
        }
    }, [currentPage, loadData]);

    // Revertir examen a pendiente (de COMPLETADO a PENDIENTE)
    const revertToPending = useCallback(async (examId, observations = '') => {
        try {
            console.log(`🔄 Revirtiendo examen ${examId} a pendiente...`);

            await LocalService.updateExam(examId, {
                estadoResultado: 'PENDIENTE',
                fechaTomado: null, // Limpiar fecha de tomado
                observaciones: observations
            });

            console.log('✅ Examen revertido a pendiente');

            // Recargar datos para refrescar la vista
            await loadData(currentPage);

            return true;
        } catch (error) {
            console.error('❌ Error revirtiendo examen a pendiente:', error);
            throw error;
        }
    }, [currentPage, loadData]);

    // Navegación de páginas
    const goToPage = useCallback((page) => {
        if (page >= 0 && page < totalPages) {
            loadData(page);
        }
    }, [totalPages, loadData]);

    const nextPage = useCallback(() => {
        if (currentPage < totalPages - 1) {
            goToPage(currentPage + 1);
        }
    }, [currentPage, totalPages, goToPage]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) {
            goToPage(currentPage - 1);
        }
    }, [currentPage, goToPage]);

    // Cargar datos iniciales
    useEffect(() => {
        setCurrentPage(0);
        loadData(0);
    }, [priority, filter]);

    return {
        // Datos
        data,
        exams,
        loading,
        error,

        // Paginación
        currentPage,
        totalElements,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        hasNextPage: currentPage < totalPages - 1,
        hasPrevPage: currentPage > 0,

        // Acciones
        loadPatientExams,
        markAsPending,
        markAsCompleted,
        revertToPending,
        patientsWithoutExams,
        refresh: () => loadData(currentPage)
    };
};

// Función para transformar exámenes de BD a formato de pacientes
function transformExamsToPatients(exams) {
    const patientsMap = new Map();

    exams.forEach(exam => {
        const historia = exam.historia;

        if (!patientsMap.has(historia)) {
            patientsMap.set(historia, {
                id: historia,
                historia: historia,
                paciente: exam.nomPaciente,
                edad: exam.edad,
                ingreso: exam.numeroIngreso,
                folio: exam.numeroFolio,
                cama: exam.nomCama,
                areaSolicitante: exam.areaSolicitante,
                fechaSolicitud: exam.fechaSolicitud,
                fechaPendiente: exam.fechaPendiente,
                fechaTomado: exam.fechaTomado,
                cantidadExamenes: 0,
                examenes: []
            });
        }

        const patient = patientsMap.get(historia);
        patient.cantidadExamenes += 1;
        patient.examenes.push({
            nombre: exam.nomServicio,
            observaciones: exam.observaciones,
            fechaPendiente: exam.fechaPendiente,
            fechaTomado: exam.fechaTomado
        });

        // Usar la fecha más reciente para el paciente
        if (exam.fechaPendiente && (!patient.fechaPendiente || exam.fechaPendiente > patient.fechaPendiente)) {
            patient.fechaPendiente = exam.fechaPendiente;
        }
        if (exam.fechaTomado && (!patient.fechaTomado || exam.fechaTomado > patient.fechaTomado)) {
            patient.fechaTomado = exam.fechaTomado;
        }
    });

    return Array.from(patientsMap.values());
}

// Funciones auxiliares
function getExamStatus(examName, localExams) {
    const completed = localExams.find(e => e.nomServicio === examName && e.estadoResultado === 'COMPLETADO');
    const pending = localExams.find(e => e.nomServicio === examName && e.estadoResultado === 'PENDIENTE');

    if (completed) return 'completed';
    if (pending) return 'pending';
    return 'available';
}

function filterLocalData(exams, priority, filter) {
    const statusMap = { pendientes: 'PENDIENTE', tomadas: 'COMPLETADO' };
    return exams.filter(e =>
        e.estadoResultado === statusMap[filter] &&
        e.prioridad?.toLowerCase().includes(priority)
    );
}

function paginateLocal(data, page, size) {
    const start = page * size;
    const end = start + size;

    return {
        content: data.slice(start, end),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size)
    };
}
