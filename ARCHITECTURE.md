# Chatbot Application - Architecture & Design

## 📐 Architecture Overview

This is a **three-tier client-server architecture** with a separated frontend (React) and backend (Express.js) communicating via REST APIs.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          React Frontend (Port 3000)                  │  │
│  │  - Signup/Login Pages                               │  │
│  │  - Projects Management                              │  │
│  │  - Chat Interface                                   │  │
│  │  - Client-side Routing                              │  │
│  │  - State Management (Context API)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                    HTTP/REST APIs
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Express.js Backend API (Port 5000)             │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │ Authentication Routes                        │   │  │
│  │  │ - User Registration                          │   │  │
│  │  │ - User Login                                 │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │ Project Management Routes                    │   │  │
│  │  │ - Create/Read/Update/Delete Projects         │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │ Chat Routes                                  │   │  │
│  │  │ - Send Messages                              │   │  │
│  │  │ - Retrieve Chat History                      │   │  │
│  │  │ - AI Integration                             │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │ Middleware                                   │   │  │
│  │  │ - JWT Authentication                         │   │  │
│  │  │ - CORS Handling                              │   │  │
│  │  │ - Request Logging (Morgan)                   │   │  │
│  │  │ - Security Headers (Helmet)                  │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                    Database & External APIs
                           │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌──────────────────────┐      ┌──────────────────────┐   │
│  │  Vercel Postgres     │      │  OpenRouter AI API   │   │
│  │  - Users Table       │      │  - Chat Completions  │   │
│  │  - Projects Table    │      │  - LLM Integration   │   │
│  │  - ChatMessages Tbl  │      │                      │   │
│  └──────────────────────┘      └──────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Core Components

### Frontend (React)

#### 1. **Authentication Components**
- **Signup Component**: Registration form with validation
  - Email validation
  - Password strength checking (min 6 chars)
  - Password confirmation matching
  - API integration for user registration

- **Login Component**: Login form
  - Email/password credentials
  - JWT token retrieval and storage
  - Error handling and user feedback

#### 2. **Projects Component**
- List all user projects
- Create new projects
- Select project to start chatting
- Project-level management

#### 3. **Chat Component**
- Real-time message display
- Message input field
- Send messages to backend
- Display AI responses
- Chat history management

#### 4. **Routing & State Management**
- **React Router**: Client-side routing
  - `/signup` - Registration page
  - `/login` - Login page
  - `/projects` - Projects dashboard
  - `/chat/:projectId` - Chat interface
  
- **Context API**: Global authentication state
  - Token management
  - Login/Logout functions
  - Protected routes

### Backend (Express.js)

#### 1. **Authentication Module**
```
/api/auth
├── POST /register
│   └── Create new user with hashed password
└── POST /login
    └── Verify credentials and issue JWT token
```

#### 2. **Projects Module**
```
/api/projects
├── GET / (Protected)
│   └── Retrieve all user projects
├── POST / (Protected)
│   └── Create new project
├── GET /:id (Protected)
│   └── Get specific project details
├── PUT /:id (Protected)
│   └── Update project settings
└── DELETE /:id (Protected)
    └── Delete project
```

#### 3. **Chat Module**
```
/api/chat
├── GET /:projectId (Protected)
│   └── Fetch chat history
└── POST /:projectId (Protected)
    ├── User message storage
    ├── OpenRouter AI call
    └── Assistant response storage
```

#### 4. **Middleware Stack**
- **CORS Middleware**: Cross-origin request handling
- **JWT Authentication**: Token validation on protected routes
- **Morgan Logger**: HTTP request logging
- **Helmet**: Security headers
- **Express JSON Parser**: Request body parsing

#### 5. **Database Layer**
- **Vercel Postgres**: Cloud-based PostgreSQL
- **Database Initialization**: Automatic table creation
- **Query Execution**: SQL queries for CRUD operations

#### 6. **External API Integration**
- **OpenRouter API**: AI chat completions
- **API Communication**: REST API calls with streaming responses

## 🔄 User Journey & Data Flow

### 1. Registration Flow
```
User Input (Signup Page)
    ↓
Frontend Validation
    ↓
API Call: POST /api/auth/register
    ↓
Backend: Hash password with bcryptjs
    ↓
Backend: Insert user into Users table
    ↓
Response: Success/Error message
    ↓
User Redirected to Login
```

### 2. Login Flow
```
User Input (Login Page)
    ↓
API Call: POST /api/auth/login
    ↓
Backend: Verify email exists
    ↓
Backend: Compare password with hash
    ↓
Backend: Generate JWT token
    ↓
Frontend: Store token in localStorage
    ↓
Frontend: Set token in AuthContext
    ↓
User Redirected to Projects
```

### 3. Chat Flow
```
User Message Input
    ↓
API Call: POST /api/chat/:projectId
    ↓
Backend: Authentication Check (JWT)
    ↓
Backend: Store user message in DB
    ↓
Backend: Call OpenRouter AI API
    ↓
Backend: Store AI response in DB
    ↓
Frontend: Display conversation
    ↓
Repeat for next message
```

## 🗄️ Database Design

### Entity Relationship Diagram
```
┌─────────────────────────────────────────┐
│              Users                      │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ email (UNIQUE)                          │
│ password (hashed)                       │
│ createdAt                               │
│ updatedAt                               │
└────────────────┬────────────────────────┘
                 │ (1:N)
                 │
                 ↓
┌─────────────────────────────────────────┐
│            Projects                     │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ name                                    │
│ prompts (TEXT[])                        │
│ userId (FK → Users.id)                  │
│ createdAt                               │
│ updatedAt                               │
└────────────────┬────────────────────────┘
                 │ (1:N)
                 │
                 ↓
┌─────────────────────────────────────────┐
│         ChatMessages                    │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ role ('user' | 'assistant')             │
│ content                                 │
│ projectId (FK → Projects.id)            │
│ createdAt                               │
└─────────────────────────────────────────┘
```

## 🔐 Security Architecture

### Authentication & Authorization
```
Request with Bearer Token
    ↓
Extract token from Authorization header
    ↓
Verify JWT signature with JWT_SECRET
    ↓
Decode token payload (user ID)
    ↓
Attach user info to request object
    ↓
Proceed to route handler
    ↓
Check if user owns requested resource
    ↓
Execute operation or deny access
```

### Password Security
- **Hashing**: bcryptjs with salt rounds
- **Storage**: Never store plaintext passwords
- **Comparison**: Use bcryptjs.compare() for verification

### CORS Security
- **Whitelist Allowed Origins**: Only specified domains can access API
- **Credentials**: Support credential-based requests
- **Methods & Headers**: Restrict to necessary HTTP methods

## 🚀 Deployment Architecture

### Frontend Deployment
- **Platform**: Vercel
- **Build**: `npm run build` creates optimized bundle
- **Output**: Static files served by Vercel CDN
- **Environment**: Production React application

### Backend Deployment
- **Platform**: Vercel Serverless Functions
- **Configuration**: `vercel.json` routes all requests to `api/index.js`
- **Scalability**: Serverless functions auto-scale
- **Database**: Vercel Postgres for persistent data

### Environment Configuration
```
Development:
  - Frontend: http://localhost:3000
  - Backend: http://localhost:5000
  - Database: Local or development DB
  
Production:
  - Frontend: https://chatbot-frontend-*.vercel.app
  - Backend: Vercel Serverless Functions
  - Database: Vercel Postgres (production)
```

## 📊 Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           AuthContext (Global State)                 │  │
│  │  - token: JWT token or null                          │  │
│  │  - login(): Set token in state & localStorage        │  │
│  │  - logout(): Clear token                             │  │
│  └──────────────────────────────────────────────────────┘  │
│           │               │               │                 │
│           ↓               ↓               ↓                 │
│      ┌────────┐      ┌────────┐     ┌─────────┐           │
│      │ Signup │      │ Login  │     │ Chat UI │           │
│      └────────┘      └────────┘     └─────────┘           │
└──────────────┬───────────────┬──────────────┬──────────────┘
               │               │              │
        POST /register  POST /login   POST /chat/:id
               │               │              │
┌──────────────▼───────────────▼──────────────▼──────────────┐
│                    Backend (Express)                       │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Router → Middleware → Route Handler → DB Operation   │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────┬───────────────┬──────────────┬──────────────┘
               │               │              │
               ↓               ↓              ↓
        ┌─────────────┐  ┌────────┐  ┌──────────────┐
        │ Hash & Store│  │Verify &│  │ Store Msg &  │
        │ User in DB  │  │Issue   │  │ Call OpenAI  │
        │             │  │JWT     │  │              │
        └─────────────┘  └────────┘  └──────────────┘
```

## 🔄 Data Flow Examples

### Example 1: Sending a Chat Message
```
1. User types message in Chat component
2. User clicks "Send" button
3. Frontend makes API call:
   POST /api/chat/123
   Headers: Authorization: Bearer <token>
   Body: { message: "What is AI?" }

4. Backend receives request
5. JWT middleware validates token
6. Route handler:
   - Stores user message in ChatMessages table
   - Calls OpenRouter API with message
   - Gets AI response
   - Stores response in ChatMessages table
   
7. Backend returns:
   { 
     response: "AI is...",
     timestamp: "2024-01-17T..."
   }

8. Frontend displays response in Chat UI
9. Updates local message history
```

### Example 2: Creating a New Project
```
1. User enters project name
2. Frontend calls:
   POST /api/projects
   Headers: Authorization: Bearer <token>
   Body: { name: "Customer Support Bot" }

3. Backend:
   - Verifies JWT token
   - Gets user ID from token
   - Inserts new row in Projects table
   - Returns project ID and details

4. Frontend:
   - Stores new project in state
   - Updates projects list
   - Enables user to chat with new project
```

## 🎨 Design Patterns Used

### 1. **MVC Pattern** (Backend)
- **Model**: Database tables (Users, Projects, ChatMessages)
- **View**: JSON responses
- **Controller**: Express route handlers

### 2. **Context API Pattern** (Frontend)
- Global state management for authentication
- Eliminates prop drilling
- Centralized token and user management

### 3. **Protected Routes Pattern**
- Route guards in React Router
- JWT middleware in Express
- Prevents unauthorized access

### 4. **Middleware Chain Pattern** (Backend)
- Sequential processing of requests
- CORS → Authentication → Business Logic
- Modular and reusable

## 📈 Scalability Considerations

### Current Limitations
- Single backend instance (can scale via Vercel)
- PostgreSQL connections (managed by Vercel)
- No caching layer (Redis could be added)
- No message queuing (Bull/RabbitMQ for async operations)

### Future Improvements
1. **Caching**: Redis for chat history and user sessions
2. **WebSockets**: Real-time message delivery
3. **Microservices**: Separate auth, chat, and projects services
4. **Message Queue**: Async job processing for AI calls
5. **Rate Limiting**: Prevent abuse of API endpoints
6. **Monitoring**: Error tracking and performance metrics

## 🔍 Key Technologies & Why

| Technology | Purpose | Why Chosen |
|-----------|---------|-----------|
| React | Frontend UI | Component-based, large ecosystem |
| Express.js | Backend API | Lightweight, flexible, widely used |
| PostgreSQL | Database | Relational, ACID compliant, scalable |
| JWT | Authentication | Stateless, secure, widely compatible |
| bcryptjs | Password hashing | Industry standard, slow hash prevents brute force |
| OpenRouter | AI Integration | Multiple LLM models, easy API |
| Vercel | Deployment | Native serverless, integrated database |
| CORS | Security | Prevents cross-site requests from unknown origins |

---

**Architecture Last Updated**: January 2026  
**Version**: 1.0
