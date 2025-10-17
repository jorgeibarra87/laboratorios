// hook/usePriorityData.js
import { useState, useEffect, useCallback } from 'react';
import SolicitudesService from '../Services/SolicitudesService';
import ExamenesTomadosService from '../Services/ExamenesTomadosService';
import {
    mockPatients,
    mockPatientExams,
    mockTakenExams,
    mockApiDelay,
    USE_MOCK_DATA
} from '../data/mockData';

export const usePriorityData = (prioridad, filtroActual) => {
    const [data, setData] = useState([]);
    const [patientExams, setPatientExams] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [useMock, setUseMock] = useState(USE_MOCK_DATA);

    // Función para cargar datos mock
    const loadMockData = useCallback(async () => {
        await mockApiDelay(800); // Simular delay de red

        if (filtroActual === 'tomadas') {
            return mockTakenExams[prioridad] || [];
        } else {
            return mockPatients[prioridad] || [];
        }
    }, [prioridad, filtroActual]);

    // Función para cargar exámenes mock de un paciente
    const loadMockPatientExams = useCallback(async (patientId) => {
        await mockApiDelay(500);
        return mockPatientExams[patientId] || [];
    }, []);

    // Función principal para cargar datos
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let result;

            // Si está activado el modo mock o falla la API, usar datos mock
            if (useMock) {
                result = await loadMockData();
                console.log(`🧪 Usando datos mock para ${prioridad} - ${filtroActual}`);
            } else {
                try {
                    // Intentar cargar datos reales
                    if (filtroActual === 'tomadas') {
                        const examsTaken = await ExamenesTomadosService.getExamenesTomados();
                        result = examsTaken.filter(exam =>
                            exam.prioridad?.toLowerCase().includes(
                                prioridad === 'prioritario' ? 'prioritaria' : prioridad
                            )
                        );
                    } else {
                        if (prioridad === 'urgentes') {
                            result = await SolicitudesService.getResumenPacientesUrgentes(0, 100);
                        } else if (prioridad === 'prioritario') {
                            result = await SolicitudesService.getResumenPacientesPrioritarios(0, 100);
                        } else {
                            result = await SolicitudesService.getResumenPacientesRutinarios(0, 100);
                        }
                    }

                    console.log(`📡 Usando datos reales para ${prioridad} - ${filtroActual}`);
                } catch (apiError) {
                    console.warn(`❌ Error en API para ${prioridad}, usando datos mock:`, apiError);
                    setUseMock(true);
                    result = await loadMockData();
                }
            }

            setData(result || []);
        } catch (err) {
            setError(err.message);
            console.error(`Error cargando datos de ${prioridad}:`, err);

            // Como último recurso, intentar con datos mock
            try {
                const mockResult = await loadMockData();
                setData(mockResult);
                setUseMock(true);
            } catch (mockErr) {
                console.error('Error incluso con datos mock:', mockErr);
            }
        } finally {
            setLoading(false);
        }
    }, [prioridad, filtroActual, useMock, loadMockData]);

    // Cargar exámenes específicos de un paciente
    const loadPatientExams = useCallback(async (patientId) => {
        try {
            let exams;

            if (useMock) {
                exams = await loadMockPatientExams(patientId);
            } else {
                try {
                    exams = await SolicitudesService.getExamenesPaciente(patientId);
                } catch (apiError) {
                    console.warn(`❌ Error cargando exámenes del paciente ${patientId}, usando mock:`, apiError);
                    exams = await loadMockPatientExams(patientId);
                }
            }

            setPatientExams(prev => ({
                ...prev,
                [patientId]: exams
            }));
        } catch (err) {
            console.error('Error cargando exámenes del paciente:', err);
        }
    }, [useMock, loadMockPatientExams]);

    // Marcar exámenes como tomados
    const markExamsTaken = useCallback(async (patient, examIndex) => {
        try {
            if (useMock) {
                // Simular marcar como tomado en datos mock
                await mockApiDelay(300);
                console.log(`🧪 Mock: Marcando exámenes como tomados para paciente ${patient.id}`);

                if (examIndex === 'all') {
                    // Marcar todos como tomados
                    setPatientExams(prev => ({
                        ...prev,
                        [patient.id]: prev[patient.id]?.map(exam => ({
                            ...exam,
                            tomado: true
                        })) || []
                    }));
                } else {
                    // Marcar examen individual
                    setPatientExams(prev => ({
                        ...prev,
                        [patient.id]: prev[patient.id]?.map((exam, idx) =>
                            idx === examIndex ? { ...exam, tomado: true } : exam
                        ) || []
                    }));
                }
            } else {
                // Usar API real
                if (examIndex === 'all') {
                    await ExamenesTomadosService.crearMultiplesExamenes(
                        patientExams[patient.id]?.map(exam => ({
                            historia: patient.historia,
                            nomPaciente: patient.paciente,
                            nomServicio: exam.nombre,
                            fechaTomado: new Date().toISOString(),
                            usuarioTomo: 'Usuario Actual'
                        })) || []
                    );
                } else {
                    await ExamenesTomadosService.crearExamenTomado({
                        historia: patient.historia,
                        nomPaciente: patient.paciente,
                        nomServicio: patientExams[patient.id][examIndex].nombre,
                        fechaTomado: new Date().toISOString(),
                        usuarioTomo: 'Usuario Actual'
                    });
                }
            }

            // Recargar datos
            await loadData();
        } catch (err) {
            console.error('Error marcando exámenes:', err);
        }
    }, [patientExams, loadData, useMock]);

    // Función para alternar entre mock y datos reales
    const toggleMockMode = useCallback(() => {
        setUseMock(prev => !prev);
    }, []);

    // Cargar datos inicialmente
    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        data,
        patientExams,
        loading,
        error,
        useMock,
        refetch: loadData,
        loadPatientExams,
        markExamsTaken,
        toggleMockMode
    };
};
