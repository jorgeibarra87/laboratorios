// services/LocalService.js
class LocalService {
    constructor() {
        this.baseUrl = 'http://localhost:8084';
    }

    async getExamsByHistoria(historia) {
        try {
            const response = await fetch(`${this.baseUrl}/examenes-tomados/historia/${historia}`);
            return await response.json();
        } catch (error) {
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
