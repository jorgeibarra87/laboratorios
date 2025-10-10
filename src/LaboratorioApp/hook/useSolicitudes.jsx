// hook/useSolicitudes.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import ExamenesTomadosService from '../Services/ExamenesTomadosService';

export const useSolicitudes = (filtro = 'actuales', usarDatosPrueba = false, pollingInterval = null) => {
    const [solicitudesData, setSolicitudesData] = useState({
        urgentes: [],
        prioritario: [],
        rutinario: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    //estado para el polling
    const [isPollingActive, setIsPollingActive] = useState(false);
    const pollingRef = useRef(null);


    // Paginación
    const [currentPage, setCurrentPage] = useState({
        urgentes: 1,
        prioritario: 1,
        rutinario: 1
    });
    const itemsPerPage = 5;

    // DATOS DE PRUEBA
    const datosPrueba = [
        // Urgentes
        { IdePaciente: "25268415", NomPaciente: "OLIVA PUNGO", Edad: 45, Ingreso: "5805058", Folio: "2299", Areasolicitante: "LAB001 - LABORATORIO CLÍNICO", Cama: "320A", NomCama: "MEDICO QUIRURGICAS 320A", Prioridad: "Urgente", CodServicio: "879111", NomServicio: "TOMOGRAFIA COMPUTADA DE CRANEO SIN CONTRASTE", Observaciones: "Paciente con sospecha de ACV" },
        { IdePaciente: "25268415", NomPaciente: "OLIVA PUNGO", Edad: 45, Ingreso: "5805058", Folio: "2299", Areasolicitante: "LAB001 - LABORATORIO CLÍNICO", Cama: "320A", NomCama: "MEDICO QUIRURGICAS 320A", Prioridad: "Urgente", CodServicio: "871121", NomServicio: "RADIOGRAFIA DE TORAX (P.A O A.P. Y LATERAL)", Observaciones: "Control post operatorio" },
        { IdePaciente: "9876543", NomPaciente: "CARLOS RIVERA", Edad: 32, Ingreso: "5798017", Folio: "2278", Areasolicitante: "URG001 - URGENCIAS", Cama: "100A", NomCama: "URGENCIAS 100A", Prioridad: "Muy Urgente", CodServicio: "903813", NomServicio: "POTASIO EN SUERO U OTROS FLUIDOS", Observaciones: "Emergencia cardiológica" },
        { IdePaciente: "1111111", NomPaciente: "ANA MARTÍN", Edad: 67, Ingreso: "5813344", Folio: "623", Areasolicitante: "UCI001 - UCI", Cama: "UCI01", NomCama: "UCI CAMA 01", Prioridad: "Urgente", CodServicio: "906913", NomServicio: "HEMOGRAMA IV (HEMOGLOBINA HEMATOCRITO RECUENTO Y FORMULA)", Observaciones: "Seguimiento hematológico urgente" },
        { IdePaciente: "2222222", NomPaciente: "LUIS GARCÍA", Edad: 54, Ingreso: "5821456", Folio: "789", Areasolicitante: "EMR001 - EMERGENCIAS", Cama: "EMR05", NomCama: "EMERGENCIAS 05", Prioridad: "Urgente", CodServicio: "903895", NomServicio: "PROTEINA C REACTIVA ALTA PRECISION AUTOMATIZADA", Observaciones: "Proceso infeccioso severo" },
        { IdePaciente: "3333333", NomPaciente: "CARMEN LÓPEZ", Edad: 29, Ingreso: "5834567", Folio: "456", Areasolicitante: "MAT001 - MATERNIDAD", Cama: "MAT10", NomCama: "MATERNIDAD 10", Prioridad: "Urgente", CodServicio: "903854", NomServicio: "CALCIO SEMIAUTOMATIZADO", Observaciones: "Pre-eclampsia" },
        { IdePaciente: "4444444", NomPaciente: "JOSÉ RODRÍGUEZ", Edad: 71, Ingreso: "5845678", Folio: "321", Areasolicitante: "CAR001 - CARDIOLOGÍA", Cama: "CAR03", NomCama: "CARDIOLOGÍA 03", Prioridad: "Muy Urgente", CodServicio: "903810", NomServicio: "CLORO", Observaciones: "Arritmia severa" },
        { IdePaciente: "5555555", NomPaciente: "ELENA MORALES", Edad: 38, Ingreso: "5856789", Folio: "987", Areasolicitante: "NEU001 - NEUROLOGÍA", Cama: "NEU02", NomCama: "NEUROLOGÍA 02", Prioridad: "Urgente", CodServicio: "903867", NomServicio: "FOSFORO EN SUERO U OTROS FLUIDOS", Observaciones: "Alteración de conciencia" },
        { IdePaciente: "6666666", NomPaciente: "MIGUEL SANTOS", Edad: 42, Ingreso: "5867890", Folio: "654", Areasolicitante: "CIR001 - CIRUGÍA", Cama: "CIR08", NomCama: "CIRUGÍA 08", Prioridad: "Urgente", CodServicio: "903866", NomServicio: "TRANSAMINASA GLUTAMICO OXALACETICA (AST)", Observaciones: "Post operatorio inmediato" },
        { IdePaciente: "7777777", NomPaciente: "PATRICIA DÍAZ", Edad: 56, Ingreso: "5878901", Folio: "147", Areasolicitante: "GAS001 - GASTROENTEROLOGÍA", Cama: "GAS05", NomCama: "GASTROENTEROLOGÍA 05", Prioridad: "Urgente", CodServicio: "902045", NomServicio: "TIEMPO DE PROTROMBINA (TP)", Observaciones: "Sangrado digestivo" },
        { IdePaciente: "8888888", NomPaciente: "FERNANDO RUIZ", Edad: 63, Ingreso: "5889012", Folio: "258", Areasolicitante: "PUL001 - NEUMOLOGÍA", Cama: "PUL03", NomCama: "NEUMOLOGÍA 03", Prioridad: "Urgente", CodServicio: "903828", NomServicio: "DESHIDROGENASA LACTICA", Observaciones: "Insuficiencia respiratoria" },
        { IdePaciente: "8888888", NomPaciente: "FERNANDO RUIZ", Edad: 63, Ingreso: "5889012", Folio: "258", Areasolicitante: "PUL001 - NEUMOLOGÍA", Cama: "PUL03", NomCama: "NEUMOLOGÍA 03", Prioridad: "Urgente", CodServicio: "903866", NomServicio: "TRANSAMINASA GLUTAMICO OXALACETICA (AST)", Observaciones: "Insuficiencia respiratoria" },
        { IdePaciente: "8888888", NomPaciente: "FERNANDO RUIZ", Edad: 63, Ingreso: "5889012", Folio: "258", Areasolicitante: "PUL001 - NEUMOLOGÍA", Cama: "PUL03", NomCama: "NEUMOLOGÍA 03", Prioridad: "Urgente", CodServicio: "903867", NomServicio: "FOSFORO EN SUERO U OTROS FLUIDOS", Observaciones: "Insuficiencia respiratoria" },

        // Prioritarias
        { IdePaciente: "4321772", NomPaciente: "ANTONIO DÍAZ", Edad: 34, Ingreso: "5813344", Folio: "623", Areasolicitante: "PED001 - PEDIATRÍA", Cama: "415A", NomCama: "CAMA GENERAL MEDICAS 2", Prioridad: "Prioritaria", CodServicio: "903895", NomServicio: "PROTEINA C REACTIVA ALTA PRECISION AUTOMATIZADA", Observaciones: "Control inflamatorio" },
        { IdePaciente: "1010101", NomPaciente: "LUCÍA HERRERA", Edad: 28, Ingreso: "5890123", Folio: "369", Areasolicitante: "GIN001 - GINECOLOGÍA", Cama: "GIN07", NomCama: "GINECOLOGÍA 07", Prioridad: "Prioritaria", CodServicio: "906913", NomServicio: "HEMOGRAMA IV", Observaciones: "Control pre-quirúrgico" },
        { IdePaciente: "1212121", NomPaciente: "RICARDO VEGA", Edad: 49, Ingreso: "5901234", Folio: "741", Areasolicitante: "ORT001 - ORTOPEDIA", Cama: "ORT04", NomCama: "ORTOPEDIA 04", Prioridad: "Prioritaria", CodServicio: "903854", NomServicio: "CALCIO SEMIAUTOMATIZADO", Observaciones: "Fractura múltiple" },
        { IdePaciente: "1313131", NomPaciente: "SOFIA CASTRO", Edad: 61, Ingreso: "5912345", Folio: "852", Areasolicitante: "END001 - ENDOCRINOLOGÍA", Cama: "END02", NomCama: "ENDOCRINOLOGÍA 02", Prioridad: "Prioritaria", CodServicio: "903835", NomServicio: "MAGNESIO EN SUERO U OTROS FLUIDOS", Observaciones: "Diabetes descompensada" },
        { IdePaciente: "1414141", NomPaciente: "GABRIEL MORA", Edad: 47, Ingreso: "5923456", Folio: "963", Areasolicitante: "URO001 - UROLOGÍA", Cama: "URO06", NomCama: "UROLOGÍA 06", Prioridad: "Prioritaria", CodServicio: "903810", NomServicio: "CLORO", Observaciones: "Litiasis renal" },
        { IdePaciente: "1515151", NomPaciente: "NATALIA PEÑA", Edad: 35, Ingreso: "5934567", Folio: "159", Areasolicitante: "HEM001 - HEMATOLOGÍA", Cama: "HEM01", NomCama: "HEMATOLOGÍA 01", Prioridad: "Prioritaria", CodServicio: "906913", NomServicio: "HEMOGRAMA IV", Observaciones: "Anemia severa" },
        { IdePaciente: "1616161", NomPaciente: "ALBERTO SILVA", Edad: 52, Ingreso: "5945678", Folio: "357", Areasolicitante: "NEF001 - NEFROLOGÍA", Cama: "NEF03", NomCama: "NEFROLOGÍA 03", Prioridad: "Prioritaria", CodServicio: "903813", NomServicio: "POTASIO EN SUERO U OTROS FLUIDOS", Observaciones: "Insuficiencia renal" },

        // Rutinarias
        { IdePaciente: "1234567", NomPaciente: "MARÍA LÓPEZ", Edad: 41, Ingreso: "5956789", Folio: "468", Areasolicitante: "MED001 - MEDICINA INTERNA", Cama: "201B", NomCama: "MEDICINA GENERAL 201B", Prioridad: "Rutinario", CodServicio: "903854", NomServicio: "CALCIO SEMIAUTOMATIZADO", Observaciones: "Control rutinario" },
        { IdePaciente: "2020202", NomPaciente: "DIEGO CAMPOS", Edad: 39, Ingreso: "5967890", Folio: "579", Areasolicitante: "MED002 - MEDICINA INTERNA", Cama: "MED12", NomCama: "MEDICINA 12", Prioridad: "Rutinario", CodServicio: "903835", NomServicio: "MAGNESIO EN SUERO U OTROS FLUIDOS", Observaciones: "Chequeo anual" },
        { IdePaciente: "2121212", NomPaciente: "VALERIA ROMERO", Edad: 33, Ingreso: "5978901", Folio: "680", Areasolicitante: "DER001 - DERMATOLOGÍA", Cama: "DER05", NomCama: "DERMATOLOGÍA 05", Prioridad: "Electivo", CodServicio: "906913", NomServicio: "HEMOGRAMA IV", Observaciones: "Pre-procedimiento" },
        { IdePaciente: "2222323", NomPaciente: "ANDRÉS JIMÉNEZ", Edad: 58, Ingreso: "5989012", Folio: "791", Areasolicitante: "PSI001 - PSIQUIATRÍA", Cama: "PSI08", NomCama: "PSIQUIATRÍA 08", Prioridad: "Control", CodServicio: "903866", NomServicio: "TRANSAMINASA GLUTAMICO OXALACETICA", Observaciones: "Control medicación" },
        { IdePaciente: "2424242", NomPaciente: "CRISTINA VARGAS", Edad: 44, Ingreso: "5990123", Folio: "802", Areasolicitante: "REU001 - REUMATOLOGÍA", Cama: "REU02", NomCama: "REUMATOLOGÍA 02", Prioridad: "Rutinario", CodServicio: "903895", NomServicio: "PROTEINA C REACTIVA ALTA PRECISION", Observaciones: "Seguimiento artritis" },
        { IdePaciente: "2525252", NomPaciente: "MANUEL TORRES", Edad: 50, Ingreso: "5901234", Folio: "913", Areasolicitante: "OFT001 - OFTALMOLOGÍA", Cama: "OFT04", NomCama: "OFTALMOLOGÍA 04", Prioridad: "Electivo", CodServicio: "903854", NomServicio: "CALCIO SEMIAUTOMATIZADO", Observaciones: "Pre-cirugía de cataratas" },
        { IdePaciente: "2626262", NomPaciente: "ROSARIO MENDEZ", Edad: 65, Ingreso: "5912345", Folio: "024", Areasolicitante: "GER001 - GERIATRÍA", Cama: "GER06", NomCama: "GERIATRÍA 06", Prioridad: "Rutinario", CodServicio: "902045", NomServicio: "TIEMPO DE PROTROMBINA (TP)", Observaciones: "Control anticoagulación" },
        { IdePaciente: "2727272", NomPaciente: "ESTEBAN AGUIRRE", Edad: 37, Ingreso: "5923456", Folio: "135", Areasolicitante: "OTO001 - OTORRINOLARINGOLOGÍA", Cama: "OTO03", NomCama: "OTORRINO 03", Prioridad: "Electivo", CodServicio: "906913", NomServicio: "HEMOGRAMA IV", Observaciones: "Pre-amigdalectomía" }
    ];

    // FUNCIÓN: Filtrar exámenes que NO estén en tomados
    const filtrarExamenesNoTomados = (solicitudesOriginales, examenesTomados) => {
        console.log('🔍 Filtrando exámenes no tomados...');
        console.log('📥 Solicitudes originales:', solicitudesOriginales.length);
        console.log('📋 Exámenes tomados:', examenesTomados.length);

        const examenesFiltrados = solicitudesOriginales.filter(solicitud => {
            // Buscar si este examen específico ya fue tomado
            const yaExiste = examenesTomados.find(tomado =>
                tomado.historia === solicitud.IdePaciente &&
                tomado.numeroIngreso === solicitud.Ingreso &&
                tomado.numeroFolio === solicitud.Folio &&
                tomado.nomServicio === solicitud.NomServicio
            );

            // Si NO existe en tomados, incluir en actuales
            const incluir = !yaExiste;

            if (yaExiste) {
                console.log(`⏭️ Examen ya tomado (omitiendo): ${solicitud.NomPaciente} - ${solicitud.NomServicio}`);
            }

            return incluir;
        });

        console.log('📤 Solicitudes filtradas:', examenesFiltrados.length);
        return examenesFiltrados;
    };

    // Función para convertir exámenes tomados del backend a formato vista
    const convertirExamenesTomadosAVista = (examenesTomados) => {
        return examenesTomados.map(examen => ({
            IdePaciente: examen.historia,
            NomPaciente: examen.nomPaciente,
            Edad: examen.edad,
            Ingreso: examen.numeroIngreso,
            Folio: examen.numeroFolio,
            Areasolicitante: examen.areaSolicitante,
            Cama: examen.cama,
            NomCama: examen.nomCama,
            Prioridad: examen.prioridad,
            CodServicio: examen.codServicio,
            NomServicio: examen.nomServicio,
            Observaciones: examen.observaciones,
            FechaTomado: examen.fechaTomado
        }));
    };

    // Función principal para cargar solicitudes
    const cargarSolicitudes = async () => {
        try {
            setLoading(true);
            setError(null);

            await new Promise(resolve => setTimeout(resolve, 800));

            let dataFiltrada = [];

            // SIEMPRE obtener exámenes tomados para filtrar
            let examenesTomadosActuales = [];
            try {
                examenesTomadosActuales = await ExamenesTomadosService.getExamenesTomados();
            } catch (error) {
                console.warn('⚠️ Error obteniendo exámenes tomados para filtrado:', error);
                // Continuar con array vacío si falla
            }

            if (filtro === 'tomadas') {
                console.log('📋 Cargando exámenes tomados desde backend...');
                dataFiltrada = convertirExamenesTomadosAVista(examenesTomadosActuales);

            } else {
                // Para 'actuales' - usar datos de prueba Y filtrar los ya tomados
                console.log('🧪 Usando datos de prueba para actuales');
                console.log('🔍 Filtrando exámenes ya tomados...');

                // APLICAR FILTRO: quitar exámenes que ya están tomados
                const datosSinTomados = filtrarExamenesNoTomados(datosPrueba, examenesTomadosActuales);
                dataFiltrada = [...datosSinTomados];
            }

            console.log('📊 Datos filtrados finales:', dataFiltrada.length);

            if (dataFiltrada.length > 0) {
                const pacientesAgrupados = agruparPorPaciente(dataFiltrada);
                const solicitudesOrganizadas = organizarPorPrioridad(pacientesAgrupados);
                setSolicitudesData(solicitudesOrganizadas);
            } else {
                setSolicitudesData({
                    urgentes: [],
                    prioritario: [],
                    rutinario: []
                });
            }

        } catch (err) {
            setError('Error cargando solicitudes: ' + err.message);
            console.error('❌ Error cargando solicitudes:', err);
            setSolicitudesData({
                urgentes: [],
                prioritario: [],
                rutinario: []
            });
        } finally {
            setLoading(false);
        }
    };

    // FUNCIÓN PARA AGRUPAR POR PACIENTE
    const agruparPorPaciente = (solicitudes) => {
        const pacientesMap = {};

        solicitudes.forEach(solicitud => {
            const key = solicitud.IdePaciente;

            if (!pacientesMap[key]) {
                pacientesMap[key] = {
                    id: solicitud.IdePaciente,
                    paciente: solicitud.NomPaciente,
                    edad: solicitud.Edad,
                    historia: solicitud.IdePaciente,
                    ingreso: solicitud.Ingreso,
                    folio: solicitud.Folio,
                    cama: solicitud.Cama,
                    nombreCama: solicitud.NomCama,
                    fechaSolicitud: solicitud.FechaTomado || new Date().toLocaleDateString(),
                    areaSolicitante: solicitud.Areasolicitante || 'No especificado',
                    codigoServicio: solicitud.CodServicio,
                    estado: 'Actual',
                    prioridad: solicitud.Prioridad,
                    observaciones: solicitud.Observaciones || '',
                    examenes: []
                };

                if (solicitud.Areasolicitante && typeof solicitud.Areasolicitante === 'string') {
                    const partes = solicitud.Areasolicitante.split(' - ');
                    pacientesMap[key].servicio = partes.length > 1 ? partes[1] : solicitud.Areasolicitante;
                } else {
                    pacientesMap[key].servicio = 'Laboratorio';
                }
            }

            pacientesMap[key].examenes.push(solicitud.NomServicio);
        });

        return Object.values(pacientesMap);
    };

    // FUNCIÓN PARA ORGANIZAR POR PRIORIDAD
    const organizarPorPrioridad = (pacientesAgrupados) => {
        return pacientesAgrupados.reduce((acc, paciente) => {
            const prioridad = paciente.prioridad.toLowerCase();

            let categoria;
            if (prioridad.includes('urgente') || prioridad === 'muy urgente') {
                categoria = 'urgentes';
            } else if (prioridad === 'prioritaria') {
                categoria = 'prioritario';
            } else {
                categoria = 'rutinario';
            }

            if (!acc[categoria]) {
                acc[categoria] = [];
            }

            acc[categoria].push(paciente);
            return acc;
        }, {
            urgentes: [],
            prioritario: [],
            rutinario: []
        });
    };

    // FUNCIÓN PARA MARCAR EXÁMENES COMO TOMADOS
    const marcarExamenesTomados = async (solicitud, examenesIndices) => {
        try {
            setLoading(true);

            const examenesTomados = examenesIndices.map(examIndex => ({
                historia: solicitud.historia || solicitud.IdePaciente,
                nomPaciente: solicitud.paciente || solicitud.NomPaciente,
                edad: solicitud.edad || solicitud.Edad,
                numeroIngreso: solicitud.ingreso || solicitud.Ingreso,
                numeroFolio: solicitud.folio || solicitud.Folio,
                cama: solicitud.cama || solicitud.Cama,
                nomCama: solicitud.nombreCama || solicitud.NomCama,
                areaSolicitante: solicitud.areaSolicitante || solicitud.Areasolicitante,
                prioridad: solicitud.prioridad || solicitud.Prioridad,
                codServicio: solicitud.codigoServicio || solicitud.CodServicio,
                nomServicio: solicitud.examenes ? solicitud.examenes[examIndex] : solicitud.NomServicio,
                observaciones: solicitud.observaciones || solicitud.Observaciones || '',
                fechaTomado: new Date().toISOString().slice(0, 19), // Formato: 2025-10-10T14:08:22
                responsable: 'Usuario Sistema'
            }));

            await ExamenesTomadosService.crearMultiplesExamenes(examenesTomados);

            await cargarSolicitudes();

            return { success: true };

        } catch (error) {
            console.error('❌ Error marcando exámenes como tomados:', error);
            setError('Error al marcar exámenes como tomados: ' + error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const marcarExamenIndividual = async (solicitud, examIndex) => {
        return await marcarExamenesTomados(solicitud, [examIndex]);
    };

    const marcarTodosLosExamenes = async (solicitud) => {
        const todosLosIndices = solicitud.examenes ?
            solicitud.examenes.map((_, index) => index) : [0];
        return await marcarExamenesTomados(solicitud, todosLosIndices);
    };

    // FUNCIONES DE PAGINACIÓN
    const paginateData = (data, categoria) => {
        const page = currentPage[categoria];
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return {
            items: data.slice(startIndex, endIndex),
            totalPages: Math.ceil(data.length / itemsPerPage),
            currentPage: page,
            totalItems: data.length
        };
    };

    const changePage = (categoria, newPage) => {
        setCurrentPage(prev => ({
            ...prev,
            [categoria]: newPage
        }));
    };

    const resetPagination = () => {
        setCurrentPage({
            urgentes: 1,
            prioritario: 1,
            rutinario: 1
        });
    };

    useEffect(() => {
        resetPagination();
        cargarSolicitudes();
    }, [filtro, usarDatosPrueba]);

    // Función de polling automático
    const startPolling = useCallback((interval = 30000) => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }

        setIsPollingActive(true);
        pollingRef.current = setInterval(() => {
            console.log('🔄 Actualizando datos automáticamente...');
            cargarSolicitudes();
        }, interval);
    }, [cargarSolicitudes]);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        setIsPollingActive(false);
    }, []);

    // Auto-iniciar polling si se pasa el intervalo
    useEffect(() => {
        if (pollingInterval && pollingInterval > 0) {
            startPolling(pollingInterval);
        }

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [pollingInterval, startPolling]);

    // Pausar polling cuando la pestaña no está visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (isPollingActive) {
                    stopPolling();
                }
            } else {
                if (pollingInterval && pollingInterval > 0) {
                    startPolling(pollingInterval);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isPollingActive, pollingInterval, startPolling, stopPolling]);

    return {
        solicitudesData,
        loading,
        error,
        cargarSolicitudes,
        marcarExamenesTomados,
        marcarExamenIndividual,
        marcarTodosLosExamenes,
        paginateData,
        changePage,
        currentPage,
        itemsPerPage,
        startPolling,
        stopPolling,
        isPollingActive
    };
};
