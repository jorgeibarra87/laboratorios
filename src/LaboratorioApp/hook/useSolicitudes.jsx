// hook/useSolicitudes.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import ExamenesTomadosService from '../Services/ExamenesTomadosService';
import SolicitudesService from '../Services/SolicitudesService';

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
    const [examenesCache, setExamenesCache] = useState({});


    // Paginación
    const [currentPage, setCurrentPage] = useState({
        urgentes: 1,
        prioritario: 1,
        rutinario: 1
    });
    const itemsPerPage = 5;

    // DATOS DE PRUEBA
    const datosPruebaResumenPacientes = {
        urgentes: [
            {
                ingreso: 5805058,
                fechaSolicitud: "2025-10-10T08:30:00.000",
                nomPaciente: "OLIVA PUNGO",
                areaSolicitante: "LAB001 - LABORATORIO CLÍNICO",
                idePaciente: "25268415",
                cantidadExamenes: 5,
                edad: 45,
                folio: 2299,
                cama: "MEDICO QUIRURGICAS 320A"
            },
            {
                ingreso: 5798017,
                fechaSolicitud: "2025-10-14T08:30:00.000",
                nomPaciente: "CARLOS RIVERA",
                areaSolicitante: "URG001 - URGENCIAS",
                idePaciente: "9876543",
                cantidadExamenes: 3,
                edad: 32,
                folio: 2278,
                cama: "URGENCIAS 100A"
            },
            {
                ingreso: 5813344,
                fechaSolicitud: "2025-10-13T08:30:00.000",
                nomPaciente: "ANA MARTÍN",
                areaSolicitante: "UCI001 - UCI",
                idePaciente: "1111111",
                cantidadExamenes: 7,
                edad: 67,
                folio: 623,
                cama: "UCI CAMA 01"
            },
            {
                ingreso: 5889012,
                fechaSolicitud: "2025-10-04T08:30:00.000",
                nomPaciente: "FERNANDO RUIZ",
                areaSolicitante: "PUL001 - NEUMOLOGÍA",
                idePaciente: "8888888",
                cantidadExamenes: 8,
                edad: 63,
                folio: 258,
                cama: "NEUMOLOGÍA 03"
            }
        ],
        prioritarios: [
            {
                ingreso: 5813344,
                fechaSolicitud: "2025-10-01T08:30:00.000",
                nomPaciente: "ANTONIO DÍAZ",
                areaSolicitante: "PED001 - PEDIATRÍA",
                idePaciente: "4321772",
                cantidadExamenes: 3,
                edad: 34,
                folio: 623,
                cama: "CAMA GENERAL MEDICAS 2"
            },
            {
                ingreso: 5890123,
                fechaSolicitud: "2025-10-13T08:30:00.000",
                nomPaciente: "LUCÍA HERRERA",
                areaSolicitante: "GIN001 - GINECOLOGÍA",
                idePaciente: "1010101",
                cantidadExamenes: 2,
                edad: 28,
                folio: 369,
                cama: "GINECOLOGÍA 07"
            }
        ],
        rutinarios: [
            {
                ingreso: 5956789,
                fechaSolicitud: "2025-10-07T08:30:00.000",
                nomPaciente: "MARÍA LÓPEZ",
                areaSolicitante: "MED001 - MEDICINA INTERNA",
                idePaciente: "1234567",
                cantidadExamenes: 2,
                edad: 41,
                folio: 468,
                cama: "MEDICINA GENERAL 201B"
            },
            {
                ingreso: 5967890,
                fechaSolicitud: "2025-10-06T08:30:00.000",
                nomPaciente: "DIEGO CAMPOS",
                areaSolicitante: "MED002 - MEDICINA INTERNA",
                idePaciente: "2020202",
                cantidadExamenes: 3,
                edad: 39,
                folio: 579,
                cama: "MEDICINA 12"
            }
        ]
    };

    // Datos de exámenes específicos para cada paciente (simulan la segunda consulta)
    const examenesDetallados = {
        "25268415": [
            { fechaSolicitud: "2025-10-10T08:30:00.000", codExamen: "879111", nomExamen: "TOMOGRAFIA COMPUTADA DE CRANEO SIN CONTRASTE" },
            { fechaSolicitud: "2025-10-11T08:30:00.000", codExamen: "871121", nomExamen: "RADIOGRAFIA DE TORAX (P.A O A.P. Y LATERAL)" },
            { fechaSolicitud: "2025-10-10T08:30:00.000", codExamen: "903813", nomExamen: "POTASIO EN SUERO U OTROS FLUIDOS" },
            { fechaSolicitud: "2025-10-10T08:30:00.000", codExamen: "906913", nomExamen: "HEMOGRAMA IV (HEMOGLOBINA HEMATOCRITO RECUENTO Y FORMULA)" },
            { fechaSolicitud: "2025-10-10T08:30:00.000", codExamen: "903895", nomExamen: "PROTEINA C REACTIVA ALTA PRECISION AUTOMATIZADA" }
        ],
        "9876543": [
            { fechaSolicitud: "2025-10-14T08:30:00.000", codExamen: "903813", nomExamen: "POTASIO EN SUERO U OTROS FLUIDOS" },
            { fechaSolicitud: "2025-10-14T08:30:00.000", codExamen: "903854", nomExamen: "CALCIO SEMIAUTOMATIZADO" },
            { fechaSolicitud: "2025-10-14T08:30:00.000", codExamen: "906913", nomExamen: "HEMOGRAMA IV" }
        ],
        "1111111": [
            { fechaSolicitud: "2025-10-13T08:30:00.000", codExamen: "906913", nomExamen: "HEMOGRAMA IV (HEMOGLOBINA HEMATOCRITO RECUENTO Y FORMULA)" },
            { fechaSolicitud: "2025-10-13T08:30:00.000", codExamen: "903895", nomExamen: "PROTEINA C REACTIVA ALTA PRECISION AUTOMATIZADA" },
            { fechaSolicitud: "2025-10-13T08:30:00.000", codExamen: "903854", nomExamen: "CALCIO SEMIAUTOMATIZADO" },
            { fechaSolicitud: "2025-10-13T08:30:00.000", codExamen: "903810", nomExamen: "CLORO" },
            { fechaSolicitud: "2025-10-13T08:30:00.000", codExamen: "903867", nomExamen: "FOSFORO EN SUERO U OTROS FLUIDOS" },
            { fechaSolicitud: "2025-10-13T08:30:00.000", codExamen: "903866", nomExamen: "TRANSAMINASA GLUTAMICO OXALACETICA (AST)" },
            { fechaSolicitud: "2025-10-13T08:30:00.000", codExamen: "902045", nomExamen: "TIEMPO DE PROTROMBINA (TP)" }
        ],
        "8888888": [
            { fechaSolicitud: "2025-10-04T08:30:00.000", codExamen: "903828", nomExamen: "DESHIDROGENASA LACTICA" },
            { fechaSolicitud: "2025-10-03T08:30:00.000", codExamen: "903866", nomExamen: "TRANSAMINASA GLUTAMICO OXALACETICA (AST)" },
            { fechaSolicitud: "2025-10-02T08:30:00.000", codExamen: "903867", nomExamen: "FOSFORO EN SUERO U OTROS FLUIDOS" },
            { fechaSolicitud: "2025-10-04T08:30:00.000", codExamen: "906913", nomExamen: "HEMOGRAMA IV" },
            { fechaSolicitud: "2025-10-04T08:30:00.000", codExamen: "903854", nomExamen: "CALCIO SEMIAUTOMATIZADO" },
            { fechaSolicitud: "2025-10-04T08:30:00.000", codExamen: "903813", nomExamen: "POTASIO EN SUERO U OTROS FLUIDOS" },
            { fechaSolicitud: "2025-10-04T08:30:00.000", codExamen: "903895", nomExamen: "PROTEINA C REACTIVA ALTA PRECISION AUTOMATIZADA" },
            { fechaSolicitud: "2025-10-04T08:30:00.000", codExamen: "902045", nomExamen: "TIEMPO DE PROTROMBINA (TP)" }
        ],
        "4321772": [
            { fechaSolicitud: "2025-10-01T08:30:00.000", codExamen: "903895", nomExamen: "PROTEINA C REACTIVA ALTA PRECISION AUTOMATIZADA" },
            { fechaSolicitud: "2025-10-01T08:30:00.000", codExamen: "906913", nomExamen: "HEMOGRAMA IV" },
            { fechaSolicitud: "2025-10-01T08:30:00.000", codExamen: "903854", nomExamen: "CALCIO SEMIAUTOMATIZADO" }
        ],
        "1010101": [
            { fechaSolicitud: "2025-10-13T08:30:00.000", codExamen: "906913", nomExamen: "HEMOGRAMA IV" },
            { fechaSolicitud: "2025-10-13T08:30:00.000", codExamen: "902045", nomExamen: "TIEMPO DE PROTROMBINA (TP)" }
        ],
        "1234567": [
            { fechaSolicitud: "2025-10-07T08:30:00.000", codExamen: "903854", nomExamen: "CALCIO SEMIAUTOMATIZADO" },
            { fechaSolicitud: "2025-10-07T08:30:00.000", codExamen: "906913", nomExamen: "HEMOGRAMA IV" }
        ],
        "2020202": [
            { fechaSolicitud: "2025-10-06T08:30:00.000", codExamen: "903835", nomExamen: "MAGNESIO EN SUERO U OTROS FLUIDOS" },
            { fechaSolicitud: "2025-10-06T08:30:00.000", codExamen: "903854", nomExamen: "CALCIO SEMIAUTOMATIZADO" },
            { fechaSolicitud: "2025-10-06T08:30:00.000", codExamen: "906913", nomExamen: "HEMOGRAMA IV" }
        ]
    };

    // Función para convertir datos de API dinamica
    const convertirDatosAPIaFormato = (datosAPI, prioridadTipo) => {
        if (!Array.isArray(datosAPI)) return [];

        return datosAPI.map(item => ({
            id: item.idePaciente,
            paciente: item.nomPaciente,
            edad: item.edad,
            historia: item.idePaciente,
            ingreso: item.ingreso,
            folio: item.folio,
            cama: item.cama,
            nombreCama: item.cama,
            fechaSolicitud: item.fechaSolicitud,
            areaSolicitante: item.areaSolicitante,
            estado: 'Actual',
            prioridad: prioridadTipo,
            cantidadExamenes: item.cantidadExamenes,
            examenes: [], // Se llenarán al expandir
            examenesDetallados: false
        }));
    };

    // función para cargar exámenes detallados
    const cargarExamenesDetallados = async (idePaciente, examenesTomados = []) => {
        try {
            // Verificar si ya están en cache
            if (examenesCache[idePaciente]) {
                const examenesCacheados = examenesCache[idePaciente];

                // Aplicar filtro de tomados a los exámenes cacheados
                const examenesDelPaciente = examenesTomados.filter(tomado => tomado.historia === idePaciente);

                return examenesCacheados.map(examen => ({
                    nombre: examen,
                    tomado: examenesDelPaciente.some(tomado => tomado.nomServicio === examen)
                }));
            }

            //console.log(`Cargando exámenes detallados para paciente: ${idePaciente}`);

            let examenes = [];

            if (!usarDatosPrueba) {
                try {
                    examenes = await SolicitudesService.getExamenesPaciente(idePaciente);
                } catch (error) {
                    console.warn('Error con API, usando datos de prueba:', error);
                    examenes = examenesDetallados[idePaciente] || [];
                }
            } else {
                examenes = examenesDetallados[idePaciente] || [];
            }

            // Convertir formato de exámenes con información de estado
            const examenesFormateados = examenes.map(examen => examen.nomExamen);

            // Aplicar filtro de tomados
            const examenesDelPaciente = examenesTomados.filter(tomado => tomado.historia === idePaciente);

            const examenesConEstado = examenesFormateados.map(examen => ({
                nombre: examen,
                tomado: examenesDelPaciente.some(tomado => tomado.nomServicio === examen)
            }));

            // Guardar en cache
            setExamenesCache(prev => ({
                ...prev,
                [idePaciente]: examenesFormateados
            }));

            return examenesConEstado;
        } catch (error) {
            console.error(`Error cargando exámenes para paciente ${idePaciente}:`, error);
            return [{ nombre: `Error cargando exámenes (${error.message})`, tomado: false }];
        }
    };

    // Función para expandir paciente y cargar sus exámenes
    const expandirPaciente = async (paciente, examenesTomados = []) => {
        if (!paciente.examenesDetallados && paciente.cantidadExamenes > 0) {
            const examenesConEstado = await cargarExamenesDetallados(paciente.historia, examenesTomados);

            // Actualizar el paciente con los exámenes detallados
            setSolicitudesData(prevData => {
                const nuevaData = { ...prevData };

                // Buscar y actualizar el paciente en la categoría correspondiente
                ['urgentes', 'prioritario', 'rutinario'].forEach(categoria => {
                    const index = nuevaData[categoria].findIndex(p => p.id === paciente.id);
                    if (index !== -1) {
                        // Separar exámenes pendientes y tomados
                        const examenesPendientes = examenesConEstado
                            .filter(examen => !examen.tomado)
                            .map(examen => examen.nombre);

                        const examenesTomados = examenesConEstado
                            .filter(examen => examen.tomado)
                            .map(examen => examen.nombre);

                        nuevaData[categoria][index] = {
                            ...nuevaData[categoria][index],
                            examenes: examenesPendientes, // Solo pendientes para lógica de marcado
                            examenesConEstado: examenesConEstado, // Todos con estado para mostrar
                            cantidadPendientes: examenesPendientes.length,
                            cantidadTomados: examenesTomados.length,
                            examenesDetallados: true
                        };
                    }
                });

                return nuevaData;
            });
        }
    };

    // FUNCIÓN: Filtrar exámenes que NO estén en tomados
    const filtrarExamenesNoTomados = (solicitudesOriginales, examenesTomados) => {
        //console.log('Filtrando exámenes no tomados...');
        //console.log('Solicitudes originales:', solicitudesOriginales.length);
        //console.log('Exámenes tomados:', examenesTomados.length);

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
                //console.log(`Examen ya tomado (omitiendo): ${solicitud.NomPaciente} - ${solicitud.NomServicio}`);
            }

            return incluir;
        });

        //console.log('Solicitudes filtradas:', examenesFiltrados.length);
        return examenesFiltrados;
    };

    // Función para convertir exámenes tomados del backend a formato vista
    const convertirExamenesTomadosAVista = (examenesTomados) => {
        // Agrupar por paciente
        const pacientesMap = {};

        examenesTomados.forEach(examen => {
            const key = examen.historia;
            if (!pacientesMap[key]) {
                pacientesMap[key] = {
                    id: examen.historia,
                    paciente: examen.nomPaciente,
                    edad: examen.edad,
                    historia: examen.historia,
                    ingreso: examen.numeroIngreso,
                    folio: examen.numeroFolio,
                    cama: examen.cama,
                    nombreCama: examen.nomCama,
                    fechaSolicitud: examen.fechaSolicitud,
                    fechaTomado: examen.fechaTomado,
                    FechaTomado: examen.fechaTomado,
                    areaSolicitante: examen.areaSolicitante,
                    estado: 'Completado',
                    prioridad: examen.prioridad,
                    observaciones: examen.observaciones || '',
                    examenes: [],
                    cantidadExamenes: 0,
                    examenesDetallados: true
                };
            }
            pacientesMap[key].examenes.push(examen.nomServicio);
            pacientesMap[key].cantidadExamenes = pacientesMap[key].examenes.length;
        });

        const pacientesAgrupados = Object.values(pacientesMap);

        // Organizar por prioridad
        return pacientesAgrupados.reduce((acc, paciente) => {
            const prioridad = paciente.prioridad?.toLowerCase();
            let categoria;
            if (prioridad?.includes('urgente') || prioridad === 'muy urgente') {
                categoria = 'urgentes';
            } else if (prioridad === 'prioritaria') {
                categoria = 'prioritario';
            } else {
                categoria = 'rutinario';
            }

            if (!acc[categoria]) acc[categoria] = [];
            acc[categoria].push(paciente);
            return acc;
        }, { urgentes: [], prioritario: [], rutinario: [] });
    };

    // Función principal para cargar solicitudes
    const cargarSolicitudes = async () => {
        try {
            setLoading(true);
            setError(null);

            await new Promise(resolve => setTimeout(resolve, 800));

            let dataFiltrada = { urgentes: [], prioritario: [], rutinario: [] };

            // obtener exámenes tomados para filtrar
            let examenesTomadosActuales = [];

            try {
                examenesTomadosActuales = await ExamenesTomadosService.getExamenesTomados();
            } catch (error) {
                console.warn('⚠️ Error obteniendo exámenes tomados para filtrado:', error);
            }

            if (filtro === 'tomadas') {
                //console.log('Cargando exámenes tomados desde backend...');
                dataFiltrada = convertirExamenesTomadosAVista(examenesTomadosActuales);
            } else {
                // Para 'actuales' lógica de filtrado individual
                if (!usarDatosPrueba) {
                    //console.log('Cargando datos desde API externa dividida...');
                    try {
                        const datosPorPrioridad = await SolicitudesService.getTodosLosPacientesPorPrioridad();

                        // Convertir datos de resumen de pacientes
                        const urgentesAPI = convertirResumenPacientes(datosPorPrioridad.urgentes, 'Urgente');
                        const prioritariosAPI = convertirResumenPacientes(datosPorPrioridad.prioritarios, 'Prioritaria');
                        const rutinariosAPI = convertirResumenPacientes(datosPorPrioridad.rutinarios, 'Rutinario');

                        //console.log('Cargando exámenes detallados y aplicando filtros...');

                        // URGENTES: Cargar exámenes detallados y filtrar individualmente
                        const urgentesConExamenes = await Promise.all(
                            urgentesAPI.map(async paciente => {
                                const examenes = await cargarExamenesDetallados(paciente.historia, examenesTomadosActuales);
                                return {
                                    ...paciente,
                                    examenes: examenes.filter(e => !e.tomado).map(e => e.nombre),
                                    examenesConEstado: examenes,
                                    examenesDetallados: true,
                                    cantidadPendientes: examenes.filter(e => !e.tomado).length,
                                    cantidadTomados: examenes.filter(e => e.tomado).length,
                                    tieneExamenesPendientes: examenes.filter(e => !e.tomado).length > 0
                                };
                            })
                        );

                        // PRIORITARIOS: Cargar exámenes detallados y filtrar individualmente
                        const prioritariosConExamenes = await Promise.all(
                            prioritariosAPI.map(async paciente => {
                                const examenes = await cargarExamenesDetallados(paciente.historia, examenesTomadosActuales);
                                return {
                                    ...paciente,
                                    examenes: examenes.filter(e => !e.tomado).map(e => e.nombre),
                                    examenesConEstado: examenes,
                                    examenesDetallados: true,
                                    cantidadPendientes: examenes.filter(e => !e.tomado).length,
                                    cantidadTomados: examenes.filter(e => e.tomado).length,
                                    tieneExamenesPendientes: examenes.filter(e => !e.tomado).length > 0
                                };
                            })
                        );

                        // RUTINARIOS: Cargar exámenes detallados y filtrar individualmente
                        const rutinariosConExamenes = await Promise.all(
                            rutinariosAPI.map(async paciente => {
                                const examenes = await cargarExamenesDetallados(paciente.historia, examenesTomadosActuales);
                                return {
                                    ...paciente,
                                    examenes: examenes.filter(e => !e.tomado).map(e => e.nombre),
                                    examenesConEstado: examenes,
                                    examenesDetallados: true,
                                    cantidadPendientes: examenes.filter(e => !e.tomado).length,
                                    cantidadTomados: examenes.filter(e => e.tomado).length,
                                    tieneExamenesPendientes: examenes.filter(e => !e.tomado).length > 0
                                };
                            })
                        );

                        // Filtrar solo pacientes que tengan exámenes pendientes
                        dataFiltrada = {
                            urgentes: urgentesConExamenes.filter(p => p.tieneExamenesPendientes),
                            prioritario: prioritariosConExamenes.filter(p => p.tieneExamenesPendientes),
                            rutinario: rutinariosConExamenes.filter(p => p.tieneExamenesPendientes)
                        };

                        //console.log('Datos cargados desde API externa con filtrado');

                    } catch (apiError) {
                        console.error('❌ Error cargando desde API externa, usando datos de prueba:', apiError);
                        // usar datos de prueba
                        const urgentesAPI = convertirResumenPacientes(datosPruebaResumenPacientes.urgentes, 'Urgente');
                        const prioritariosAPI = convertirResumenPacientes(datosPruebaResumenPacientes.prioritarios, 'Prioritaria');
                        const rutinariosAPI = convertirResumenPacientes(datosPruebaResumenPacientes.rutinarios, 'Rutinario');

                        // URGENTES: Aplicar filtrado con datos de prueba
                        const urgentesConExamenes = await Promise.all(
                            urgentesAPI.map(async paciente => {
                                const examenes = await cargarExamenesDetallados(paciente.historia, examenesTomadosActuales);
                                return {
                                    ...paciente,
                                    examenes: examenes.filter(e => !e.tomado).map(e => e.nombre),
                                    examenesConEstado: examenes,
                                    examenesDetallados: true,
                                    cantidadPendientes: examenes.filter(e => !e.tomado).length,
                                    cantidadTomados: examenes.filter(e => e.tomado).length,
                                    tieneExamenesPendientes: examenes.filter(e => !e.tomado).length > 0
                                };
                            })
                        );

                        // PRIORITARIOS BACK
                        const prioritariosConExamenes = await Promise.all(
                            prioritariosAPI.map(async paciente => {
                                const examenes = await cargarExamenesDetallados(paciente.historia, examenesTomadosActuales);
                                return {
                                    ...paciente,
                                    examenes: examenes.filter(e => !e.tomado).map(e => e.nombre),
                                    examenesConEstado: examenes,
                                    examenesDetallados: true,
                                    cantidadPendientes: examenes.filter(e => !e.tomado).length,
                                    cantidadTomados: examenes.filter(e => e.tomado).length,
                                    tieneExamenesPendientes: examenes.filter(e => !e.tomado).length > 0
                                };
                            })
                        );

                        // RUTINARIOS BACK
                        const rutinariosConExamenes = await Promise.all(
                            rutinariosAPI.map(async paciente => {
                                const examenes = await cargarExamenesDetallados(paciente.historia, examenesTomadosActuales);
                                return {
                                    ...paciente,
                                    examenes: examenes.filter(e => !e.tomado).map(e => e.nombre),
                                    examenesConEstado: examenes,
                                    examenesDetallados: true,
                                    cantidadPendientes: examenes.filter(e => !e.tomado).length,
                                    cantidadTomados: examenes.filter(e => e.tomado).length,
                                    tieneExamenesPendientes: examenes.filter(e => !e.tomado).length > 0
                                };
                            })
                        );

                        dataFiltrada = {
                            urgentes: urgentesConExamenes.filter(p => p.tieneExamenesPendientes),
                            prioritario: prioritariosConExamenes.filter(p => p.tieneExamenesPendientes),
                            rutinario: rutinariosConExamenes.filter(p => p.tieneExamenesPendientes)
                        };

                    }
                } else {
                    // Para 'actuales' - usar datos de prueba directamente

                    const urgentesAPI = convertirResumenPacientes(datosPruebaResumenPacientes.urgentes, 'Urgente');
                    const prioritariosAPI = convertirResumenPacientes(datosPruebaResumenPacientes.prioritarios, 'Prioritaria');
                    const rutinariosAPI = convertirResumenPacientes(datosPruebaResumenPacientes.rutinarios, 'Rutinario');


                    // URGENTES DATOS DE PRUEBA: Cargar exámenes detallados y filtrar
                    const urgentesConExamenes = await Promise.all(
                        urgentesAPI.map(async paciente => {
                            const examenes = await cargarExamenesDetallados(paciente.historia, examenesTomadosActuales);
                            return {
                                ...paciente,
                                examenes: examenes.filter(e => !e.tomado).map(e => e.nombre),
                                examenesConEstado: examenes,
                                examenesDetallados: true,
                                cantidadPendientes: examenes.filter(e => !e.tomado).length,
                                cantidadTomados: examenes.filter(e => e.tomado).length,
                                tieneExamenesPendientes: examenes.filter(e => !e.tomado).length > 0
                            };
                        })
                    );

                    // PRIORITARIOS DATOS DE PRUEBA
                    const prioritariosConExamenes = await Promise.all(
                        prioritariosAPI.map(async paciente => {
                            const examenes = await cargarExamenesDetallados(paciente.historia, examenesTomadosActuales);
                            return {
                                ...paciente,
                                examenes: examenes.filter(e => !e.tomado).map(e => e.nombre),
                                examenesConEstado: examenes,
                                examenesDetallados: true,
                                cantidadPendientes: examenes.filter(e => !e.tomado).length,
                                cantidadTomados: examenes.filter(e => e.tomado).length,
                                tieneExamenesPendientes: examenes.filter(e => !e.tomado).length > 0
                            };
                        })
                    );

                    // RUTINARIOS DATOS DE PRUEBA
                    const rutinariosConExamenes = await Promise.all(
                        rutinariosAPI.map(async paciente => {
                            const examenes = await cargarExamenesDetallados(paciente.historia, examenesTomadosActuales);
                            return {
                                ...paciente,
                                examenes: examenes.filter(e => !e.tomado).map(e => e.nombre),
                                examenesConEstado: examenes,
                                examenesDetallados: true,
                                cantidadPendientes: examenes.filter(e => !e.tomado).length,
                                cantidadTomados: examenes.filter(e => e.tomado).length,
                                tieneExamenesPendientes: examenes.filter(e => !e.tomado).length > 0
                            };
                        })
                    );

                    dataFiltrada = {
                        urgentes: urgentesConExamenes.filter(p => p.tieneExamenesPendientes),
                        prioritario: prioritariosConExamenes.filter(p => p.tieneExamenesPendientes),
                        rutinario: rutinariosConExamenes.filter(p => p.tieneExamenesPendientes)
                    };
                }
            }

            /* console.log('📊 Datos filtrados finales:', {
                urgentes: dataFiltrada.urgentes.length,
                prioritarios: dataFiltrada.prioritario.length,
                rutinarios: dataFiltrada.rutinario.length,
                totalPacientes: dataFiltrada.urgentes.length + dataFiltrada.prioritario.length + dataFiltrada.rutinario.length
            }); */

            setSolicitudesData(dataFiltrada);

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

    // Función para convertir resumen de pacientes de la API al formato de la aplicación
    const convertirResumenPacientes = (datosAPI, prioridadTipo) => {
        if (!Array.isArray(datosAPI)) return [];

        return datosAPI.map(item => ({
            id: item.idePaciente,
            paciente: item.nomPaciente,
            edad: item.edad,
            historia: item.idePaciente,
            ingreso: item.ingreso,
            folio: item.folio,
            cama: item.cama,
            nombreCama: item.cama,
            fechaSolicitud: item.fechaSolicitud,
            fechaSolicitudVista: new Date(item.fechaSolicitud).toLocaleString('es-CO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }),
            areaSolicitante: item.areaSolicitante,
            estado: 'Actual',
            prioridad: prioridadTipo,
            observaciones: '',
            // Nueva estructura para resumen
            cantidadExamenes: item.cantidadExamenes,
            examenes: [], // Se llenarán al expandir
            examenesDetallados: false // Flag para saber si ya se cargaron los detalles
        }));
    };

    // función para filtrar exámenes individuales tomados
    const filtrarExamenesIndividualesTomados = (pacientesConExamenes, examenesTomados) => {
        return pacientesConExamenes.map(paciente => {
            // Obtener exámenes ya tomados para este paciente específico
            const examenesYaTomados = examenesTomados.filter(tomado =>
                tomado.historia === paciente.historia &&
                tomado.numeroIngreso === paciente.ingreso.toString() &&
                tomado.numeroFolio === paciente.folio.toString()
            );

            // Si no hay exámenes tomados para este paciente, devolver tal como está
            if (examenesYaTomados.length === 0) {
                return paciente;
            }

            // Filtrar exámenes que NO están tomados
            const examenesPendientes = paciente.examenes.filter(examen => {
                return !examenesYaTomados.some(tomado => tomado.nomServicio === examen);
            });

            // Marcar exámenes que YA están tomados para mostrarlos como completados
            const examenesConEstado = paciente.examenes.map(examen => {
                const estaTomado = examenesYaTomados.some(tomado => tomado.nomServicio === examen);
                return {
                    nombre: examen,
                    tomado: estaTomado
                };
            });

            // Actualizar el paciente con la nueva información
            return {
                ...paciente,
                examenes: examenesPendientes, // Solo exámenes pendientes
                examenesConEstado: examenesConEstado, // Todos los exámenes con estado
                cantidadExamenes: paciente.cantidadExamenes, // Cantidad
                cantidadPendientes: examenesPendientes.length,
                cantidadTomados: examenesYaTomados.length,
                tieneExamenesPendientes: examenesPendientes.length > 0
            };
        }).filter(paciente => {
            // En pestaña "actuales", mostrar pacientes con exámenes pendientes
            if (filtroActual === 'actuales') {
                return paciente.tieneExamenesPendientes;
            }
            return true;
        });
    };

    // Función para filtrar pacientes que ya tienen exámenes tomados
    const filtrarPacientesNoTomados = (pacientesOriginales, examenesTomados) => {
        return pacientesOriginales.filter(paciente => {
            // Verificar si este paciente tiene TODOS sus exámenes ya tomados
            const examenesDelPaciente = examenesTomados.filter(tomado =>
                tomado.historia === paciente.historia &&
                tomado.numeroIngreso === paciente.ingreso.toString() &&
                tomado.numeroFolio === paciente.folio.toString()
            );

            // Si la cantidad de exámenes tomados es menor que la cantidad total, incluir el paciente
            return examenesDelPaciente.length < paciente.cantidadExamenes;
        });
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
                    fechaSolicitud: solicitud.fechaSolicitud || new Date().toLocaleDateString(),
                    fechaTomado: solicitud.fechaTomado || solicitud.FechaTomado || null,
                    FechaTomado: solicitud.fechaTomado || solicitud.FechaTomado || null,
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
            const now = new Date();
            const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 19);

            // OBTENER CÓDIGOS DE EXÁMENES DESDE EL CACHE DETALLADO
            let codigosExamenes = {};
            const examenesDetalladosPaciente = examenesDetallados[solicitud.historia] || [];

            // Crear nombre -> código
            examenesDetalladosPaciente.forEach(examen => {
                codigosExamenes[examen.nomExamen] = examen.codExamen;
            });

            const examenesTomados = examenesIndices.map(examIndex => {
                const nombreExamen = solicitud.examenes[examIndex];
                const codigoExamen = codigosExamenes[nombreExamen] || 'AUTO_GENERATED';

                return {
                    historia: solicitud.historia,
                    nomPaciente: solicitud.paciente,
                    edad: solicitud.edad,
                    numeroIngreso: solicitud.ingreso.toString(),
                    numeroFolio: solicitud.folio.toString(),
                    cama: solicitud.cama,
                    nomCama: solicitud.nombreCama,
                    areaSolicitante: solicitud.areaSolicitante,
                    prioridad: solicitud.prioridad,
                    codServicio: codigoExamen,
                    nomServicio: nombreExamen,
                    observaciones: solicitud.observaciones || '',
                    fechaSolicitud: solicitud.fechaSolicitud,
                    fechaTomado: localISOTime,
                    responsable: 'Usuario Sistema'
                };
            });


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
        // Verificar que data sea un array válido
        if (!Array.isArray(data)) {
            console.warn(`paginateData: data no es un array para categoria ${categoria}:`, data);
            return {
                items: [],
                totalPages: 1,
                currentPage: 1,
                totalItems: 0
            };
        }

        const page = currentPage[categoria] || 1;
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

    // Función de polling automático
    const startPolling = useCallback((interval = 30000) => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }

        setIsPollingActive(true);
        pollingRef.current = setInterval(() => {
            //console.log('Actualizando datos automáticamente...');
            cargarSolicitudes();
        }, interval);
    }, []);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        setIsPollingActive(false);
    }, []);

    useEffect(() => {
        resetPagination();
        cargarSolicitudes();
    }, [filtro, usarDatosPrueba]);

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
        expandirPaciente,
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
