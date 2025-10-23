// hooks/useExamenesAction.js
import { useCallback } from 'react';
import ExamenesTomadosService from '../Services/ExamenesTomadosService';

export const useExamenesAction = (patientExams, setPatientExams, loadData, currentPage) => {
    const createPayload = (patient, exam, estadoResultado, observaciones) => ({
        historia: patient.historia,
        nomPaciente: patient.paciente,
        numeroIngreso: String(patient.ingreso),
        numeroFolio: String(patient.folio),
        codServicio: exam.id || exam.codigo,
        nomServicio: exam.nombre,
        estadoResultado,
        ...(estadoResultado === 'PENDIENTE' && { fechaPendiente: new Date().toISOString() }),
        ...(estadoResultado === 'COMPLETADO' && { fechaTomado: new Date().toISOString() }),
        edad: patient.edad,
        cama: patient.cama,
        nomCama: patient.cama,
        areaSolicitante: patient.areaSolicitante,
        prioridad: patient.prioridad,
        fechaSolicitud: patient.fechaSolicitud,
        responsable: 'Sistema Web',
        observaciones
    });

    const refreshPatientData = useCallback(async (patientId) => {
        await loadData(currentPage);
        setPatientExams(prev => ({ ...prev, [patientId]: undefined }));
    }, [loadData, currentPage, setPatientExams]);

    const markExamAsPending = useCallback(async (patient, examIndex, observaciones) => {
        try {
            const exams = patientExams[patient.id] || [];

            if (examIndex === 'all') {
                const disponibles = exams.filter(ex => ex.estado === 'disponible');
                for (let exam of disponibles) {
                    const payload = createPayload(patient, exam, 'PENDIENTE', observaciones);
                    await ExamenesTomadosService.crearExamenPendiente(payload);
                }
            } else {
                const exam = exams[examIndex];
                if (exam.estado === 'disponible') {
                    const payload = createPayload(patient, exam, 'PENDIENTE', observaciones);
                    await ExamenesTomadosService.crearExamenPendiente(payload);
                }
            }

            await refreshPatientData(patient.id);
        } catch (err) {
            console.error('Error marking exam as pending:', err);
            throw err;
        }
    }, [patientExams, refreshPatientData]);

    const completarExamen = useCallback(async (patient, examIndex, observaciones) => {
        try {
            const exams = patientExams[patient.id] || [];

            if (examIndex === 'all') {
                const pendientes = exams.filter(ex => ex.estado === 'pendiente');
                for (let exam of pendientes) {
                    const payload = createPayload(patient, exam, 'COMPLETADO', observaciones);
                    await ExamenesTomadosService.actualizarExamenCompleto(exam.realId, payload);
                }
            } else {
                const exam = exams[examIndex];
                const payload = createPayload(patient, exam, 'COMPLETADO', observaciones);
                await ExamenesTomadosService.actualizarExamenCompleto(exam.realId, payload);
            }

            await refreshPatientData(patient.id);
        } catch (err) {
            console.error('Error completando examen:', err);
            throw err;
        }
    }, [patientExams, refreshPatientData]);

    const marcarComoPendiente = useCallback(async (patient, examIndex, observaciones) => {
        try {
            const exams = patientExams[patient.id] || [];

            if (examIndex === 'all') {
                const tomados = exams.filter(ex => ex.estado === 'tomado');
                for (let exam of tomados) {
                    await ExamenesTomadosService.actualizarExamen(exam.realId, {
                        estadoResultado: 'PENDIENTE',
                        fechaTomado: null,
                        fechaPendiente: new Date().toISOString(),
                        observaciones
                    });
                }
            } else {
                const exam = exams[examIndex];
                await ExamenesTomadosService.actualizarExamen(exam.realId, {
                    estadoResultado: 'PENDIENTE',
                    fechaTomado: null,
                    fechaPendiente: new Date().toISOString(),
                    observaciones
                });
            }

            await refreshPatientData(patient.id);
        } catch (err) {
            console.error('Error marcando como pendiente:', err);
            throw err;
        }
    }, [patientExams, refreshPatientData]);

    return {
        markExamAsPending,
        completarExamen,
        marcarComoPendiente
    };
};
