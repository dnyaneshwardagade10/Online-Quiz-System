# How to Run the Projects

This repository contains two separate applications. Follow the instructions below to run each one.

## 1. Student Management System (New Project)
This is the new CRUD application with Course and Enrollment management.

**Steps:**
1.  Open your terminal.
2.  Navigate to the folder:
    ```bash
    cd student-management-system
    ```
3.  Start the server:
    ```bash
    npm start
    ```
4.  Open your browser and search:
    [http://localhost:3000](http://localhost:3000)

---

## 2. Online Quiz App (Original Project)
This is your original quiz application.

**Steps:**
1.  Open your terminal.
2.  Navigate to the folder:
    ```bash
    cd online-quiz-app
    ```
3.  Start the server:
    ```bash
    npm start
    ```
    *(Note: This now correctly delegates to the `server` folder)*.
4.  Open your browser and search:
    [http://localhost:5000](http://localhost:5000) (Check terminal output for the exact port).

## Database
Both projects use the same MySQL instance but different databases:
-   `student-management-system` uses `student_management_db`
-   `online-quiz-app` uses `online_quiz_db`

The credentials for both are:
-   User: `root`
-   Password: `root`
