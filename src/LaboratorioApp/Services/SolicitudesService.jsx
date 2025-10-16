// solicitudesService.jsx
import { API_CONFIG } from '../config/api';

class SolicitudesService {

    // Métodos para la API DINAMICA (consultas)
    async makeDinamicaRequest(endpoint, options = {}) {
        //const url = `${API_CONFIG.LOCAL_API.BASE_URL}${endpoint}`;
        const baseUrl = import.meta.env.DEV
            ? '' // Vite proxy  /hcnSolExa
            : 'http://192.168.16.160:8002';

        const url = `${baseUrl}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            ...options
        };

        try {
            //console.log('Haciendo request a:', url);
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            //console.log('Datos recibidos:', data.length || 'objeto');
            return data;
        } catch (error) {
            console.error('❌ Error en petición a API dinamica:', error);
            throw error;
        }
    }

    // ===== CONSULTAS A API DINAMICA =====

    // FUNCIÓN: Obtener TODOS los pacientes con paginación automática
    async getAllPacientesPaginados(endpoint, maxPages = 20) {
        let allData = [];
        let currentPage = 0;
        let hasMoreData = true;
        let totalPagesFound = null;

        //console.log(`Iniciando consulta paginada para ${endpoint}`);

        while (hasMoreData && currentPage < maxPages) {
            try {
                const response = await this.makeDinamicaRequest(`${endpoint}?page=${currentPage}&size=50`);

                if (Array.isArray(response)) {
                    allData = [...allData, ...response];
                    hasMoreData = response.length === 50; // Si devuelve menos de 50, es la última página
                    //console.log(`Página ${currentPage + 1}: ${response.length} registros obtenidos`);
                }
                // Si la API cambia a formato estándar
                else if (response.content && Array.isArray(response.content)) {
                    allData = [...allData, ...response.content];
                    hasMoreData = !response.last;
                    totalPagesFound = response.totalPages;
                    //console.log(`Página ${currentPage + 1}/${response.totalPages}: ${response.content.length} registros`);
                }
                else {
                    console.warn('⚠️ Formato de respuesta desconocido:', response);
                    break;
                }

                currentPage++;

                // pausa para no sobrecargar
                if (hasMoreData) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

            } catch (error) {
                console.error(`❌ Error en página ${currentPage + 1} de ${endpoint}:`, error);
                break;
            }
        }

        //console.log(`Total obtenido de ${endpoint}: ${allData.length} registros${totalPagesFound ? ` de ${totalPagesFound} páginas` : ''}`);
        return allData;
    }

    async getResumenPacientesUrgentes(page = 0, size = 10) {
        return await this.makeDinamicaRequest(`/hcnSolExa/resumen-pacientes/urgentes?page=${page}&size=${size}`);
    }

    async getResumenPacientesPrioritarios(page = 0, size = 10) {
        return await this.makeDinamicaRequest(`/hcnSolExa/resumen-pacientes/prioritarios?page=${page}&size=${size}`);
    }

    async getResumenPacientesRutinarios(page = 0, size = 10) {
        return await this.makeDinamicaRequest(`/hcnSolExa/resumen-pacientes/rutinarios?page=${page}&size=${size}`);
    }

    // Obtener exámenes específicos de un paciente
    async getExamenesPaciente(documento) {
        return await this.makeDinamicaRequest(`/hcnSolExa/paciente/${documento}/urgentes?documento=${documento}`);
    }

    // obtener todos los pacientes
    async getTodosLosPacientesPorPrioridad() {
        try {
            //console.log('Iniciando consulta completa con paginación automática...');

            const [urgentes, prioritarios, rutinarios] = await Promise.all([
                this.getResumenPacientesUrgentes(),
                this.getResumenPacientesPrioritarios(),
                this.getResumenPacientesRutinarios()
            ]);

            const totalRegistros = urgentes.length + prioritarios.length + rutinarios.length;

            /* console.log('Resumen consulta completa:', {
                urgentes: urgentes.length,
                prioritarios: prioritarios.length,
                rutinarios: rutinarios.length,
                total: totalRegistros
            }); */

            return {
                urgentes: urgentes || [],
                prioritarios: prioritarios || [],
                rutinarios: rutinarios || []
            };
        } catch (error) {
            console.error('❌ Error obteniendo pacientes por prioridad:', error);
            throw error;
        }
    }

    // ===== MÉTODOS PARA BACKEND LOCAL (exámenes tomados) =====

    async makeLocalRequest(endpoint, options = {}) {
        const url = `${API_CONFIG.LOCAL_API.BASE_URL}${endpoint}`;
        //console.log('Petición a backend local:', url);

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
