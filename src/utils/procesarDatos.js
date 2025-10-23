// utils/procesarDatos.js
export const agruparPorPaciente = (examenes, estado) => {
  const pacientesAgrupados = {};
  const examenesFiltrados = (examenes || []).filter(
    (examen) => examen.estadoResultado === estado
  );

  examenesFiltrados.forEach((examen) => {
    const historia = examen.historia;

    if (!pacientesAgrupados[historia]) {
      pacientesAgrupados[historia] = createPatientData(examen);
    }

    updatePatientData(pacientesAgrupados[historia], examen, estado);
  });

  return Object.values(pacientesAgrupados);
};

export const filtrarPorPrioridad = (pacientes, prioridad) => {
  const priorityMap = {
    urgentes: ["urgente"],
    prioritario: ["prioritaria", "prioritario"],
    rutinario: ["rutinario"],
  };

  const validPriorities = priorityMap[prioridad] || [];

  return pacientes.filter((patient) => {
    if (!patient.prioridad) return false;
    const patientPriority = patient.prioridad.toLowerCase();
    return validPriorities.some((validPrio) =>
      patientPriority.includes(validPrio)
    );
  });
};

export const crearRespuestaPaginada = (data, page, size) => {
  const start = page * size;
  const content = data.slice(start, start + size);

  return {
    content,
    totalElements: data.length,
    totalPages: Math.ceil(data.length / size),
    size,
    number: page,
    first: page === 0,
    last: page >= Math.ceil(data.length / size) - 1,
  };
};

export const getExamStatus = (nombreExamen, tomados, pendientes) => {
  if (tomados.some((t) => t.nomServicio === nombreExamen)) return "tomado";
  if (pendientes.some((p) => p.nomServicio === nombreExamen))
    return "pendiente";
  return "disponible";
};

// Helper functions
const createPatientData = (examen) => ({
  id: examen.historia,
  historia: examen.historia,
  paciente: examen.nomPaciente,
  edad: examen.edad,
  ingreso: examen.numeroIngreso,
  folio: examen.numeroFolio,
  cama: examen.cama,
  nomCama: examen.nomCama || examen.cama,
  areaSolicitante: examen.areaSolicitante,
  prioridad: examen.prioridad,
  fechaSolicitud: examen.fechaSolicitud,
  fechaPendiente: examen.fechaPendiente,
  fechaTomado: examen.fechaTomado,
  responsable: examen.responsable,
  cantidadExamenes: 0,
  examenes: [],
});

const updatePatientData = (patient, examen, estado) => {
  patient.cantidadExamenes++;
  patient.examenes.push({
    nombre: examen.nomServicio,
    codigo: examen.codServicio,
    fechaPendiente: examen.fechaPendiente,
    fechaTomado: examen.fechaTomado,
    observaciones: examen.observaciones,
  });

  // Actualizar fecha más reciente para pendientes
  if (estado === "PENDIENTE" && examen.fechaPendiente) {
    if (
      !patient.fechaPendiente ||
      new Date(examen.fechaPendiente) > new Date(patient.fechaPendiente)
    ) {
      patient.fechaPendiente = examen.fechaPendiente;
    }
  }
};
