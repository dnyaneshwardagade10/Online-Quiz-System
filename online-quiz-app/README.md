# Online Quiz System

A comprehensive, server-controlled online quiz system built with Node.js, Express, and MySQL.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Role-Based Access**: Admin and Student roles with different permissions
- **Admin Features**:
  - Create and manage quizzes
  - Add questions with multiple question types
  - Configure quiz settings (duration, passing score)
  - View quiz statistics

- **Student Features**:
  - Take available quizzes
  - Real-time timer for timed quizzes
  - Auto-calculation of scores
  - View quiz history and results

- **Question Types**:
  - Multiple Choice
  - True/False
  - Short Answer

- **Database**:
  - Normalized MySQL schema
  - Relational tables with proper constraints
  - Automatic score calculation

## Project Structure

```
online-quiz-system/
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js
│       └── app.js
└── server/
    ├── app.js
    ├── package.json
    ├── .env
    ├── config/
    │   ├── auth.js
    │   └── database.js
    ├── middleware/
    │   ├── auth.js
    │   └── validation.js
    ├── controllers/
    │   ├── authController.js
    │   ├── quizController.js
    │   ├── questionController.js
    │   └── attemptController.js
    └── routes/
        ├── auth.js
        ├── quiz.js
        ├── question.js
        └── attempt.js
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Update `.env` file with your MySQL credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quiz_system
JWT_SECRET=your-secret-key
NODE_ENV=development
```

4. Initialize the database:
```bash
npm run setup-db
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Open `public/index.html` in a modern web browser or serve it through a simple HTTP server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server public
```

2. Access the application at `http://localhost:8000` (or your server's address)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires token)

### Quiz Management
- `POST /api/quiz` - Create quiz (admin only)
- `GET /api/quiz` - Get all quizzes
- `GET /api/quiz/:quizId` - Get quiz with questions
- `PUT /api/quiz/:quizId` - Update quiz (admin only)
- `DELETE /api/quiz/:quizId` - Delete quiz (admin only)

### Questions
- `POST /api/question/:quizId/questions` - Add question (admin only)
- `GET /api/question/:questionId` - Get question details
- `PUT /api/question/:questionId` - Update question (admin only)
- `DELETE /api/question/:questionId` - Delete question (admin only)
- `POST /api/question/:questionId/options` - Add option (admin only)

### Quiz Attempts
- `POST /api/attempt/:quizId/start` - Start quiz attempt (student only)
- `POST /api/attempt/:attemptId/answer` - Submit answer (student only)
- `POST /api/attempt/:attemptId/finish` - Finish quiz (student only)
- `GET /api/attempt/:attemptId` - Get attempt details
- `GET /api/attempt/user/history` - Get user's quiz history (student only)

## Database Schema

### Users Table
- id, username, email, password (hashed), role, created_at, updated_at

### Quizzes Table
- id, title, description, admin_id, duration_minutes, passing_score, total_questions, is_active, created_at, updated_at

### Questions Table
- id, quiz_id, question_text, question_type, points, created_at

### Options Table
- id, question_id, option_text, is_correct, created_at

### Quiz_Attempts Table
- id, quiz_id, student_id, start_time, end_time, score, total_possible, percentage, status, created_at

### Answers Table
- id, attempt_id, question_id, answer_text, option_id, is_correct, points_earned, created_at

## Technologies Used

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Fetch API for HTTP requests

### Backend
- Node.js
- Express.js
- MySQL2/Promise
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- express-validator (data validation)
- helmet (security headers)
- cors (cross-origin requests)
- dotenv (environment variables)

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- SQL injection prevention (prepared statements)
- CORS protection
- Input validation
- Role-based access control
- Helmet.js security headers

## Future Enhancements

- Leaderboard system
- Question bank and question pool
- Analytics and reporting
- Email notifications
- Mobile app
- Real-time collaboration features
- Question randomization
- Negative marking
- Question level difficulty

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.
