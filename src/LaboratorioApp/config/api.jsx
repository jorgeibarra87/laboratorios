export const API_CONFIG = {
    DINAMICA_API: {
        BASE_URL: import.meta.env.VITE_DINAMICA_API_URL || 'https://api-externa-hospital.com/api',
        TIMEOUT: 10000
    },
    LOCAL_API: {
        BASE_URL: import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:8084',
        TIMEOUT: 5000
    },
    USE_TEST_DATA: import.meta.env.VITE_USE_TEST_DATA === 'true',
};
// Debug para verificar las variables
console.log('🔧 Configuración de API:', {
    dinamica: API_CONFIG.DINAMICA_API.BASE_URL,
    local: API_CONFIG.LOCAL_API.BASE_URL,
    useTestData: API_CONFIG.USE_TEST_DATA
});