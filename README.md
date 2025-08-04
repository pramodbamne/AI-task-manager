# Full-Stack Task Management Application

A complete task management web application built with React, Node.js, Express, and MySQL. It includes user authentication, task CRUD operations, and email notifications for password resets and task creation.

##  Features

* **User Authentication**: Secure user registration and login using session-based authentication with cookies.
* **Password Reset**: Complete "Forgot Password" flow using OTPs sent via email (Resend) and stored temporarily in Redis.
* **Task Management**: Logged-in users can create, view, update, and delete their tasks.
* **Email Notifications**: Automatic email notifications for new tasks and password resets using the Resend API.
* **RESTful API**: A well-structured backend API built with Node.js and Express.

##  Tech Stack

* **Frontend**: React, React Router, Axios
* **Backend**: Node.js, Express.js
* **Database**: MySQL
* **In-Memory Store**: Redis (for OTPs)
* **Authentication**: `express-session`, `bcryptjs`
* **Email Service**: Resend

##  Setup and Installation

Follow these steps to run the project locally.

### Prerequisites

* Node.js installed
* MySQL server running
* Redis server running

### 1. Backend Setup
```bash
# Navigate to the backend folder
cd backend
# Install dependencies
npm install
# Create a .env file and add your credentials
# Start the backend server
npm start

### Frontend setup
# Navigate to the frontend folder
cd frontend
# Install dependencies
npm install
# Start the frontend React app
npm start

# .env.example

# MySQL Database
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=task_app_db

# Express Session
SESSION_SECRET=a_very_strong_secret_key

# Resend API
RESEND_API_KEY=re_YourResendApiKey