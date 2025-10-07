// solicitudesService.jsx
const API_BASE_URL = 'http://localhost:8080/api'; // Ajustar según backend

class SolicitudesService {

    async makeRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                // Agregar headers de autenticación si es necesario
                // 'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            console.error('Error en la petición:', error);
            throw error;
        }
    }

    // Obtener todas las solicitudes de laboratorio
    async getSolicitudesLaboratorio() {
        return await this.makeRequest('/solicitudes-laboratorio');
    }

    // Obtener solicitudes filtradas por estado
    async getSolicitudesByEstado(estado) {
        // El estado podría ser: 0=Pendiente, 1=En proceso, 2=Completado, etc.
        return await this.makeRequest(`/solicitudes-laboratorio?estado=${estado}`);
    }

    // Obtener solicitudes por prioridad
    async getSolicitudesByPrioridad(prioridad) {
        // 0=Urgente, 1=Rutinario, 2=Electiva, 3=Prioritaria, 4=Muy Urgente, 5=Control, 6=Electivo
        return await this.makeRequest(`/solicitudes-laboratorio?prioridad=${prioridad}`);
    }

    // Obtener solicitudes por paciente
    async getSolicitudesByPaciente(idePaciente) {
        return await this.makeRequest(`/solicitudes-laboratorio/paciente/${idePaciente}`);
    }

    // Obtener solicitudes por área solicitante
    async getSolicitudesByArea(codigoArea) {
        return await this.makeRequest(`/solicitudes-laboratorio?area=${codigoArea}`);
    }

    // Obtener detalles de exámenes de una solicitud específica
    async getExamenesSolicitud(solicitudId) {
        return await this.makeRequest(`/solicitudes-laboratorio/${solicitudId}/examenes`);
    }
}

export default new SolicitudesService();
