# AI Study Assistant (Practicum)

AI-powered study tool that helps students learn faster by generating summaries, flashcards, and quizzes from their study materials.

## 🚀 Live Demo

- **Frontend Repo:** `/frontend`
- **Mobile Repo:** `/mobile`
- **Backend Repo:** `/backend`

## 🧠 Problem Statement

Students often struggle to process large amounts of information and create effective study materials like summaries and flashcards. This project automates these tasks using AI, allowing students to focus on learning rather than organization.

This application is designed for students and lifelong learners facing information overload and time-consuming manual study prep. It provides immediate, high-quality study aids tailored to the user's specific content.

## 🎯 Features

- **AI Summarization:** Automatically generate concise summaries from long study materials.
- **Flashcard Generation:** Create study decks instantly using AI.
- **Interactive Quizzes:** Test knowledge with AI-generated questions.
- **Study Dashboard:** Track progress and manage study resources.
- **Multi-platform:** Access via web or mobile (React Native).
- **Secure Auth:** JWT-based authentication for user accounts.

## 🛠 Tech Stack

### Frontend & Mobile
- **React 19** (Web) & **React Native / Expo** (Mobile)
- **TypeScript**
- **Tailwind CSS v4** & **NativeWind v4**
- **Vite** & **Expo Router**
- **Lucide React** (Icons)

### Backend
- **Node.js** & **Express.js**
- **TypeScript**
- **Google Generative AI** (Gemini API)
- **REST API**

### Database
- **MongoDB** (Mongoose)

### Tooling
- **Git & GitHub**
- **GitHub Actions** (CI)
- **dotenv** (Environment variables)
- **ESLint / Prettier**

## 📁 Project Structure

```text
project-root/
├── frontend/             # React Web Application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/               # React Native (Expo) Application
│   ├── app/              # Expo Router pages
│   ├── components/
│   ├── assets/
│   ├── constants/
│   └── package.json
│
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── services/     # AI and Business logic
│   │   ├── config/
│   │   ├── app.ts
│   │   └── server.ts     # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (Package Manager)
- **MongoDB** (Local or Atlas)
- **Gemini API Key** (for AI features)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on existing config:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The app usually runs on: `http://localhost:5173`

### Mobile Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```

## 🧪 Available Scripts

### Backend
- `npm run dev`: Starts the server with nodemon and tsc watch.
- `npm run build`: Compiles TypeScript to JavaScript.
- `npm start`: Runs the compiled server from `dist/`.

### Frontend
- `npm run dev`: Starts Vite development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint for code quality.
- `npm run preview`: Previews the production build locally.

### Mobile
- `npx expo start`: Standard Expo start.
- `npm run tunnel`: Expo start with tunnel (useful for testing on physical devices).
- `npm run android`: Run on Android.
- `npm run ios`: Run on iOS.

## 🔐 API Overview

### Endpoints
- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`
- **Resources:** `GET /api/resources`, `POST /api/resources`, `POST /api/resources/:id/summary`
- **Flashcards:** `POST /api/flashcard-sets/generate`, `GET /api/flashcard-sets`, `GET /api/flashcard-sets/:setId`
- **Quiz:** `POST /api/quiz-sets/generate`, `GET /api/quiz-sets`, `POST /api/quiz-sets/:quizId/submit`
- **AI Assistant:** `POST /api/ai/chat` (based on `ai.routes.ts`)

## 🤝 Team & Collaboration

### Team Members
- [TODO: Add Team Members]

## 📌 Known Issues / Limitations
- No automated tests yet.

## 📄 License
This project is for educational purposes only.
