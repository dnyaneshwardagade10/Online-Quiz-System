# How to Get a Cloud MySQL Database

Render does not host MySQL databases (only PostgreSQL). You need an external provider.

## Recommended Free Options
... (Aiven instructions remain the same) ...

Once created, copy the **Service URI** (Connection String).

## Configuring Render
1.  Go to your Render Dashboard.
2.  Select your Web Service.
3.  Go to **Environment Variables**.
4.  Add a new variable:
    -   **Key**: `DB_URL`
    -   **Value**: (Paste your connection string here)
        -   *Example*: `mysql://avedb:password@host:port/defaultdb?ssl-mode=REQUIRED`

Once you save, your app will restart and connect to the cloud database automatically.

## How to Import Data (Easiest Method)
I have created a custom tool for you.

1.  Open your terminal in the project folder `online-quiz-system`.
2.  Run this command:
    ```bash
    node import-cloud.js
    ```
3.  It will connect to Aiven and ask for your password.
4.  Paste your password (it will be hidden) and press Enter.

It will upload both `online_quiz_db` and `student_management_db` data for you.
