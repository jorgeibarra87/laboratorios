// services/ApiService.js
import { mockPatients, mockPatientExams } from '../data/mockData';

class ApiService {
    constructor() {
        this.baseUrl = import.meta.env.DEV ? 'http://192.168.16.160:8002' : '';
        this.useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';
    }

    async getPatients(priority, page = 0, size = 10) {
        // Si está configurado para usar mock, no intentar API
        if (this.useMock) {
            console.log('🔧 Usando datos mock para pacientes');
            return this.getMockPatients(priority, page, size);
        }


        try {
            console.log(`🌐 Intentando conectar API para ${priority}...`);
            const response = await fetch(`${this.baseUrl}/hcnSolExa/resumen-pacientes/${priority}?page=${page}&size=${size}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Timeout de 5 segundos
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ API conectada exitosamente');
            return data;
        } catch (error) {
            console.log(`⚠️ API no disponible (${error.message}), usando datos mock`);
            return this.getMockPatients(priority, page, size);
        }
    }

    async getPatientExams(historia) {
        // Si está configurado para usar mock, no intentar API;
        if (this.useMock) {
            console.log(`🔧 Usando datos mock para exámenes de ${historia}`);
            return mockPatientExams[historia] || [];
        }

        try {
            console.log(`🌐 Intentando cargar exámenes para ${historia}...`);
            const response = await fetch(`${this.baseUrl}/hcnSolExa/paciente/${historia}/urgentes?documento=${historia}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Timeout de 3 segundos para exámenes
                signal: AbortSignal.timeout(3000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Exámenes cargados desde API para ${historia}`);
            return Array.isArray(data) ? data : data.examenes || data.data || [];
        } catch (error) {
            console.log(`⚠️ API no disponible para exámenes (${error.message}), usando mock`);
            return mockPatientExams[historia] || [];
        }
    }

    getMockPatients(priority, page, size) {
        const data = mockPatients[priority] || [];
        const start = page * size;
        const end = start + size;

        return {
            content: data.slice(start, end),
            totalElements: data.length,
            totalPages: Math.ceil(data.length / size),
            size,
            number: page
        };
    }
}

export default new ApiService();
