const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
    ? 'http://petsniffer.com.br:8080'  // Backend rodando na porta 8080
    : '/api'; // Em produção, usa o proxy reverso do Nginx

export const API_ENDPOINTS = {
    // Adicione aqui todos os endpoints da sua API
    auth: {
        login: `${API_BASE_URL}/auth/login`,
        register: `${API_BASE_URL}/auth/register`,
    },
    // ... outros endpoints
}; 