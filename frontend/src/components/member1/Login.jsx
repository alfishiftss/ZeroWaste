import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api';
import './Auth.css';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await API.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.dispatchEvent(new Event('authChange'));

            // Role-based redirect
            const role = res.data.user.role;
            if (role === 'Admin') {
                navigate('/admin');
            } else if (role === 'Business') {
                navigate('/business/listings');
            } else {
                navigate('/profile');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon" aria-hidden="true">♻️</div>
                    <h2>Welcome back</h2>
                    <p>Sign in to continue rescuing food</p>
                </div>

                {error && <div className="alert alert-error auth-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <Link to="/forgot-password" className="forgot-pw-link">Forgot Password?</Link>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block auth-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner small" aria-hidden="true"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
