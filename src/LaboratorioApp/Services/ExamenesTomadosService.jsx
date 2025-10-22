// Services/examesTomadosService.js
import { API_CONFIG } from '../config/api';

class ExamenesTomadosService {

    async makeLocalRequest(endpoint, options = {}) {
        const url = `${API_CONFIG.LOCAL_API.BASE_URL}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorBody = await response.text();
                    if (errorBody) {
                        errorMessage += ` - ${errorBody}`;
                    }
                } catch (textError) {
                    // Ignorar si no se puede leer el error
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error en petición a backend local:', error);
            throw error;
        }
    }

    // Obtener todos los exámenes tomados
    async getExamenesTomados() {
        try {
            return await this.makeLocalRequest('/examenes-tomados');
        } catch (error) {
            console.warn('Backend local no disponible, usando array vacío');
            return []; // Fallback a array vacío si backend local no está disponible
        }
    }
    // Crear examen tomado
    async crearExamenTomado(examenData) {
        return await this.makeLocalRequest('/examenes-tomados', {
            method: 'POST',
            body: JSON.stringify(examenData)
        });
    }

    // Crear múltiples exámenes tomados
    async crearMultiplesExamenes(examenesData) {
        return await this.makeLocalRequest('/examenes-tomados/bulk', {
            method: 'POST',
            body: JSON.stringify(examenesData)
        });
    }

    // Obtener exámenes por historia
    async getExamenesPorHistoria(historia) {
        try {
            return await this.makeLocalRequest(`/examenes-tomados/historia/${historia}`);
        } catch (error) {
            console.warn('Backend local no disponible para historia:', historia);
            return [];
        }
    }

    // Nuevo método para completar examen
    async completarExamen(examenId) {
        return await this.makeLocalRequest(`/examenes-tomados/${examenId}/completar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'resultado=COMPLETADO&responsable=Sistema Web'
        });
    }

    // Método para obtener pendientes
    async getExamenesPendientes() {
        return await this.makeLocalRequest('/examenes-tomados/pendientes');
    }

    async crearExamenPendiente(examenData) {
        const payload = {
            ...examenData,
            estadoResultado: 'PENDIENTE',
            fechaPendiente: new Date().toISOString(),
        };

        return await this.makeLocalRequest('/examenes-tomados', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    // método para actualizar examen existente
    async actualizarExamen(examenId, data) {
        console.log('Actualizando examen ID:', examenId, 'con data:', data); // Debug
        return await this.makeLocalRequest(`/examenes-tomados/${examenId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // método para eliminar examen
    async eliminarExamen(examenId) {
        return await this.makeLocalRequest(`/examenes-tomados/${examenId}`, {
            method: 'DELETE'
        });
    }
}

export default new ExamenesTomadosService();
