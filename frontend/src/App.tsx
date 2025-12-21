import { useEffect, useState } from 'react';
import './App.css'
import {Link, Route, Routes} from "react-router-dom";

function App() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Call the backend API
    fetch('http://localhost:8080/api/hello')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch from backend');
        }
        return response.json();
      })
      .then((data) => {
        setMessage(data.message);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
          <nav className="mb-8 space-x-4">
              <Link to="/" className="text-blue-600 hover:underline font-bold">Home</Link>
              <Link to="/about" className="text-blue-600 hover:underline font-bold">About</Link>
          </nav>

          <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
              <Routes>
                  <Route path="/" element={
                      <>
                          <h1 className="text-3xl font-black text-indigo-600 mb-4">Learning Hub App</h1>
                          <p className="text-gray-600">Let's build a wonderful app!</p>
                      </>
                  } />
                  <Route path="/about" element={<h1 className="text-2xl font-bold">About Page</h1>} />
              </Routes>
          </div>
      </div>
  );
}

export default App
