import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUp";
import SignInPage from "./pages/SignIn";
import DashboardPage from "./pages/DashboardPage.tsx";
import ResourcePage from "./pages/ResourcePage";
import LibraryPage from "./pages/LibraryPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import QuizPage from "./pages/QuizzesPage";
import { getAuthToken } from "./api/apiClient";

const RequireAuth = ({ children }: { children: ReactElement }) => {
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
  {/* Public */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/signup" element={<SignUpPage />} />
  <Route path="/signin" element={<SignInPage />} />

  {/* Protected */}
  <Route path="/dashboard" element={
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  } />

  <Route path="/library" element={
    <RequireAuth>
      <LibraryPage />
    </RequireAuth>
  } />

  <Route path="/flashcards" element={
    <RequireAuth>
      <FlashcardsPage />
    </RequireAuth>
  } />

  <Route path="/quiz/:id" element={
    <RequireAuth>
      <QuizPage />
    </RequireAuth>
  } />

  <Route path="/quizzes/:quizId" element={
    <RequireAuth>
      <QuizPage />
    </RequireAuth>
  } />

  <Route path="/resources/:id" element={
    <RequireAuth>
      <ResourcePage />
    </RequireAuth>
  } />

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

    );
}

export default App;
