import {Navigate, Route, Routes} from "react-router-dom";
import SignUpPage from "./pages/SignUp";
import SignInPage from "./pages/SignIn";

function App() {
    return (
        <Routes>
            <Route path="/" element={<SignUpPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
