// hooks/useExamenesPacientes.js
import { useCallback } from 'react';
import SolicitudesService from '../Services/SolicitudesService';
import ExamenesTomadosService from '../Services/ExamenesTomadosService';
import { getExamStatus } from '../../utils/procesarDatos';

export const useExamenesPacientes = (data, filtroActual, setPatientExams) => {
    const loadPatientExams = useCallback(async (patientId) => {
        try {
            const patient = data.find(p => p.id === patientId);
            const historia = patient?.historia;

            if (filtroActual === 'actuales') {
                const exams = await SolicitudesService.getExamenesPaciente(historia);

                if (!exams || exams.length === 0) {
                    setPatientExams(prev => ({ ...prev, [patientId]: [] }));
                    return;
                }

                const allLocal = await ExamenesTomadosService.getExamenesPorHistoria(historia);
                const tomados = allLocal.filter(e => e.estadoResultado === 'COMPLETADO');
                const pendientes = allLocal.filter(e => e.estadoResultado === 'PENDIENTE');

                const examsWithStatus = exams.map(exam => ({
                    ...exam,
                    estado: getExamStatus(exam.nombre, tomados, pendientes)
                }));

                setPatientExams(prev => ({ ...prev, [patientId]: examsWithStatus }));

            } else {
                const allLocal = await ExamenesTomadosService.getExamenesPorHistoria(historia);
                const filtroEstado = filtroActual === 'pendientes' ? 'PENDIENTE' : 'COMPLETADO';
                const examenesDelPaciente = allLocal.filter(e => e.estadoResultado === filtroEstado);

                const examsWithStatus = examenesDelPaciente.map((exam) => ({
                    id: exam.id,
                    realId: exam.id,
                    nombre: exam.nomServicio,
                    codigo: exam.codServicio,
                    fechaTomado: exam.fechaTomado,
                    fechaPendiente: exam.fechaPendiente,
                    observaciones: exam.observaciones,
                    estado: filtroActual === 'pendientes' ? 'pendiente' : 'tomado'
                }));

                setPatientExams(prev => ({ ...prev, [patientId]: examsWithStatus }));
            }

        } catch (err) {
            console.error('Error loading patient exams:', err);
            setPatientExams(prev => ({ ...prev, [patientId]: [] }));
        }
    }, [data, filtroActual, setPatientExams]);

    return { loadPatientExams };
};
