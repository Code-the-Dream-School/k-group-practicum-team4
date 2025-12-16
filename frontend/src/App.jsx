import './App.css';
import { Link } from 'react-router-dom'; // Используем Link для навигации

function App() {
    return (
        <>
            <h1 className="text-4xl font-bold text-blue-600">Learning Hub</h1>
            <nav>
                <ul>
                    <li className="text-s underline text-black-600">
                        <Link to="/">Home page</Link>
                    </li>
                    <li className="text-s underline text-black-600">
                        <Link to="/about">About us</Link>
                    </li>
                </ul>
            </nav>

        </>
    );
}

export default App;
