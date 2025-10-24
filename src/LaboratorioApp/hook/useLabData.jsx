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

    // Cargar datos principales
    const loadData = useCallback(async (page = 0) => {
        setLoading(true);
        setError(null);

        try {
            if (filter === 'actuales') {
                const result = await ApiService.getPatients(priority, page, pageSize);
                setData(result.content || []);
                setTotalElements(result.totalElements || 0);
                setTotalPages(result.totalPages || 0);
            } else {
                // Para datos locales, usar LocalService
                const localExams = await LocalService.getExamsByHistoria('all');
                const filtered = filterLocalData(localExams, priority, filter);
                const paginated = paginateLocal(filtered, page, pageSize);

                setData(paginated.content);
                setTotalElements(paginated.totalElements);
                setTotalPages(paginated.totalPages);
            }

            setCurrentPage(page);
        } catch (err) {
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
                const [apiExams, localExams] = await Promise.all([
                    ApiService.getPatientExams(historia),
                    LocalService.getExamsByHistoria(historia)
                ]);

                const examsWithStatus = apiExams.map(exam => {
                    const status = getExamStatus(exam.nombre, localExams);
                    return {
                        ...exam,
                        status,
                        id: `${historia}-${exam.nombre}` // ID único para cada examen
                    };
                });

                setExams(prev => ({ ...prev, [historia]: examsWithStatus }));
            } else {
                const localExams = await LocalService.getExamsByHistoria(historia);
                const filtered = localExams.filter(e =>
                    e.estadoResultado === (filter === 'pendientes' ? 'PENDIENTE' : 'COMPLETADO')
                );

                setExams(prev => ({ ...prev, [historia]: filtered }));
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

    const markAsCompleted = useCallback(async (examId, observations) => {
        console.log('Mark as completed:', examId, observations);
        // TODO: Implementar lógica local
    }, []);

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
        refresh: () => loadData(currentPage)
    };
};

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
