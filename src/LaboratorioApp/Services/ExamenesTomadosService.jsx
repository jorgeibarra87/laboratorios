//services/examesTomadosService.js
import { API_CONFIG } from '../config/api';

class ExamenesTomadosService {

    async makeLocalRequest(endpoint, options = {}) {
        const url = `${API_CONFIG.LOCAL_API.BASE_URL}${endpoint}`;

        console.log('🏠 Petición a backend local (exámenes tomados):', url);

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: API_CONFIG.LOCAL_API.TIMEOUT,
            ...options
        };

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error en petición a backend local (exámenes tomados):', error);
            throw error;
        }
    }

    // Obtener todos los exámenes tomados
    async getExamenesTomados() {
        return await this.makeLocalRequest('/examenes-tomados');
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
        return await this.makeLocalRequest(`/examenes-tomados/historia/${historia}`);
    }
}

export default new ExamenesTomadosService();
