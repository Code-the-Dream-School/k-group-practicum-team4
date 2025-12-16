import './App.css';
import { Link } from 'react-router-dom'; // Используем Link для навигации

function App() {
    return (
        <>
            <h1>Learning Hub</h1>
            <p>Navbar</p>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home page</Link>
                    </li>
                    <li>
                        <Link to="/about">About us</Link>
                    </li>
                </ul>
            </nav>

        </>
    );
}

export default App;
