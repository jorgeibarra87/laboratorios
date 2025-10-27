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
            console.log('📊 Exámenes obtenidos de BD local:', data.length);

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
            console.log('🔧 Actualizando examen:', examId);
            console.log('📤 Updates recibidos:', updates);

            // Obtener el examen actual
            const currentExamResponse = await fetch(`${this.baseUrl}/examenes-tomados/${examId}`);
            if (!currentExamResponse.ok) {
                throw new Error(`Error obteniendo examen actual: ${currentExamResponse.status}`);
            }
            const currentExam = await currentExamResponse.json();
            console.log('📋 Examen actual:', currentExam);

            // Crear payload completo con todos los campos requeridos
            const payload = {
                // Campos obligatorios del examen actual
                historia: currentExam.historia,
                nomPaciente: currentExam.nomPaciente,
                numeroIngreso: currentExam.numeroIngreso,
                numeroFolio: currentExam.numeroFolio,
                codServicio: currentExam.codServicio,
                nomServicio: currentExam.nomServicio,
                // Campos opcionales del examen actual
                edad: currentExam.edad,
                cama: currentExam.cama,
                nomCama: currentExam.nomCama,
                areaSolicitante: currentExam.areaSolicitante,
                prioridad: currentExam.prioridad,
                fechaSolicitud: currentExam.fechaSolicitud,
                fechaPendiente: currentExam.fechaPendiente,
                responsable: currentExam.responsable,
                // CAMPOS A ACTUALIZAR (sobrescribir los del examen actual)
                observaciones: updates.observaciones !== undefined ? updates.observaciones : currentExam.observaciones,
                estadoResultado: updates.estadoResultado !== undefined ? updates.estadoResultado : currentExam.estadoResultado,
                fechaTomado: updates.fechaTomado !== undefined ? updates.fechaTomado : currentExam.fechaTomado
            };
            // Manejar fechas correctamente
            if (updates.fechaTomado !== undefined) {
                if (updates.fechaTomado === null) {
                    payload.fechaTomado = null;
                } else {
                    // Formato ISO que LocalDateTime puede parsear
                    payload.fechaTomado = new Date().toISOString();
                }
            }

            console.log('📤 Payload completo:', payload);

            const response = await fetch(`${this.baseUrl}/examenes-tomados/${examId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log('📥 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Actualización exitosa:', result);
            return result;
        } catch (error) {
            console.error('❌ Error en updateExam:', error);
            throw error;
        }
    }
}

export default new LocalService();
