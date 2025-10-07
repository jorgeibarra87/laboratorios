// src/LaboratorioApp/hook/useSolicitudes.jsx
import { useState, useEffect } from 'react';

export const useSolicitudes = (filtro = 'actuales', usarDatosPrueba = false) => {
    const [solicitudesData, setSolicitudesData] = useState({
        urgentes: [],
        prioritario: [],
        rutinario: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        { Ide_Paciente: "25268415", Nom_Paciente: "OLIVA PUNGO", Edad: 45, Ingreso: "5805058", Folio: "2299", Area_solicitante: "LAB001 - LABORATORIO CLÍNICO", Cama: "320A", Nom_Cama: "MEDICO QUIRURGICAS 320A", Prioridad: "Urgente", Cod_Servicio: "879111", Nom_Servicio: "TOMOGRAFIA COMPUTADA DE CRANEO SIN CONTRASTE", Observaciones: "Paciente con sospecha de ACV" },
        { Ide_Paciente: "25268415", Nom_Paciente: "OLIVA PUNGO", Edad: 45, Ingreso: "5805058", Folio: "2299", Area_solicitante: "LAB001 - LABORATORIO CLÍNICO", Cama: "320A", Nom_Cama: "MEDICO QUIRURGICAS 320A", Prioridad: "Urgente", Cod_Servicio: "871121", Nom_Servicio: "RADIOGRAFIA DE TORAX (P.A O A.P. Y LATERAL)", Observaciones: "Control post operatorio" },
        { Ide_Paciente: "9876543", Nom_Paciente: "CARLOS RIVERA", Edad: 32, Ingreso: "5798017", Folio: "2278", Area_solicitante: "URG001 - URGENCIAS", Cama: "100A", Nom_Cama: "URGENCIAS 100A", Prioridad: "Muy Urgente", Cod_Servicio: "903813", Nom_Servicio: "POTASIO EN SUERO U OTROS FLUIDOS", Observaciones: "Emergencia cardiológica" },
        { Ide_Paciente: "1111111", Nom_Paciente: "ANA MARTÍN", Edad: 67, Ingreso: "5813344", Folio: "623", Area_solicitante: "UCI001 - UCI", Cama: "UCI01", Nom_Cama: "UCI CAMA 01", Prioridad: "Urgente", Cod_Servicio: "906913", Nom_Servicio: "HEMOGRAMA IV (HEMOGLOBINA HEMATOCRITO RECUENTO Y FORMULA)", Observaciones: "Seguimiento hematológico urgente" },
        { Ide_Paciente: "2222222", Nom_Paciente: "LUIS GARCÍA", Edad: 54, Ingreso: "5821456", Folio: "789", Area_solicitante: "EMR001 - EMERGENCIAS", Cama: "EMR05", Nom_Cama: "EMERGENCIAS 05", Prioridad: "Urgente", Cod_Servicio: "903895", Nom_Servicio: "PROTEINA C REACTIVA ALTA PRECISION AUTOMATIZADA", Observaciones: "Proceso infeccioso severo" },
        { Ide_Paciente: "3333333", Nom_Paciente: "CARMEN LÓPEZ", Edad: 29, Ingreso: "5834567", Folio: "456", Area_solicitante: "MAT001 - MATERNIDAD", Cama: "MAT10", Nom_Cama: "MATERNIDAD 10", Prioridad: "Urgente", Cod_Servicio: "903854", Nom_Servicio: "CALCIO SEMIAUTOMATIZADO", Observaciones: "Pre-eclampsia" },
        { Ide_Paciente: "4444444", Nom_Paciente: "JOSÉ RODRÍGUEZ", Edad: 71, Ingreso: "5845678", Folio: "321", Area_solicitante: "CAR001 - CARDIOLOGÍA", Cama: "CAR03", Nom_Cama: "CARDIOLOGÍA 03", Prioridad: "Muy Urgente", Cod_Servicio: "903810", Nom_Servicio: "CLORO", Observaciones: "Arritmia severa" },
        { Ide_Paciente: "5555555", Nom_Paciente: "ELENA MORALES", Edad: 38, Ingreso: "5856789", Folio: "987", Area_solicitante: "NEU001 - NEUROLOGÍA", Cama: "NEU02", Nom_Cama: "NEUROLOGÍA 02", Prioridad: "Urgente", Cod_Servicio: "903867", Nom_Servicio: "FOSFORO EN SUERO U OTROS FLUIDOS", Observaciones: "Alteración de conciencia" },
        { Ide_Paciente: "6666666", Nom_Paciente: "MIGUEL SANTOS", Edad: 42, Ingreso: "5867890", Folio: "654", Area_solicitante: "CIR001 - CIRUGÍA", Cama: "CIR08", Nom_Cama: "CIRUGÍA 08", Prioridad: "Urgente", Cod_Servicio: "903866", Nom_Servicio: "TRANSAMINASA GLUTAMICO OXALACETICA (AST)", Observaciones: "Post operatorio inmediato" },
        { Ide_Paciente: "7777777", Nom_Paciente: "PATRICIA DÍAZ", Edad: 56, Ingreso: "5878901", Folio: "147", Area_solicitante: "GAS001 - GASTROENTEROLOGÍA", Cama: "GAS05", Nom_Cama: "GASTROENTEROLOGÍA 05", Prioridad: "Urgente", Cod_Servicio: "902045", Nom_Servicio: "TIEMPO DE PROTROMBINA (TP)", Observaciones: "Sangrado digestivo" },
        { Ide_Paciente: "8888888", Nom_Paciente: "FERNANDO RUIZ", Edad: 63, Ingreso: "5889012", Folio: "258", Area_solicitante: "PUL001 - NEUMOLOGÍA", Cama: "PUL03", Nom_Cama: "NEUMOLOGÍA 03", Prioridad: "Urgente", Cod_Servicio: "903828", Nom_Servicio: "DESHIDROGENASA LACTICA", Observaciones: "Insuficiencia respiratoria" },

        // Prioritarias
        { Ide_Paciente: "4321772", Nom_Paciente: "ANTONIO DÍAZ", Edad: 34, Ingreso: "5813344", Folio: "623", Area_solicitante: "PED001 - PEDIATRÍA", Cama: "415A", Nom_Cama: "CAMA GENERAL MEDICAS 2", Prioridad: "Prioritaria", Cod_Servicio: "903895", Nom_Servicio: "PROTEINA C REACTIVA ALTA PRECISION AUTOMATIZADA", Observaciones: "Control inflamatorio" },
        { Ide_Paciente: "1010101", Nom_Paciente: "LUCÍA HERRERA", Edad: 28, Ingreso: "5890123", Folio: "369", Area_solicitante: "GIN001 - GINECOLOGÍA", Cama: "GIN07", Nom_Cama: "GINECOLOGÍA 07", Prioridad: "Prioritaria", Cod_Servicio: "906913", Nom_Servicio: "HEMOGRAMA IV", Observaciones: "Control pre-quirúrgico" },
        { Ide_Paciente: "1212121", Nom_Paciente: "RICARDO VEGA", Edad: 49, Ingreso: "5901234", Folio: "741", Area_solicitante: "ORT001 - ORTOPEDIA", Cama: "ORT04", Nom_Cama: "ORTOPEDIA 04", Prioridad: "Prioritaria", Cod_Servicio: "903854", Nom_Servicio: "CALCIO SEMIAUTOMATIZADO", Observaciones: "Fractura múltiple" },
        { Ide_Paciente: "1313131", Nom_Paciente: "SOFIA CASTRO", Edad: 61, Ingreso: "5912345", Folio: "852", Area_solicitante: "END001 - ENDOCRINOLOGÍA", Cama: "END02", Nom_Cama: "ENDOCRINOLOGÍA 02", Prioridad: "Prioritaria", Cod_Servicio: "903835", Nom_Servicio: "MAGNESIO EN SUERO U OTROS FLUIDOS", Observaciones: "Diabetes descompensada" },
        { Ide_Paciente: "1414141", Nom_Paciente: "GABRIEL MORA", Edad: 47, Ingreso: "5923456", Folio: "963", Area_solicitante: "URO001 - UROLOGÍA", Cama: "URO06", Nom_Cama: "UROLOGÍA 06", Prioridad: "Prioritaria", Cod_Servicio: "903810", Nom_Servicio: "CLORO", Observaciones: "Litiasis renal" },
        { Ide_Paciente: "1515151", Nom_Paciente: "NATALIA PEÑA", Edad: 35, Ingreso: "5934567", Folio: "159", Area_solicitante: "HEM001 - HEMATOLOGÍA", Cama: "HEM01", Nom_Cama: "HEMATOLOGÍA 01", Prioridad: "Prioritaria", Cod_Servicio: "906913", Nom_Servicio: "HEMOGRAMA IV", Observaciones: "Anemia severa" },
        { Ide_Paciente: "1616161", Nom_Paciente: "ALBERTO SILVA", Edad: 52, Ingreso: "5945678", Folio: "357", Area_solicitante: "NEF001 - NEFROLOGÍA", Cama: "NEF03", Nom_Cama: "NEFROLOGÍA 03", Prioridad: "Prioritaria", Cod_Servicio: "903813", Nom_Servicio: "POTASIO EN SUERO U OTROS FLUIDOS", Observaciones: "Insuficiencia renal" },

        // Rutinarias
        { Ide_Paciente: "1234567", Nom_Paciente: "MARÍA LÓPEZ", Edad: 41, Ingreso: "5956789", Folio: "468", Area_solicitante: "MED001 - MEDICINA INTERNA", Cama: "201B", Nom_Cama: "MEDICINA GENERAL 201B", Prioridad: "Rutinario", Cod_Servicio: "903854", Nom_Servicio: "CALCIO SEMIAUTOMATIZADO", Observaciones: "Control rutinario" },
        { Ide_Paciente: "2020202", Nom_Paciente: "DIEGO CAMPOS", Edad: 39, Ingreso: "5967890", Folio: "579", Area_solicitante: "MED002 - MEDICINA INTERNA", Cama: "MED12", Nom_Cama: "MEDICINA 12", Prioridad: "Rutinario", Cod_Servicio: "903835", Nom_Servicio: "MAGNESIO EN SUERO U OTROS FLUIDOS", Observaciones: "Chequeo anual" },
        { Ide_Paciente: "2121212", Nom_Paciente: "VALERIA ROMERO", Edad: 33, Ingreso: "5978901", Folio: "680", Area_solicitante: "DER001 - DERMATOLOGÍA", Cama: "DER05", Nom_Cama: "DERMATOLOGÍA 05", Prioridad: "Electivo", Cod_Servicio: "906913", Nom_Servicio: "HEMOGRAMA IV", Observaciones: "Pre-procedimiento" },
        { Ide_Paciente: "2222323", Nom_Paciente: "ANDRÉS JIMÉNEZ", Edad: 58, Ingreso: "5989012", Folio: "791", Area_solicitante: "PSI001 - PSIQUIATRÍA", Cama: "PSI08", Nom_Cama: "PSIQUIATRÍA 08", Prioridad: "Control", Cod_Servicio: "903866", Nom_Servicio: "TRANSAMINASA GLUTAMICO OXALACETICA", Observaciones: "Control medicación" },
        { Ide_Paciente: "2424242", Nom_Paciente: "CRISTINA VARGAS", Edad: 44, Ingreso: "5990123", Folio: "802", Area_solicitante: "REU001 - REUMATOLOGÍA", Cama: "REU02", Nom_Cama: "REUMATOLOGÍA 02", Prioridad: "Rutinario", Cod_Servicio: "903895", Nom_Servicio: "PROTEINA C REACTIVA ALTA PRECISION", Observaciones: "Seguimiento artritis" },
        { Ide_Paciente: "2525252", Nom_Paciente: "MANUEL TORRES", Edad: 50, Ingreso: "5901234", Folio: "913", Area_solicitante: "OFT001 - OFTALMOLOGÍA", Cama: "OFT04", Nom_Cama: "OFTALMOLOGÍA 04", Prioridad: "Electivo", Cod_Servicio: "903854", Nom_Servicio: "CALCIO SEMIAUTOMATIZADO", Observaciones: "Pre-cirugía de cataratas" },
        { Ide_Paciente: "2626262", Nom_Paciente: "ROSARIO MENDEZ", Edad: 65, Ingreso: "5912345", Folio: "024", Area_solicitante: "GER001 - GERIATRÍA", Cama: "GER06", Nom_Cama: "GERIATRÍA 06", Prioridad: "Rutinario", Cod_Servicio: "902045", Nom_Servicio: "TIEMPO DE PROTROMBINA (TP)", Observaciones: "Control anticoagulación" },
        { Ide_Paciente: "2727272", Nom_Paciente: "ESTEBAN AGUIRRE", Edad: 37, Ingreso: "5923456", Folio: "135", Area_solicitante: "OTO001 - OTORRINOLARINGOLOGÍA", Cama: "OTO03", Nom_Cama: "OTORRINO 03", Prioridad: "Electivo", Cod_Servicio: "906913", Nom_Servicio: "HEMOGRAMA IV", Observaciones: "Pre-amigdalectomía" }
    ];

    // Función para agrupar servicios por paciente
    const agruparPorPaciente = (solicitudes) => {
        const pacientesMap = {};

        solicitudes.forEach(solicitud => {
            const key = solicitud.Ide_Paciente;

            if (!pacientesMap[key]) {
                pacientesMap[key] = {
                    id: solicitud.Ide_Paciente,
                    paciente: solicitud.Nom_Paciente,
                    edad: solicitud.Edad,
                    historia: solicitud.Ide_Paciente,
                    ingreso: solicitud.Ingreso,
                    folio: solicitud.Folio,
                    cama: solicitud.Cama,
                    nombreCama: solicitud.Nom_Cama,
                    fechaSolicitud: new Date().toLocaleDateString(),
                    servicio: solicitud.Area_solicitante.split(' - ')[1] || solicitud.Area_solicitante,
                    codigoServicio: solicitud.Cod_Servicio,
                    areaSolicitante: solicitud.Area_solicitante,
                    estado: 'Actual',
                    prioridad: solicitud.Prioridad,
                    observaciones: solicitud.Observaciones || '',
                    examenes: []
                };
            }

            pacientesMap[key].examenes.push(solicitud.Nom_Servicio);
        });

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

    const cargarSolicitudes = async () => {
        try {
            setLoading(true);
            setError(null);

            // Simular delay de API
            await new Promise(resolve => setTimeout(resolve, 800));
            // Filtrar datos según el filtro seleccionado
            let dataFiltrada = datosPrueba;
            if (filtro === 'pendientes') {
                // Simular filtro de pendientes
                dataFiltrada = datosPrueba.slice(0, 15);
            } else if (filtro === 'tomadas') {
                // Simular filtro de tomadas
                dataFiltrada = datosPrueba.slice(15, 25);
            }

            const pacientesAgrupados = agruparPorPaciente(dataFiltrada);
            const solicitudesOrganizadas = organizarPorPrioridad(pacientesAgrupados);
            setSolicitudesData(solicitudesOrganizadas);

        } catch (err) {
            setError(err.message);
            console.error('Error cargando solicitudes:', err);
        } finally {
            setLoading(false);
        }
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

    useEffect(() => {
        resetPagination();
        cargarSolicitudes();
    }, [filtro]);

    return {
        solicitudesData,
        loading,
        error,
        cargarSolicitudes,
        paginateData,
        changePage,
        currentPage,
        itemsPerPage
    };
};
