import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/member1/Navbar';
import Login from './components/member1/Login';
import Register from './components/member1/Register';
import AdminDashboard from './components/member4/AdminDashboard';
import Profile from './components/member1/Profile';

function App() {
    return (
        <Router>
            <div className="app-shell">
                <div className="app-bg" aria-hidden="true"></div>

                <Navbar />

                <main className="app-main">
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </main>

                <footer className="app-footer">
                    <div className="footer-inner">
                        <span className="footer-brand">
                            <span aria-hidden="true">♻️</span> ZeroWaste
                        </span>
                        <span className="footer-note">
                            Rescue food · Reduce waste · Feed people
                        </span>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;
