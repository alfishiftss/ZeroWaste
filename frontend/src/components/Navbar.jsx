import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    // Re-check user on storage changes (e.g. login/logout in another tab)
    useEffect(() => {
        const handleStorage = () => {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <span className="logo-icon">♻️</span>
                    <span className="logo-text">ZeroWaste</span>
                </Link>

                <button
                    className={`nav-toggle ${menuOpen ? 'active' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>

                    {user && (user.role === 'Business' || user.role === 'Admin') && (
                        <li>
                            <Link to="/create-listing" onClick={() => setMenuOpen(false)}>
                                Post Food
                            </Link>
                        </li>
                    )}

                    {user && user.role === 'Admin' && (
                        <li>
                            <Link to="/admin" onClick={() => setMenuOpen(false)}>
                                Admin Dashboard
                            </Link>
                        </li>
                    )}

                    {user ? (
                        <>
                            <li className="nav-user-info">
                                <span className="nav-badge">{user.role}</span>
                                <span className="nav-username">{user.name}</span>
                            </li>
                            <li>
                                <button className="nav-logout-btn" onClick={handleLogout}>
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
                            <li><Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
