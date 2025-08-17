# AI-Powered Full-Stack Task Manager

A complete task management web application built with React, Node.js, and MySQL. This project features a secure user authentication system, a full password reset flow using Redis and Resend, and a powerful AI integration with Google's Gemini LLM for managing tasks via natural language.

## ✨ Key Features

* **Full User Authentication**: Secure registration and login with session-based authentication.
* **Complete Task Management**: Users can create, view, update, and delete their tasks.
* **AI Chatbot**: An interactive chatbot on the dashboard that allows users to add, delete, and query tasks using plain English.
* **AI Command-Line Tool**: A `cli.js` script to create tasks from the terminal.
* **Secure Password Reset**: A full "Forgot Password" system using OTPs sent via email and stored securely in Redis.
* **Email Notifications**: Automatic email notifications for new tasks and password resets powered by the Resend API.

## 🛠️ Tech Stack

* **Frontend**: React, React Router, Axios
* **Backend**: Node.js, Express.js
* **Database**: MySQL
* **In-Memory Store**: Redis
* **AI Model**: Google Gemini
* **Email Service**: Resend

## 🚀 How to Run Locally

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file with your credentials
npm start

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start