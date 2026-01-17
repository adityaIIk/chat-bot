# Chatbot Application

A full-stack chatbot application with authentication, project management, and AI-powered conversations using OpenRouter API.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## ✨ Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Project Management**: Create and manage multiple chatbot projects
- **AI Chat**: Real-time conversations powered by OpenRouter AI
- **Message History**: Persistent chat message storage
- **CORS Protection**: Secure cross-origin requests
- **Database**: Vercel Postgres integration
- **Security**: Password encryption with bcryptjs, JWT authentication

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.3
- **React Router DOM** 7.12.0
- **Axios** 1.13.2
- **CSS3**

### Backend
- **Express.js** 5.2.1
- **Node.js**
- **Vercel Postgres** 0.10.0
- **OpenAI/OpenRouter** 6.16.0
- **JWT** Authentication
- **bcryptjs** for password hashing
- **CORS** for security
- **Helmet** for security headers
- **Morgan** for logging

## 📦 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chatbot
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

#### Backend Setup
Create a `.env` file in the `backend/` directory:
```env
# Database
POSTGRES_URL=your_vercel_postgres_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# OpenRouter AI API
OPENROUTER_API_KEY=your_openrouter_api_key

# Environment
NODE_ENV=development
```

#### Frontend Setup
Create a `.env` file in the `frontend/` directory (or edit `src/config.js`):
```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

Or configure in `src/config.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
export default API_BASE_URL;
```

## 📱 Running the Application

### Development Mode

#### Terminal 1: Start Backend Server
```bash
cd backend
npm install nodemon -g  # If not already installed
npm run dev
```
The backend will run on `http://localhost:5000`

#### Terminal 2: Start Frontend Development Server
```bash
cd frontend
npm start
```
The frontend will open on `http://localhost:3000`

### Production Mode

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm start  # Requires a server to serve the build folder
```

## 🔧 Environment Variables

### Backend `.env` Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_URL` | Vercel Postgres connection string | `postgres://user:pass@...` |
| `JWT_SECRET` | Secret key for JWT token generation | `your-secret-key` |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI | `sk-or-...` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Frontend `.env` Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API URL | `http://localhost:5000` |

## 📡 API Endpoints

### Authentication
- **POST** `/api/auth/register` - Create new user account
- **POST** `/api/auth/login` - Login user and receive JWT token

### Projects
- **GET** `/api/projects` - Get all projects for authenticated user
- **POST** `/api/projects` - Create new project
- **GET** `/api/projects/:projectId` - Get specific project
- **PUT** `/api/projects/:projectId` - Update project
- **DELETE** `/api/projects/:projectId` - Delete project

### Chat
- **GET** `/api/chat/:projectId` - Get chat history for a project
- **POST** `/api/chat/:projectId` - Send message and get AI response

*Note: All endpoints except `/api/auth/register` and `/api/auth/login` require Bearer token authentication*

## 📁 Project Structure

```
chatbot/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── App.js          # Main app component with routing
│   │   ├── App.css         # Application styles
│   │   ├── config.js       # Configuration and API base URL
│   │   ├── index.js        # React entry point
│   │   └── ...
│   ├── package.json        # Frontend dependencies
│   └── README.md           # Frontend specific documentation
│
└── backend/                 # Express.js backend API
    ├── api/
    │   └── index.js        # Main API server with all endpoints
    ├── package.json        # Backend dependencies
    ├── vercel.json         # Vercel deployment configuration
    └── .env                # Environment variables (not committed)
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcryptjs for secure password storage
- **CORS**: Configurable allowed origins
- **Helmet**: Security headers protection
- **Input Validation**: Email and password validation
- **Bearer Token**: Authorization header enforcement

## 🐛 Troubleshooting

### Backend Won't Start
- Ensure `POSTGRES_URL` is correctly set in `.env`
- Check that Node.js version is v16 or higher: `node --version`
- Verify all dependencies are installed: `npm install`

### Frontend Can't Connect to Backend
- Verify backend is running on correct port
- Check `API_BASE_URL` in `frontend/src/config.js`
- Ensure CORS is properly configured in backend

### Database Connection Issues
- Verify Vercel Postgres connection string in `.env`
- Check if database tables were created (automatic on first request)
- Ensure JWT_SECRET is set

## 📝 Database Schema

### Users Table
- `id`: Primary key (serial)
- `email`: User email (unique)
- `password`: Hashed password
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Projects Table
- `id`: Primary key (serial)
- `name`: Project name
- `prompts`: Array of system prompts
- `userId`: Foreign key to Users
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### ChatMessages Table
- `id`: Primary key (serial)
- `role`: 'user' or 'assistant'
- `content`: Message content
- `projectId`: Foreign key to Projects
- `createdAt`: Timestamp

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
   
<img width="1536" height="1024" alt="Architecture" src="https://github.com/user-attachments/assets/9cc9fe87-bbbd-44c7-9c22-dfe906e6991f" />



