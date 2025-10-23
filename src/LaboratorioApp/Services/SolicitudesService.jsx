// Services/SolicitudesService.js
import { API_CONFIG } from '../config/api';
import { mockPatients, mockPatientExams, mockTakenExams } from '../data/mockData';

// Flag simple para usar mock
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

class SolicitudesService {

    // Métodos para la API DINAMICA (con fallback)
    async makeDinamicaRequest(endpoint, options = {}) {
        // Si está en modo mock, no hacer request
        if (USE_MOCK) {
            throw new Error('Using mock data');
        }

        const baseUrl = import.meta.env.DEV ? '' : 'http://192.168.16.160:8002';
        const url = `${baseUrl}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
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
            console.error('❌ Error en petición a API dinamica:', error);
            throw error;
        }
    }

    // Helper para simular delay y paginación
    async mockDelay(ms = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Crear respuesta paginada mock
    createMockPageResponse(data, page, size) {
        const start = page * size;
        const content = data.slice(start, start + size);

        return {
            content,
            totalElements: data.length,
            totalPages: Math.ceil(data.length / size),
            size,
            number: page,
            first: page === 0,
            last: page >= Math.ceil(data.length / size) - 1
        };
    }

    async getResumenPacientesUrgentes(page = 0, size = 10) {
        try {
            return await this.makeDinamicaRequest(`/hcnSolExa/resumen-pacientes/urgentes?page=${page}&size=${size}`);
        } catch (error) {
            // Fallback a mock
            await this.mockDelay();
            return this.createMockPageResponse(mockPatients.urgentes, page, size);
        }
    }

    async getResumenPacientesPrioritarios(page = 0, size = 10) {
        try {
            return await this.makeDinamicaRequest(`/hcnSolExa/resumen-pacientes/prioritarios?page=${page}&size=${size}`);
        } catch (error) {
            // Fallback a mock
            await this.mockDelay();
            return this.createMockPageResponse(mockPatients.prioritario, page, size);
        }
    }

    async getResumenPacientesRutinarios(page = 0, size = 10) {
        try {
            return await this.makeDinamicaRequest(`/hcnSolExa/resumen-pacientes/rutinarios?page=${page}&size=${size}`);
        } catch (error) {
            // Fallback a mock
            await this.mockDelay();
            return this.createMockPageResponse(mockPatients.rutinario, page, size);
        }
    }

    // Obtener exámenes específicos de un paciente
    async getExamenesPaciente(historia) {
        try {
            // API REAL
            const response = await this.makeDinamicaRequest(`/hcnSolExa/paciente/${historia}/urgentes?documento=${historia}`);

            // Validar que la respuesta tenga la estructura esperada
            if (Array.isArray(response)) {
                return response; // Si es array directo
            } else if (response.examenes && Array.isArray(response.examenes)) {
                return response.examenes; // Si está dentro de "examenes"
            } else if (response.data && Array.isArray(response.data)) {
                return response.data; // Si está dentro de "data"
            } else {
                console.warn('⚠️ Formato de API real desconocido:', response);
                return [];
            }

        } catch (error) {
            await this.mockDelay(200);

            // MOCK DATA - búsqueda directa
            const exams = mockPatientExams[historia];

            if (exams && exams.length > 0) {
                console.log('✅ Encontrados', exams.length, 'exámenes para historia', historia);
                return exams;
            } else {
                console.log('❌ No se encontraron exámenes para historia', historia);
                return [];
            }
        }
    }

    // ===== MÉTODOS PARA BACKEND LOCAL =====
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en petición a backend local:', error);
            throw error;
        }
    }

    async getExamenesTomados() {
        return await this.makeLocalRequest('/examenes-tomados');
    }

    async crearExamenTomado(examenData) {
        return await this.makeLocalRequest('/examenes-tomados', {
            method: 'POST',
            body: JSON.stringify(examenData)
        });
    }

    async crearMultiplesExamenes(examenesData) {
        return await this.makeLocalRequest('/examenes-tomados/bulk', {
            method: 'POST',
            body: JSON.stringify(examenesData)
        });
    }

    async getExamenesPorHistoria(historia) {
        return await this.makeLocalRequest(`/examenes-tomados/historia/${historia}`);
    }
}

export default new SolicitudesService();
