// Global Variables
let currentUser = null;
let currentQuiz = null;
let currentAttempt = null;
let quizTimer = null;
let quizEndTime = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function () {
    checkServerStatus();
    loadStoredToken();

    // Form Listeners
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
    document.getElementById('createQuizForm').addEventListener('submit', handleCreateQuiz);
    document.getElementById('editQuizForm').addEventListener('submit', handleEditQuiz);
    document.getElementById('createQuestionForm').addEventListener('submit', handleCreateQuestion);

    // Auth Listener
    window.addEventListener('auth:unauthorized', () => {
        logout();
        showMessage('Session expired. Please login again.', 'error');
    });
});

// Server Status
async function checkServerStatus() {
    const isRunning = await checkServer();
    if (!isRunning) {
        showMessage('Server is not running. Please start the backend server.', 'error');
    }
}

// Load stored token
function loadStoredToken() {
    const storedToken = localStorage.getItem('quizToken');
    const storedRole = localStorage.getItem('quizRole');

    if (storedToken && storedRole) {
        token = storedToken;
        currentUser = { role: storedRole };
        showDashboard();
    }
}

// Toggle Forms
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
    registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await loginUser(username, password);

        token = response.token;
        currentUser = { role: response.role, userId: response.userId };

        localStorage.setItem('quizToken', token);
        localStorage.setItem('quizRole', response.role);

        showMessage('Login successful!', 'success');
        showDashboard();
    } catch (error) {
        showMessage(error.message || 'Login failed', 'error');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    try {
        const response = await registerUser(username, email, password, role);

        token = response.token;
        currentUser = { role: response.role, userId: response.userId };

        localStorage.setItem('quizToken', token);
        localStorage.setItem('quizRole', response.role);

        showMessage('Registration successful!', 'success');
        showDashboard();
    } catch (error) {
        showMessage(error.message || 'Registration failed', 'error');
    }
}

// Show Dashboard
function showDashboard() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';

    if (currentUser.role === 'admin') {
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('studentPanel').style.display = 'none';
        loadMyQuizzes();
    } else {
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('studentPanel').style.display = 'block';
        loadStudentQuizzes();
        loadQuizHistory();
    }

    updateGreeting();
}

// Update Greeting
async function updateGreeting() {
    try {
        const profile = await getUserProfile();
        document.getElementById('userGreeting').textContent = `Welcome, ${profile.username}!`;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Logout
function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('quizToken');
    localStorage.removeItem('quizRole');

    document.getElementById('authSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('studentPanel').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';

    document.getElementById('loginFormElement').reset();
    document.getElementById('registerFormElement').reset();

    showMessage('Logged out successfully', 'success');
}

// ==================== ADMIN FUNCTIONS ====================

// Handle Create Quiz
async function handleCreateQuiz(e) {
    e.preventDefault();

    const title = document.getElementById('quizTitle').value;
    const description = document.getElementById('quizDescription').value;
    const duration_minutes = parseInt(document.getElementById('quizDuration').value);
    const passing_score = parseInt(document.getElementById('quizPassing').value);

    try {
        await createQuiz(title, description, duration_minutes, passing_score);
        showMessage('Quiz created successfully!', 'success');
        document.getElementById('createQuizForm').reset();
        loadMyQuizzes();
    } catch (error) {
        showMessage(error.message || 'Failed to create quiz', 'error');
    }
}

// Load My Quizzes
async function loadMyQuizzes() {
    try {
        const quizzes = await getAllQuizzes();
        const quizzesList = document.getElementById('myQuizzesList');

        if (quizzes.length === 0) {
            quizzesList.innerHTML = '<p>No quizzes created yet.</p>';
            return;
        }

        quizzesList.innerHTML = quizzes.map(quiz => `
            <div class="quiz-item">
                <div class="quiz-item-info">
                    <h4>${quiz.title}</h4>
                    <p>Duration: ${quiz.duration} minutes</p>
                    <p>Created: ${new Date(quiz.created_at).toLocaleString()}</p>
                </div>
                <div class="quiz-item-actions">
                    <button class="btn btn-primary" onclick="editQuiz(${quiz.id})">Edit</button>
                    <button class="btn btn-primary" onclick="manageQuestions(${quiz.id})">Questions</button>
                    <button class="btn btn-danger" onclick="deleteQuizConfirm(${quiz.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showMessage(error.message || 'Failed to load quizzes', 'error');
    }
}

// Edit Quiz
async function editQuiz(quizId) {
    try {
        const quiz = await getQuizById(quizId);

        document.getElementById('editQuizTitle').value = quiz.title;
        document.getElementById('editQuizDescription').value = quiz.description || '';
        document.getElementById('editQuizDuration').value = quiz.duration;

        document.getElementById('editQuizForm').dataset.quizId = quizId;
        document.getElementById('editQuizSection').style.display = 'block';

        // Scroll to edit form
        document.getElementById('editQuizSection').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showMessage(error.message || 'Failed to load quiz', 'error');
    }
}

// Handle Edit Quiz
async function handleEditQuiz(e) {
    e.preventDefault();

    const quizId = parseInt(document.getElementById('editQuizForm').dataset.quizId);
    const title = document.getElementById('editQuizTitle').value;
    const description = document.getElementById('editQuizDescription').value;
    const duration_minutes = parseInt(document.getElementById('editQuizDuration').value);

    try {
        await updateQuiz(quizId, { title, duration: duration_minutes });
        showMessage('Quiz updated successfully!', 'success');
        cancelEditQuiz();
        loadMyQuizzes();
    } catch (error) {
        showMessage(error.message || 'Failed to update quiz', 'error');
    }
}

// Cancel Edit Quiz
function cancelEditQuiz() {
    document.getElementById('editQuizSection').style.display = 'none';
    document.getElementById('editQuizForm').reset();
}

// Delete Quiz
async function deleteQuizConfirm(quizId) {
    if (confirm('Are you sure you want to delete this quiz?')) {
        try {
            await deleteQuiz(quizId);
            showMessage('Quiz deleted successfully!', 'success');
            loadMyQuizzes();
        } catch (error) {
            showMessage(error.message || 'Failed to delete quiz', 'error');
        }
    }
}

// Manage Questions
async function manageQuestions(quizId) {
    try {
        currentQuiz = await getQuizById(quizId);

        document.getElementById('manageQuestionsTitle').textContent = `Manage Questions - ${currentQuiz.title}`;
        document.getElementById('createQuestionForm').dataset.quizId = quizId;
        document.getElementById('manageQuestionsSection').style.display = 'block';

        displayQuestions();
        document.getElementById('manageQuestionsSection').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showMessage(error.message || 'Failed to load quiz', 'error');
    }
}

// Display Questions
function displayQuestions() {
    const questionsList = document.getElementById('questionsList');

    if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
        questionsList.innerHTML = '<p>No questions added yet.</p>';
        return;
    }

    questionsList.innerHTML = currentQuiz.questions.map(question => `
        <div class="question-item">
            <div class="question-item-header">
                <h5>${question.question}</h5>
            </div>
            <div class="options-list">
                <div class="option-item ${question.correct_option === 'A' ? 'correct' : ''}">
                    A) ${question.option_a} ${question.correct_option === 'A' ? '✓' : ''}
                </div>
                <div class="option-item ${question.correct_option === 'B' ? 'correct' : ''}">
                    B) ${question.option_b} ${question.correct_option === 'B' ? '✓' : ''}
                </div>
                <div class="option-item ${question.correct_option === 'C' ? 'correct' : ''}">
                    C) ${question.option_c} ${question.correct_option === 'C' ? '✓' : ''}
                </div>
                <div class="option-item ${question.correct_option === 'D' ? 'correct' : ''}">
                    D) ${question.option_d} ${question.correct_option === 'D' ? '✓' : ''}
                </div>
            </div>
            <div class="question-actions">
                <button class="btn btn-danger" onclick="deleteQuestionConfirm(${question.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Handle Create Question
async function handleCreateQuestion(e) {
    e.preventDefault();

    const quizId = parseInt(document.getElementById('createQuestionForm').dataset.quizId);
    const question = document.getElementById('questionText').value;
    const option_a = document.getElementById('optionA').value;
    const option_b = document.getElementById('optionB').value;
    const option_c = document.getElementById('optionC').value;
    const option_d = document.getElementById('optionD').value;
    const correct_option = document.getElementById('correctOption').value;

    if (!question || !option_a || !option_b || !option_c || !option_d || !correct_option) {
        showMessage('All fields are required', 'error');
        return;
    }

    try {
        await createQuestion(quizId, question, option_a, option_b, option_c, option_d, correct_option);
        showMessage('Question added successfully!', 'success');
        document.getElementById('createQuestionForm').reset();

        // Reload questions
        loadQuestionsForQuiz(quizId);
    } catch (error) {
        showMessage(error.message || 'Failed to add question', 'error');
    }
}

// Load questions for a specific quiz
async function loadQuestionsForQuiz(quizId) {
    try {
        const quiz = await getQuizById(quizId);
        currentQuiz = quiz;
        displayQuestions();
    } catch (error) {
        showMessage('Failed to load questions', 'error');
    }
}

// Add Question Option
async function addQuestionOption(questionId) {
    const optionText = prompt('Enter option text:');
    if (!optionText) return;

    const isCorrect = confirm('Is this the correct answer?');

    try {
        await addOption(questionId, optionText, isCorrect);
        showMessage('Option added successfully!', 'success');

        // Reload questions
        currentQuiz = await getQuizById(currentQuiz.id);
        displayQuestions();
    } catch (error) {
        showMessage(error.message || 'Failed to add option', 'error');
    }
}

// Delete Question
async function deleteQuestionConfirm(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        try {
            await deleteQuestion(questionId);
            showMessage('Question deleted successfully!', 'success');

            // Reload questions
            currentQuiz = await getQuizById(currentQuiz.id);
            displayQuestions();
        } catch (error) {
            showMessage(error.message || 'Failed to delete question', 'error');
        }
    }
}

// ==================== STUDENT FUNCTIONS ====================

// Load Student Quizzes
async function loadStudentQuizzes() {
    try {
        const quizzes = await getAllQuizzes();
        const quizzesList = document.getElementById('quizzesListStudent');

        if (quizzes.length === 0) {
            quizzesList.innerHTML = '<p>No quizzes available.</p>';
            return;
        }

        quizzesList.innerHTML = quizzes.map(quiz => `
            <div class="quiz-item">
                <div class="quiz-item-info">
                    <h4>${quiz.title}</h4>
                    <p>Duration: ${quiz.duration} minutes</p>
                    <p>Created: ${new Date(quiz.created_at).toLocaleString()}</p>
                </div>
                <div class="quiz-item-actions">
                    <button class="btn btn-primary" onclick="startQuiz(${quiz.id})">Start Quiz</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showMessage(error.message || 'Failed to load quizzes', 'error');
    }
}

// Start Quiz
async function startQuiz(quizId) {
    try {
        const attempt = await startQuizAttempt(quizId);
        currentAttempt = attempt.resultId || attempt.result_id || attempt.resultId;
        quizEndTime = new Date(attempt.endTime);

        const quiz = await getQuizById(quizId);
        currentQuiz = quiz;

        displayQuizQuestions();
        document.getElementById('quizzesListStudent').style.display = 'none';
        document.getElementById('historySection').style.display = 'none';
        document.getElementById('takingQuizSection').style.display = 'block';
        document.getElementById('currentQuizTitle').textContent = quiz.title;

        startTimer();
        showMessage('Quiz started!', 'success');
    } catch (error) {
        showMessage(error.message || 'Failed to start quiz', 'error');
    }
}

// Display Quiz Questions
function displayQuizQuestions() {
    const container = document.getElementById('questionsContainer');

    // Server returns questions with option_a..option_d fields
    container.innerHTML = currentQuiz.questions.map((q, index) => `
        <div class="quiz-question">
            <h4>${index + 1}. ${q.question}</h4>
            <div class="quiz-question-options">
                <label class="option-radio"><input type="radio" name="question_${q.id}" value="A"> <span>${q.option_a}</span></label>
                <label class="option-radio"><input type="radio" name="question_${q.id}" value="B"> <span>${q.option_b}</span></label>
                <label class="option-radio"><input type="radio" name="question_${q.id}" value="C"> <span>${q.option_c}</span></label>
                <label class="option-radio"><input type="radio" name="question_${q.id}" value="D"> <span>${q.option_d}</span></label>
            </div>
        </div>
    `).join('');
}

// Handle Answer Change
function handleAnswerChange(questionId, type, value) {
    // Store answer temporarily (can be enhanced to auto-save)
    console.log(`Question ${questionId} answered: ${type} - ${value}`);
}

// Submit Quiz
async function submitQuiz() {
    if (!confirm('Are you sure you want to submit the quiz? You cannot make changes after submission.')) {
        return;
    }

    try {
        // Collect all answers into array expected by server: { questionId, selectedOption }
        const answers = [];
        for (const question of currentQuiz.questions) {
            const radio = document.querySelector(`input[name="question_${question.id}"]:checked`);
            if (radio) {
                answers.push({ questionId: question.id, selectedOption: radio.value });
            }
        }

        const result = await submitQuizAttempt(currentAttempt, answers);

        displayResults(result);
        clearInterval(quizTimer);
    } catch (error) {
        showMessage(error.message || 'Failed to submit quiz', 'error');
    }
}

// Display Results
function displayResults(result) {
    document.getElementById('takingQuizSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    // Server returns percentage in `score` (percentage)
    const percentage = result.score ?? 0;
    document.getElementById('resultScore').textContent = `${percentage}%`;
    document.getElementById('resultPercentage').textContent = `${percentage}%`;
    document.getElementById('resultStatus').textContent = result.passed ? 'Passed' : 'Failed';

    if (result.passed) {
        document.getElementById('resultStatus').style.color = '#4caf50';
    } else {
        document.getElementById('resultStatus').style.color = '#ff6b6b';
    }
}

// Cancel Quiz
function cancelQuiz() {
    if (confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
        clearInterval(quizTimer);
        document.getElementById('takingQuizSection').style.display = 'none';
        document.getElementById('quizzesListStudent').style.display = 'block';
        document.getElementById('historySection').style.display = 'block';
        showMessage('Quiz cancelled', 'success');
    }
}

// Back to Quizzes
function backToQuizzes() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('quizzesListStudent').style.display = 'block';
    document.getElementById('historySection').style.display = 'block';
    loadStudentQuizzes();
    loadQuizHistory();
}

// Start Timer
function startTimer() {
    const timerDisplay = document.getElementById('timerDisplay');

    quizTimer = setInterval(() => {
        const now = new Date();
        const diff = quizEndTime - now;

        if (diff <= 0) {
            clearInterval(quizTimer);
            submitQuiz();
            return;
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Load Quiz History
async function loadQuizHistory() {
    try {
        const history = await getQuizHistory();
        const historyList = document.getElementById('historyList');

        if (history.length === 0) {
            historyList.innerHTML = '<p>No quiz attempts yet.</p>';
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="history-item-info">
                    <h5>${item.quiz_title}</h5>
                    <p>Score: ${item.score}/${item.total_possible}</p>
                </div>
                <div class="history-item-info">
                    <p>Percentage: ${item.percentage}%</p>
                    <p>Status: ${item.percentage >= 50 ? 'Passed' : 'Failed'}</p>
                </div>
                <div class="history-item-info">
                    <p>Date: ${new Date(item.created_at).toLocaleDateString()}</p>
                    <p>Time: ${new Date(item.created_at).toLocaleTimeString()}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Show Message
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message show ${type}`;

    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 3000);
}
