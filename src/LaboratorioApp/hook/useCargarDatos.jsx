// hooks/useCargarDatos.js
import { useState, useCallback } from 'react';
import SolicitudesService from '../Services/SolicitudesService';
import ExamenesTomadosService from '../Services/ExamenesTomadosService';
import { agruparPorPaciente, filtrarPorPrioridad, crearRespuestaPaginada, getExamStatus } from '../../utils/procesarDatos';

export const useCargarDatos = (pageSize = 10) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadActuales = useCallback(async (prioridad, page) => {
        console.log(`🔄 Cargando ${prioridad} página ${page}`);

        let solicitudesData;

        if (prioridad === 'urgentes') {
            solicitudesData = await SolicitudesService.getResumenPacientesUrgentes(page, pageSize);
        } else if (prioridad === 'prioritario') {
            solicitudesData = await SolicitudesService.getResumenPacientesPrioritarios(page, pageSize);
        } else if (prioridad === 'rutinario') {
            solicitudesData = await SolicitudesService.getResumenPacientesRutinarios(page, pageSize);
        } else {
            return { content: [], totalElements: 0, totalPages: 0 };
        }

        const content = solicitudesData.content || solicitudesData || [];
        return await filterPatientsWithAvailableExams(content, pageSize);
    }, [pageSize]);

    const loadPendientesTomadas = useCallback(async (prioridad, page, estado) => {
        const allData = await ExamenesTomadosService.getExamenesTomados();
        const pacientesAgrupados = agruparPorPaciente(allData, estado);
        const filtrados = filtrarPorPrioridad(pacientesAgrupados, prioridad);
        return crearRespuestaPaginada(filtrados, page, pageSize);
    }, [pageSize]);

    return {
        loading,
        error,
        setLoading,
        setError,
        loadActuales,
        loadPendientesTomadas
    };
};

// Helper function
const filterPatientsWithAvailableExams = async (patients, pageSize) => {
    const pacientesConExamenesDisponibles = [];

    for (let patient of patients) {
        try {
            const examsFromAPI = await SolicitudesService.getExamenesPaciente(patient.historia);
            const allLocal = await ExamenesTomadosService.getExamenesPorHistoria(patient.historia);
            const tomados = allLocal.filter(e => e.estadoResultado === 'COMPLETADO');
            const pendientes = allLocal.filter(e => e.estadoResultado === 'PENDIENTE');

            const examenesDisponibles = examsFromAPI.filter(exam =>
                getExamStatus(exam.nombre, tomados, pendientes) === 'disponible'
            ).length;

            if (examenesDisponibles > 0) {
                pacientesConExamenesDisponibles.push({
                    ...patient,
                    cantidadExamenes: examenesDisponibles
                });
            }
        } catch (error) {
            console.warn(`Error verificando exámenes para paciente ${patient.historia}:`, error);
            pacientesConExamenesDisponibles.push(patient);
        }
    }

    return {
        content: pacientesConExamenesDisponibles,
        totalElements: pacientesConExamenesDisponibles.length,
        totalPages: Math.ceil(pacientesConExamenesDisponibles.length / pageSize)
    };
};
