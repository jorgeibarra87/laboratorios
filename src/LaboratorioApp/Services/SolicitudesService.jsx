// solicitudesService.jsx
import { API_CONFIG } from '../config/api';

class SolicitudesService {

    // Métodos para la API DINAMICA (consultas)
    async makeDinamicaRequest(endpoint, options = {}) {
        const url = `${API_CONFIG.DINAMICA_API.BASE_URL}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                // Agregar headers de autenticación para API dinamica si es necesario
                //'Authorization': `Bearer ${localStorage.getItem('external_token')}`,
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en petición a API dinamica:', error);
            throw error;
        }
    }

    // ===== CONSULTAS A API DINAMICA =====

    // Obtener todas las solicitudes de laboratorio desde API dinamica
    async getSolicitudesLaboratorio() {
        return await this.makeDinamicaRequest('/solicitudes-laboratorio');
    }

    // Obtener solicitudes filtradas por estado desde API dinamica
    async getSolicitudesByEstado(estado) {
        return await this.makeDinamicaRequest(`/solicitudes-laboratorio?estado=${estado}`);
    }

    // Obtener solicitudes por prioridad desde API dinamica
    async getSolicitudesByPrioridad(prioridad) {
        return await this.makeDinamicaRequest(`/solicitudes-laboratorio?prioridad=${prioridad}`);
    }

    // Obtener solicitudes por paciente desde API dinamica
    async getSolicitudesByPaciente(idePaciente) {
        return await this.makeDinamicaRequest(`/solicitudes-laboratorio/paciente/${idePaciente}`);
    }

    // ===== MÉTODOS PARA BACKEND LOCAL (exámenes tomados) =====

    async makeLocalRequest(endpoint, options = {}) {
        const url = `${API_CONFIG.LOCAL_API.BASE_URL}${endpoint}`;
        console.log('🏠 Petición a backend local:', url);

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en petición a backend local:', error);
            throw error;
        }
    }

    // Obtener exámenes tomados desde backend local
    async getExamenesTomados() {
        return await this.makeLocalRequest('/examenes-tomados');
    }

    // Crear examen tomado en backend local
    async crearExamenTomado(examenData) {
        return await this.makeLocalRequest('/examenes-tomados', {
            method: 'POST',
            body: JSON.stringify(examenData)
        });
    }

    // Crear múltiples exámenes tomados en backend local
    async crearMultiplesExamenes(examenesData) {
        return await this.makeLocalRequest('/examenes-tomados/bulk', {
            method: 'POST',
            body: JSON.stringify(examenesData)
        });
    }

    // Obtener exámenes tomados por historia desde backend local
    async getExamenesPorHistoria(historia) {
        return await this.makeLocalRequest(`/examenes-tomados/historia/${historia}`);
    }
}

export default new SolicitudesService();
