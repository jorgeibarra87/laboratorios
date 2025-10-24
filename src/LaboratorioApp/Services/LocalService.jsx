// services/LocalService.js
class LocalService {
    constructor() {
        this.baseUrl = 'http://localhost:8084';
    }

    async getExamsByHistoria(historia) {
        try {
            const response = await fetch(`${this.baseUrl}/examenes-tomados/historia/${historia}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error obteniendo exámenes por historia:', error);
            return [];
        }
    }

    // Método para obtener TODOS los exámenes
    async getAllExams() {
        try {
            console.log('🔍 Consultando todos los exámenes locales...');
            const response = await fetch(`${this.baseUrl}/examenes-tomados`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Mapear campos de BD a campos esperados por el frontend
            const mappedData = data.map(exam => {
                const mapped = {
                    id: exam.id,
                    historia: exam.historia,
                    nomPaciente: exam.nom_paciente || exam.nomPaciente,
                    nomServicio: exam.nom_servicio || exam.nomServicio,
                    estadoResultado: exam.estado_resultado || exam.estadoResultado,
                    fechaSolicitud: exam.fecha_solicitud || exam.fechaSolicitud,
                    fechaPendiente: exam.fecha_pendiente || exam.fechaPendiente,
                    fechaTomado: exam.fecha_tomado || exam.fechaTomado,
                    areaSolicitante: exam.area_solicitante || exam.areaSolicitante,
                    edad: exam.edad,
                    numeroIngreso: exam.numero_ingreso || exam.numeroIngreso,
                    numeroFolio: exam.numero_folio || exam.numeroFolio,
                    nomCama: exam.nom_cama || exam.nomCama,
                    observaciones: exam.observaciones,
                    prioridad: exam.prioridad,
                    responsable: exam.responsable
                };
                return mapped;
            });
            return mappedData;
        } catch (error) {
            console.error('❌ Error consultando BD local:', error);
            return [];
        }
    }

    async createExam(examData) {
        try {
            const response = await fetch(`${this.baseUrl}/examenes-tomados`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(examData)
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async updateExam(examId, updates) {
        try {
            const response = await fetch(`${this.baseUrl}/examenes-tomados/${examId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
}

export default new LocalService();
