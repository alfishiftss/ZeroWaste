import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/member1/Navbar';
import Login from './components/member1/Login';
import Register from './components/member1/Register';
import ForgotPassword from './components/member1/ForgotPassword';
import AdminDashboard from './components/member4/AdminDashboard';
import M4_ContentModeration from './components/member4/M4_ContentModeration';
import Profile from './components/member1/Profile';
import CreateListing from './components/member2/CreateListing';
import Home from './components/member3/Home';
import ConsumerDashboard from './components/member3/ConsumerDashboard';
import Support from './components/member4/Support';


function App() {
    return (
        <Router>
            <div className="app-shell">
                <div className="app-bg" aria-hidden="true"></div>

                <Navbar />

                <main className="app-main">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/moderation" element={<M4_ContentModeration />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/dashboard" element={<ConsumerDashboard />} />
                        <Route path="/business" element={<CreateListing />} />
                        <Route path="/business/listings" element={<CreateListing />} />

                        <Route path="/dashboard" element={<ConsumerDashboard />} />

                        <Route path="/support" element={<Support />} />

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
