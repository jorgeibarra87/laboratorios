// hooks/usePrioridadData.js
import { useState, useEffect, useCallback } from 'react';
import SolicitudesService from '../Services/SolicitudesService';
import ExamenesTomadosService from '../Services/ExamenesTomadosService';
import { useCargarDatos } from './useCargarDatos';
import { useExamenesAction } from './useExamenesAction';
import { usePagination } from './usePagination';
import { useExamenesPacientes } from './useExamenesPacientes';
import { getExamStatus } from '../../utils/procesarDatos';

export const usePrioridadData = (prioridad, filtroActual, onOpenModal) => {
    const [data, setData] = useState([]);
    const [patientExams, setPatientExams] = useState({});

    const { loading, error, setLoading, setError, loadActuales, loadPendientesTomadas } = useCargarDatos();
    const { currentPage, ...pagination } = usePagination();
    const { loadPatientExams } = useExamenesPacientes(data, filtroActual, setPatientExams);

    // Main data loader
    const loadData = useCallback(async (page = 0) => {
        setLoading(true);
        setError(null);

        try {
            let response = { content: [], totalElements: 0, totalPages: 0 };

            if (filtroActual === 'actuales') {
                response = await loadActuales(prioridad, page);
            } else {
                const estado = filtroActual === 'pendientes' ? 'PENDIENTE' : 'COMPLETADO';
                response = await loadPendientesTomadas(prioridad, page, estado);
            }

            setData(response.content || []);
            pagination.setTotalElements(response.totalElements || 0);
            pagination.setTotalPages(response.totalPages || 0);
            pagination.setCurrentPage(page);

        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [prioridad, filtroActual, loadActuales, loadPendientesTomadas, pagination, setLoading, setError]);

    // Exam actions with modal integration
    const examActions = useExamenesAction(patientExams, setPatientExams, loadData, currentPage);

    const markExamAsPending = useCallback((patient, examIndex) => {
        onOpenModal(
            'Marcar como Pendiente',
            'Observaciones para marcar como pendiente (opcional)...',
            (observaciones) => examActions.markExamAsPending(patient, examIndex, observaciones)
        );
    }, [onOpenModal, examActions.markExamAsPending]);

    const completarExamen = useCallback((patient, examIndex) => {
        onOpenModal(
            'Completar Examen',
            'Observaciones para completar examen (opcional)...',
            (observaciones) => examActions.completarExamen(patient, examIndex, observaciones)
        );
    }, [onOpenModal, examActions.completarExamen]);

    // Load initial data
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
        markExamAsPending,
        completarExamen,
        marcarComoPendiente: examActions.marcarComoPendiente,
        currentPage,
        ...pagination
    };
};
