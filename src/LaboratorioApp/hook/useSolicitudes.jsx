// src/LaboratorioApp/hook/useSolicitudes.jsx
import { useState, useEffect } from 'react';
//import SolicitudesService from '../Services/SolicitudesService';
import ExamenesTomadosService from '../Services/ExamenesTomadosService';

export const useSolicitudes = (filtro = 'actuales', usarDatosPrueba = false) => {
    const [solicitudesData, setSolicitudesData] = useState({
        urgentes: [],
        prioritario: [],
        rutinario: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [examenesTomados, setExamenesTomados] = useState([]);

    // Paginación
    const [currentPage, setCurrentPage] = useState({
        urgentes: 1,
        prioritario: 1,
        rutinario: 1
    });
    const itemsPerPage = 5;

    // Datos de prueba
    const datosPrueba = [
        // Urgentes
        { Ide_Paciente: "25268415", Nom_Paciente: "OLIVA PUNGO", Edad: 45, Ingreso: "5805058", Folio: "2299", Areasolicitante: "LAB001 - LABORATORIO CLÍNICO", Cama: "320A", NomCama: "MEDICO QUIRURGICAS 320A", Prioridad: "Urgente", CodServicio: "879111", NomServicio: "TOMOGRAFIA COMPUTADA DE CRANEO SIN CONTRASTE", Observaciones: "Paciente con sospecha de ACV" },
        { Ide_Paciente: "25268415", Nom_Paciente: "OLIVA PUNGO", Edad: 45, Ingreso: "5805058", Folio: "2299", Areasolicitante: "LAB001 - LABORATORIO CLÍNICO", Cama: "320A", NomCama: "MEDICO QUIRURGICAS 320A", Prioridad: "Urgente", CodServicio: "871121", NomServicio: "RADIOGRAFIA DE TORAX (P.A O A.P. Y LATERAL)", Observaciones: "Control post operatorio" },
        { Ide_Paciente: "9876543", Nom_Paciente: "CARLOS RIVERA", Edad: 32, Ingreso: "5798017", Folio: "2278", Areasolicitante: "URG001 - URGENCIAS", Cama: "100A", NomCama: "URGENCIAS 100A", Prioridad: "Muy Urgente", CodServicio: "903813", NomServicio: "POTASIO EN SUERO U OTROS FLUIDOS", Observaciones: "Emergencia cardiológica" },
        { Ide_Paciente: "1111111", Nom_Paciente: "ANA MARTÍN", Edad: 67, Ingreso: "5813344", Folio: "623", Areasolicitante: "UCI001 - UCI", Cama: "UCI01", NomCama: "UCI CAMA 01", Prioridad: "Urgente", CodServicio: "906913", NomServicio: "HEMOGRAMA IV (HEMOGLOBINA HEMATOCRITO RECUENTO Y FORMULA)", Observaciones: "Seguimiento hematológico urgente" },
        { Ide_Paciente: "2222222", Nom_Paciente: "LUIS GARCÍA", Edad: 54, Ingreso: "5821456", Folio: "789", Areasolicitante: "EMR001 - EMERGENCIAS", Cama: "EMR05", NomCama: "EMERGENCIAS 05", Prioridad: "Urgente", CodServicio: "903895", NomServicio: "PROTEINA C REACTIVA ALTA PRECISION AUTOMATIZADA", Observaciones: "Proceso infeccioso severo" },
        { Ide_Paciente: "3333333", Nom_Paciente: "CARMEN LÓPEZ", Edad: 29, Ingreso: "5834567", Folio: "456", Areasolicitante: "MAT001 - MATERNIDAD", Cama: "MAT10", NomCama: "MATERNIDAD 10", Prioridad: "Urgente", CodServicio: "903854", NomServicio: "CALCIO SEMIAUTOMATIZADO", Observaciones: "Pre-eclampsia" },
        { Ide_Paciente: "4444444", Nom_Paciente: "JOSÉ RODRÍGUEZ", Edad: 71, Ingreso: "5845678", Folio: "321", Areasolicitante: "CAR001 - CARDIOLOGÍA", Cama: "CAR03", NomCama: "CARDIOLOGÍA 03", Prioridad: "Muy Urgente", CodServicio: "903810", NomServicio: "CLORO", Observaciones: "Arritmia severa" },
        { Ide_Paciente: "5555555", Nom_Paciente: "ELENA MORALES", Edad: 38, Ingreso: "5856789", Folio: "987", Areasolicitante: "NEU001 - NEUROLOGÍA", Cama: "NEU02", NomCama: "NEUROLOGÍA 02", Prioridad: "Urgente", CodServicio: "903867", NomServicio: "FOSFORO EN SUERO U OTROS FLUIDOS", Observaciones: "Alteración de conciencia" },
        { Ide_Paciente: "6666666", Nom_Paciente: "MIGUEL SANTOS", Edad: 42, Ingreso: "5867890", Folio: "654", Areasolicitante: "CIR001 - CIRUGÍA", Cama: "CIR08", NomCama: "CIRUGÍA 08", Prioridad: "Urgente", CodServicio: "903866", NomServicio: "TRANSAMINASA GLUTAMICO OXALACETICA (AST)", Observaciones: "Post operatorio inmediato" },
        { Ide_Paciente: "7777777", Nom_Paciente: "PATRICIA DÍAZ", Edad: 56, Ingreso: "5878901", Folio: "147", Areasolicitante: "GAS001 - GASTROENTEROLOGÍA", Cama: "GAS05", NomCama: "GASTROENTEROLOGÍA 05", Prioridad: "Urgente", CodServicio: "902045", NomServicio: "TIEMPO DE PROTROMBINA (TP)", Observaciones: "Sangrado digestivo" },
        { Ide_Paciente: "8888888", Nom_Paciente: "FERNANDO RUIZ", Edad: 63, Ingreso: "5889012", Folio: "258", Areasolicitante: "PUL001 - NEUMOLOGÍA", Cama: "PUL03", NomCama: "NEUMOLOGÍA 03", Prioridad: "Urgente", CodServicio: "903828", NomServicio: "DESHIDROGENASA LACTICA", Observaciones: "Insuficiencia respiratoria" },
        { Ide_Paciente: "8888888", Nom_Paciente: "FERNANDO RUIZ", Edad: 63, Ingreso: "5889012", Folio: "258", Areasolicitante: "PUL001 - NEUMOLOGÍA", Cama: "PUL03", NomCama: "NEUMOLOGÍA 03", Prioridad: "Urgente", CodServicio: "903866", NomServicio: "TRANSAMINASA GLUTAMICO OXALACETICA (AST)", Observaciones: "Insuficiencia respiratoria" },
        { Ide_Paciente: "8888888", Nom_Paciente: "FERNANDO RUIZ", Edad: 63, Ingreso: "5889012", Folio: "258", Areasolicitante: "PUL001 - NEUMOLOGÍA", Cama: "PUL03", NomCama: "NEUMOLOGÍA 03", Prioridad: "Urgente", CodServicio: "903867", NomServicio: "FOSFORO EN SUERO U OTROS FLUIDOS", Observaciones: "Insuficiencia respiratoria" },

        // Prioritarias
        { Ide_Paciente: "4321772", Nom_Paciente: "ANTONIO DÍAZ", Edad: 34, Ingreso: "5813344", Folio: "623", Areasolicitante: "PED001 - PEDIATRÍA", Cama: "415A", NomCama: "CAMA GENERAL MEDICAS 2", Prioridad: "Prioritaria", CodServicio: "903895", NomServicio: "PROTEINA C REACTIVA ALTA PRECISION AUTOMATIZADA", Observaciones: "Control inflamatorio" },
        { Ide_Paciente: "1010101", Nom_Paciente: "LUCÍA HERRERA", Edad: 28, Ingreso: "5890123", Folio: "369", Areasolicitante: "GIN001 - GINECOLOGÍA", Cama: "GIN07", NomCama: "GINECOLOGÍA 07", Prioridad: "Prioritaria", CodServicio: "906913", NomServicio: "HEMOGRAMA IV", Observaciones: "Control pre-quirúrgico" },
        { Ide_Paciente: "1212121", Nom_Paciente: "RICARDO VEGA", Edad: 49, Ingreso: "5901234", Folio: "741", Areasolicitante: "ORT001 - ORTOPEDIA", Cama: "ORT04", NomCama: "ORTOPEDIA 04", Prioridad: "Prioritaria", CodServicio: "903854", NomServicio: "CALCIO SEMIAUTOMATIZADO", Observaciones: "Fractura múltiple" },
        { Ide_Paciente: "1313131", Nom_Paciente: "SOFIA CASTRO", Edad: 61, Ingreso: "5912345", Folio: "852", Areasolicitante: "END001 - ENDOCRINOLOGÍA", Cama: "END02", NomCama: "ENDOCRINOLOGÍA 02", Prioridad: "Prioritaria", CodServicio: "903835", NomServicio: "MAGNESIO EN SUERO U OTROS FLUIDOS", Observaciones: "Diabetes descompensada" },
        { Ide_Paciente: "1414141", Nom_Paciente: "GABRIEL MORA", Edad: 47, Ingreso: "5923456", Folio: "963", Areasolicitante: "URO001 - UROLOGÍA", Cama: "URO06", NomCama: "UROLOGÍA 06", Prioridad: "Prioritaria", CodServicio: "903810", NomServicio: "CLORO", Observaciones: "Litiasis renal" },
        { Ide_Paciente: "1515151", Nom_Paciente: "NATALIA PEÑA", Edad: 35, Ingreso: "5934567", Folio: "159", Areasolicitante: "HEM001 - HEMATOLOGÍA", Cama: "HEM01", NomCama: "HEMATOLOGÍA 01", Prioridad: "Prioritaria", CodServicio: "906913", NomServicio: "HEMOGRAMA IV", Observaciones: "Anemia severa" },
        { Ide_Paciente: "1616161", Nom_Paciente: "ALBERTO SILVA", Edad: 52, Ingreso: "5945678", Folio: "357", Areasolicitante: "NEF001 - NEFROLOGÍA", Cama: "NEF03", NomCama: "NEFROLOGÍA 03", Prioridad: "Prioritaria", CodServicio: "903813", NomServicio: "POTASIO EN SUERO U OTROS FLUIDOS", Observaciones: "Insuficiencia renal" },

        // Rutinarias
        { Ide_Paciente: "1234567", Nom_Paciente: "MARÍA LÓPEZ", Edad: 41, Ingreso: "5956789", Folio: "468", Areasolicitante: "MED001 - MEDICINA INTERNA", Cama: "201B", NomCama: "MEDICINA GENERAL 201B", Prioridad: "Rutinario", CodServicio: "903854", NomServicio: "CALCIO SEMIAUTOMATIZADO", Observaciones: "Control rutinario" },
        { Ide_Paciente: "2020202", Nom_Paciente: "DIEGO CAMPOS", Edad: 39, Ingreso: "5967890", Folio: "579", Areasolicitante: "MED002 - MEDICINA INTERNA", Cama: "MED12", NomCama: "MEDICINA 12", Prioridad: "Rutinario", CodServicio: "903835", NomServicio: "MAGNESIO EN SUERO U OTROS FLUIDOS", Observaciones: "Chequeo anual" },
        { Ide_Paciente: "2121212", Nom_Paciente: "VALERIA ROMERO", Edad: 33, Ingreso: "5978901", Folio: "680", Areasolicitante: "DER001 - DERMATOLOGÍA", Cama: "DER05", NomCama: "DERMATOLOGÍA 05", Prioridad: "Electivo", CodServicio: "906913", NomServicio: "HEMOGRAMA IV", Observaciones: "Pre-procedimiento" },
        { Ide_Paciente: "2222323", Nom_Paciente: "ANDRÉS JIMÉNEZ", Edad: 58, Ingreso: "5989012", Folio: "791", Areasolicitante: "PSI001 - PSIQUIATRÍA", Cama: "PSI08", NomCama: "PSIQUIATRÍA 08", Prioridad: "Control", CodServicio: "903866", NomServicio: "TRANSAMINASA GLUTAMICO OXALACETICA", Observaciones: "Control medicación" },
        { Ide_Paciente: "2424242", Nom_Paciente: "CRISTINA VARGAS", Edad: 44, Ingreso: "5990123", Folio: "802", Areasolicitante: "REU001 - REUMATOLOGÍA", Cama: "REU02", NomCama: "REUMATOLOGÍA 02", Prioridad: "Rutinario", CodServicio: "903895", NomServicio: "PROTEINA C REACTIVA ALTA PRECISION", Observaciones: "Seguimiento artritis" },
        { Ide_Paciente: "2525252", Nom_Paciente: "MANUEL TORRES", Edad: 50, Ingreso: "5901234", Folio: "913", Areasolicitante: "OFT001 - OFTALMOLOGÍA", Cama: "OFT04", NomCama: "OFTALMOLOGÍA 04", Prioridad: "Electivo", CodServicio: "903854", NomServicio: "CALCIO SEMIAUTOMATIZADO", Observaciones: "Pre-cirugía de cataratas" },
        { Ide_Paciente: "2626262", Nom_Paciente: "ROSARIO MENDEZ", Edad: 65, Ingreso: "5912345", Folio: "024", Areasolicitante: "GER001 - GERIATRÍA", Cama: "GER06", NomCama: "GERIATRÍA 06", Prioridad: "Rutinario", CodServicio: "902045", NomServicio: "TIEMPO DE PROTROMBINA (TP)", Observaciones: "Control anticoagulación" },
        { Ide_Paciente: "2727272", Nom_Paciente: "ESTEBAN AGUIRRE", Edad: 37, Ingreso: "5923456", Folio: "135", Areasolicitante: "OTO001 - OTORRINOLARINGOLOGÍA", Cama: "OTO03", NomCama: "OTORRINO 03", Prioridad: "Electivo", CodServicio: "906913", NomServicio: "HEMOGRAMA IV", Observaciones: "Pre-amigdalectomía" }
    ];

    // Función principal para cargar solicitudes
    const cargarSolicitudes = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Cargando solicitudes con filtro:', filtro);
            console.log('🧪 Usar datos de prueba:', usarDatosPrueba);

            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 800));

            let dataFiltrada = [];

            if (filtro === 'tomadas') {
                console.log('📋 Cargando exámenes tomados desde backend...');

                try {
                    // ✅ Usar el servicio correcto
                    const examenesTomadosRaw = await ExamenesTomadosService.getExamenesTomados();
                    console.log('📥 Datos del backend:', examenesTomadosRaw);

                    // Convertir al formato esperado por el frontend
                    dataFiltrada = convertirExamenesTomadosAVista(examenesTomadosRaw);
                    console.log('🔄 Datos convertidos:', dataFiltrada);

                } catch (backendError) {
                    console.warn('⚠️ Error conectando al backend, usando datos vacíos:', backendError);
                    setError('Error conectando al backend, usando datos vacíos: ' + backendError.message);
                    dataFiltrada = [];
                }

            } else {
                // Para 'actuales' - usar datos de prueba siempre (por ahora)
                console.log('🧪 Usando datos de prueba para actuales');
                dataFiltrada = [...datosPrueba]; // ✅ Hacer copia de los datos
            }

            console.log('📊 Datos filtrados finales:', dataFiltrada);

            if (dataFiltrada.length > 0) {
                const pacientesAgrupados = agruparPorPaciente(dataFiltrada);
                const solicitudesOrganizadas = organizarPorPrioridad(pacientesAgrupados);
                setSolicitudesData(solicitudesOrganizadas);
            } else {
                // Si no hay datos, establecer estructura vacía
                setSolicitudesData({
                    urgentes: [],
                    prioritario: [],
                    rutinario: []
                });
            }

        } catch (err) {
            setError('Error cargando solicitudes: ' + err.message);
            console.error('❌ Error cargando solicitudes:', err);
            // En caso de error, establecer datos vacíos
            setSolicitudesData({
                urgentes: [],
                prioritario: [],
                rutinario: []
            });
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar exámenes tomados desde backend local
    const cargarExamenesTomados = async () => {
        try {
            const examenes = await SolicitudesService.getExamenesTomados();
            setExamenesTomados(examenes);
            return examenes;
        } catch (error) {
            console.error('Error cargando exámenes tomados:', error);
            return [];
        }
    };

    // Función para filtrar exámenes ya tomados
    const filtrarExamenesNoTomados = (solicitudes, examenesTomados) => {
        return solicitudes.filter(solicitud => {
            // Buscar si existe un examen tomado para esta combinación
            const examenTomado = examenesTomados.find(tomado =>
                tomado.historia === solicitud.IdePaciente &&
                tomado.numeroIngreso === solicitud.Ingreso &&
                tomado.numeroFolio === solicitud.Folio &&
                tomado.nomServicio === solicitud.NomServicio
            );

            // Si no está en tomados, incluir en actuales
            return !examenTomado;
        });
    };

    // Función para convertir exámenes tomados a formato de vista
    const convertirExamenesTomadosAVista = (examenesTomados) => {
        console.log('🔄 Convirtiendo exámenes tomados:', examenesTomados);

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

    // Función para mapear datos de prueba a formato backend
    const mapearDatosPruebaABackend = (solicitud, examIndex) => {
        return {
            historia: solicitud.IdePaciente,
            nomPaciente: solicitud.NomPaciente,
            edad: solicitud.Edad,
            numeroIngreso: solicitud.Ingreso,
            numeroFolio: solicitud.Folio,
            cama: solicitud.Cama,
            nomCama: solicitud.NomCama,
            areaSolicitante: solicitud.Areasolicitante,
            prioridad: solicitud.Prioridad,
            codServicio: solicitud.CodServicio,
            nomServicio: solicitud.examenes ? solicitud.examenes[examIndex] : solicitud.NomServicio,
            observaciones: solicitud.Observaciones,
            fechaTomado: new Date().toISOString(),
            responsable: 'Usuario Prueba'
        };
    };

    // Función para agrupar servicios por paciente
    const agruparPorPaciente = (solicitudes) => {
        console.log('📊 Agrupando solicitudes por paciente:', solicitudes);

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

                // ✅ Extraer servicio de forma segura
                if (solicitud.Areasolicitante && typeof solicitud.Areasolicitante === 'string') {
                    const partes = solicitud.Areasolicitante.split(' - ');
                    pacientesMap[key].servicio = partes.length > 1 ? partes[1] : solicitud.Areasolicitante;
                } else {
                    pacientesMap[key].servicio = 'Laboratorio';
                }
            }

            // Agregar el examen a la lista
            pacientesMap[key].examenes.push(solicitud.NomServicio);
        });

        console.log('✅ Pacientes agrupados:', Object.values(pacientesMap));
        return Object.values(pacientesMap);
    };

    // Función para organizar por prioridad
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

    // Función para paginar datos
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

    // Funciones de paginación
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

    // Función para marcar exámenes como tomados
    const marcarExamenesTomados = async (solicitud, examenesIndices) => {
        try {
            setLoading(true);
            console.log('📤 Marcando exámenes como tomados:', { solicitud, examenesIndices });

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
                fechaTomado: new Date().toISOString(),
                responsable: 'Usuario Sistema'
            }));

            console.log('📋 Datos a enviar al backend:', examenesTomados);

            // Enviar al backend
            await ExamenesTomadosService.crearMultiplesExamenes(examenesTomados);

            console.log('✅ Exámenes guardados exitosamente');

            // Recargar solicitudes para actualizar la vista
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

    useEffect(() => {
        resetPagination();
        cargarSolicitudes();
    }, [filtro]);

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
        itemsPerPage
    };
};
