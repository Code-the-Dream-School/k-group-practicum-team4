import {Navigate, Route, Routes} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUp";
import SignInPage from "./pages/SignIn";
import ResourcePage from "./pages/ResourcePage";
import LibraryPage from "./pages/LibraryPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import { getAuthToken } from "./api/apiClient";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const token = getAuthToken();
    if (!token) {
        return <Navigate to="/signin" replace />;
    }
    return children;
};


function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/" element={<SignUpPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/flashcards" element={
                <RequireAuth>
                    <FlashcardsPage />
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


