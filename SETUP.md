# Online Quiz System - Setup Guide

## Complete Setup Instructions

### Step 1: Install Node.js

1. Download Node.js from: https://nodejs.org/ (LTS version recommended)
2. Run the installer and follow the installation wizard
3. Restart your computer or terminal after installation
4. Verify installation:
```bash
node --version
npm --version
```

### Step 2: Install MySQL Server

1. Download MySQL from: https://dev.mysql.com/downloads/mysql/
2. Run the installer and complete the setup
3. During installation:
   - Set root password (remember it)
   - Configure MySQL Server
   - Choose default settings
4. After installation, MySQL should be running as a service

### Step 3: Create Database

1. Open MySQL Command Line Client or MySQL Workbench
2. Connect with root credentials
3. Run this command to create the database:
```sql
CREATE DATABASE IF NOT EXISTS quiz_system;
```

### Step 4: Setup Backend

1. Open PowerShell and navigate to the server folder:
```powershell
cd "C:\Users\DNYANESHWAR\OneDrive\Desktop\online-quiz-system\server"
```

2. Install dependencies:
```powershell
npm install
```

3. Update `.env` file with your MySQL credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=quiz_system
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

4. Initialize the database schema:
```powershell
npm run setup-db
```

5. Start the server:
```powershell
npm start
```

You should see: "Server running on http://localhost:5000"

### Step 5: Access Frontend

1. Open a browser and navigate to the public folder:
   - Copy the full path to the public folder
   - Or use a local server:
   
```powershell
# In another PowerShell window, navigate to public folder:
cd "C:\Users\DNYANESHWAR\OneDrive\Desktop\online-quiz-system\public"

# Start a simple HTTP server (if Python is installed):
python -m http.server 8000

# Or install and use http-server globally:
npm install -g http-server
http-server
```

2. Open browser and go to:
   - If using Python: `http://localhost:8000`
   - If using http-server: `http://127.0.0.1:8080`

### Step 6: Test the Application

#### Register/Login
1. Click "Register here" on the login page
2. Create a student account first
3. After login, you'll see "Available Quizzes"

#### Create Admin User
1. Register with role "Admin"
2. Login as admin
3. You'll see admin panel to create quizzes

#### Create a Quiz
1. Fill in quiz details (title, duration, passing score)
2. Click "Create Quiz"
3. Your quiz will appear in "My Quizzes"

#### Add Questions
1. Click "Questions" button on your quiz
2. Add questions with options
3. Mark correct options

#### Take a Quiz (as Student)
1. Logout and login as student
2. Click "Start Quiz" on any available quiz
3. Answer all questions
4. Submit quiz to see results

## Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Restart your terminal/computer after Node.js installation
- Reinstall Node.js

### "Cannot connect to MySQL"
- Check MySQL is running (Services on Windows)
- Verify DB_USER and DB_PASSWORD in .env
- Make sure port 3306 is not blocked

### "Database creation failed"
- Check MySQL is running
- Verify credentials in .env
- Run `npm run setup-db` again

### "Port 5000 is already in use"
- Change PORT in .env to another number (e.g., 5001)
- Or close the application using port 5000

### Frontend shows blank page
- Make sure backend server is running on port 5000
- Check browser console for errors (F12)
- Ensure API_URL in js/api.js matches your backend address

## Key Credentials to Remember

- **MySQL Root Password**: (set during MySQL installation)
- **JWT Secret**: Change in .env file before deploying to production
- **Default API URL**: http://localhost:5000

## Files to Modify

1. `.env` - Database credentials
2. `public/js/api.js` - API_URL if using different port/domain
3. `package.json` - Add more dependencies as needed

## API Server Endpoints

All API calls go to: `http://localhost:5000/api/`

Example endpoints:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/quiz (create quiz)
- GET /api/quiz (get all quizzes)
- POST /api/attempt/{quizId}/start (start taking quiz)

## Security Notes

1. Change JWT_SECRET in production
2. Use HTTPS in production
3. Set proper CORS origins
4. Use environment variables for sensitive data
5. Keep dependencies updated: `npm update`

## Additional Commands

```powershell
# Development with auto-reload
npm run dev

# Setup database
npm run setup-db

# Check for vulnerabilities
npm audit

# Update dependencies
npm update
```

## Support

For detailed API documentation, see the README.md in the project root.
