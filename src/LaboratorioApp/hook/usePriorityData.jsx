// hook/usePriorityData.js
import { useState, useEffect, useCallback } from 'react';
import SolicitudesService from '../Services/SolicitudesService';
import ExamenesTomadosService from '../Services/ExamenesTomadosService';
import { mockTakenExams } from '../data/mockData';

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

    const loadData = useCallback(async (page = 0) => {
        setLoading(true);
        setError(null);

        try {
            let response;

            if (filtroActual === 'tomadas') {
                // Backend de tomados
                const allTomados = await ExamenesTomadosService.getExamenesTomados();
                const filtered = (allTomados || []).filter(exam => {
                    if (!exam.prioridad) return false;
                    const examPriority = exam.prioridad.toLowerCase();

                    if (prioridad === 'urgentes') return examPriority.includes('urgente');
                    if (prioridad === 'prioritario') return examPriority.includes('prioritaria');
                    if (prioridad === 'rutinario') return examPriority.includes('rutinario');

                    return false;
                });

                const start = page * pageSize;
                response = {
                    content: filtered.slice(start, start + pageSize),
                    totalElements: filtered.length,
                    totalPages: Math.ceil(filtered.length / pageSize)
                };

            } else {
                // Para actuales no modificar los datos originales
                let solicitudesData;

                if (prioridad === 'urgentes') {
                    solicitudesData = await SolicitudesService.getResumenPacientesUrgentes(page, pageSize);
                } else if (prioridad === 'prioritario') {
                    solicitudesData = await SolicitudesService.getResumenPacientesPrioritarios(page, pageSize);
                } else {
                    solicitudesData = await SolicitudesService.getResumenPacientesRutinarios(page, pageSize);
                }

                const content = solicitudesData.content || solicitudesData || [];

                response = {
                    content,
                    totalElements: solicitudesData.totalElements || content.length,
                    totalPages: solicitudesData.totalPages || Math.ceil(content.length / pageSize)
                };
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

    const loadPatientExams = useCallback(async (patientId) => {
        try {
            const patient = data.find(p => p.id === patientId);
            const historia = patient?.historia || patientId;

            console.log('Loading exams for:', historia, patientId); // Debug
            // Cargar exámenes de la solicitud
            const exams = await SolicitudesService.getExamenesPaciente(historia);
            // Cargar exámenes ya tomados para este paciente
            const takenExams = await ExamenesTomadosService.getExamenesPorHistoria(historia).catch(() => []);
            const takenExamNames = takenExams.map(ex => ex.nomServicio?.trim().toUpperCase());
            // Marcar los que ya están tomados
            const examsWithStatus = exams.map(exam => ({
                ...exam,
                tomado: takenExamNames.includes(exam.nombre?.trim().toUpperCase())
            }));
            // actualizar los exámenes
            setPatientExams(prev => ({
                ...prev,
                [patientId]: examsWithStatus
            }));

            console.log('Loaded exams:', examsWithStatus.length, 'taken:', takenExamNames.length); // Debug

        } catch (err) {
            console.warn('Error loading patient exams:', err);
            setPatientExams(prev => ({ ...prev, [patientId]: [] }));
        }
    }, [data]);

    const markExamsTaken = useCallback(async (patient, examIndex) => {
        try {
            const createPayload = (exam) => ({
                historia: patient.historia,
                nomPaciente: patient.paciente,
                numeroIngreso: String(patient.ingreso),
                numeroFolio: String(patient.folio),
                codServicio: exam.nombre.substring(0, 15).replace(/\s+/g, '').toUpperCase(),
                nomServicio: exam.nombre,
                fechaTomado: new Date(),
                //fechaTomado: new Date().toISOString().slice(0, -1), // Sin Z para evitar problemas de zona horaria
                edad: patient.edad,
                cama: patient.cama,
                nomCama: patient.cama,
                areaSolicitante: patient.areaSolicitante,
                prioridad: patient.prioridad,
                fechaSolicitud: patient.fechaSolicitud,
                responsable: 'Sistema Web'
            });

            console.log('Marking exam:', patient.historia, examIndex); // Debug

            if (examIndex === 'all') {
                const exams = patientExams[patient.id] || [];
                const pendingExams = exams.filter(ex => !ex.tomado);

                if (pendingExams.length) {
                    await ExamenesTomadosService.crearMultiplesExamenes(pendingExams.map(createPayload));

                    // Solo actualizar exámenes en UI
                    setPatientExams(prev => ({
                        ...prev,
                        [patient.id]: prev[patient.id].map(exam => ({ ...exam, tomado: true }))
                    }));

                    console.log('All exams marked as taken'); // Debug
                }
            } else {
                const exam = patientExams[patient.id][examIndex];
                if (exam && !exam.tomado) {
                    await ExamenesTomadosService.crearExamenTomado(createPayload(exam));
                    // Solo actualizar examen individual en UI
                    setPatientExams(prev => ({
                        ...prev,
                        [patient.id]: prev[patient.id].map((ex, idx) =>
                            idx === examIndex ? { ...ex, tomado: true } : ex
                        )
                    }));
                    console.log('Single exam marked as taken'); // Debug
                }
            }

        } catch (err) {
            console.error('Error marking exam:', err);
            alert('Error: ' + err.message);
        }
    }, [patientExams]);

    // Funciones de paginación
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
    // Cargar datos iniciales
    useEffect(() => {
        loadData(0);
    }, [prioridad, filtroActual]);

    return {
        data,
        patientExams,
        loading,
        error,
        refetch: () => loadData(currentPage),
        loadPatientExams,
        markExamsTaken,
        // Paginación
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
