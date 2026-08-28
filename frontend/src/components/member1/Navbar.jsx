import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    // Read user from localStorage
    const loadUser = useCallback(() => {
        const stored = localStorage.getItem('user');
        setUser(stored ? JSON.parse(stored) : null);
    }, []);

    // Re-read user on every route change — this is the key fix
    useEffect(() => {
        loadUser();
    }, [location, loadUser]);

    // Also listen for custom 'authChange' events (fired by Login/Register/Logout)
    useEffect(() => {
        const handleAuthChange = () => loadUser();
        window.addEventListener('authChange', handleAuthChange);
        window.addEventListener('storage', handleAuthChange);
        return () => {
            window.removeEventListener('authChange', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, [loadUser]);

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event('authChange'));
        navigate('/login');
    };

    const getAvatarUrl = () => {
        if (user?.profilePicture) {
            return `http://localhost:5000${user.profilePicture}`;
        }
        return null;
    };

    // Highlight the link matching the current route
    const isActivePath = (path) =>
        location.pathname === path || location.pathname.startsWith(`${path}/`);

    const linkClass = (path) =>
        `nav-link${isActivePath(path) ? ' active' : ''}`;

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <span className="logo-mark" aria-hidden="true">♻️</span>
                    <span className="logo-copy">
                        <span className="logo-text">ZeroWaste</span>
                        <span className="logo-tagline">Food rescue network</span>
                    </span>
                </Link>

                <button
                    className={`nav-toggle ${menuOpen ? 'active' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    <li><Link to="/" className={linkClass('/')}>Home</Link></li>

                    {user && user.role === 'Admin' && (
                        <li>
                            <Link to="/admin" className={linkClass('/admin')}>Admin Panel</Link>
                        </li>
                    )}

                    {user && user.role === 'Business' && (
                        <li>
                            <Link to="/business/listings" className={linkClass('/business')}>
                                Listing Dashboard
                            </Link>
                        </li>
                    )}

                    {user && user.role === 'Consumer' && (
                        <li>
                            <Link to="/dashboard" className={linkClass('/dashboard')}>
                                My Claims
                            </Link>
                        </li>
                    )}

                    {user ? (
                        <>
                            <li className="nav-user-info">
                                <Link to="/profile" className="nav-profile-link">
                                    {getAvatarUrl() ? (
                                        <img src={getAvatarUrl()} alt="" className="nav-avatar" />
                                    ) : (
                                        <span className="nav-avatar-placeholder">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    )}
                                    <span className="nav-user-copy">
                                        <span className="nav-username">{user.name}</span>
                                        <span className="nav-badge">{user.role}</span>
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <button
                                    className="btn btn-danger-ghost btn-sm nav-logout-btn"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login" className={linkClass('/login')}>Login</Link></li>
                            <li>
                                <Link to="/register" className="btn btn-primary btn-sm nav-cta">
                                    Get Started
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
