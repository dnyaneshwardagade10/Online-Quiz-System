const API_URL = 'http://localhost:5000/api';
let token = null;

// Helper function to make API calls
async function apiCall(method, endpoint, data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'API Error');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth APIs
async function registerUser(username, email, password, role) {
    return apiCall('POST', '/auth/register', { username, email, password, role });
}

async function loginUser(username, password) {
    return apiCall('POST', '/auth/login', { username, password });
}

async function getUserProfile() {
    return apiCall('GET', '/auth/profile');
}

// Quiz APIs
async function createQuiz(title, description, duration_minutes, passing_score) {
    return apiCall('POST', '/quiz', { title, duration: duration_minutes });
}

async function getAllQuizzes() {
    return apiCall('GET', '/quiz');
}

async function getQuizById(quizId) {
    return apiCall('GET', `/quiz/${quizId}`);
}

async function updateQuiz(quizId, data) {
    return apiCall('PUT', `/quiz/${quizId}`, data);
}

async function deleteQuiz(quizId) {
    return apiCall('DELETE', `/quiz/${quizId}`);
}

// Question APIs
async function createQuestion(quizId, question, option_a, option_b, option_c, option_d, correct_option) {
    return apiCall('POST', `/question/${quizId}/questions`, { question, option_a, option_b, option_c, option_d, correct_option });
}

async function addOption(questionId, option_text, is_correct) {
    return apiCall('POST', `/question/${questionId}/options`, { option_text, is_correct });
}

async function deleteQuestion(questionId) {
    return apiCall('DELETE', `/question/${questionId}`);
}

// Attempt APIs
async function startQuizAttempt(quizId) {
    return apiCall('POST', `/attempt/${quizId}/start`);
}

// Submit full quiz answers (server expects all answers at once)
async function submitQuizAttempt(attemptId, answers) {
    return apiCall('POST', `/attempt/${attemptId}/submit`, { answers });
}

async function getQuizAttempt(attemptId) {
    return apiCall('GET', `/attempt/${attemptId}`);
}

async function getQuizHistory() {
    return apiCall('GET', '/attempt/user/history');
}

// Health Check
async function checkServer() {
    try {
        const response = await fetch(`${API_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
}
