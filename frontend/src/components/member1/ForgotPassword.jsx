import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import './Auth.css';

function ForgotPassword() {
    const [step, setStep] = useState(1); // 1 = enter email, 2 = enter code + new password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [demoCode, setDemoCode] = useState('');

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);

        try {
            const res = await API.post('/auth/forgot-password', { email });
            setMessage({ text: res.data.message, type: 'success' });

            // For demo purposes — show the code
            if (res.data._demoCode) {
                setDemoCode(res.data._demoCode);
            }

            setStep(2);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Something went wrong', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ text: 'Passwords do not match', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const res = await API.post('/auth/reset-password', {
                email,
                code,
                newPassword,
            });
            setMessage({ text: res.data.message, type: 'success' });
            setDemoCode('');
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Reset failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-icon" aria-hidden="true">🔑</div>
                    <h2>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h2>
                    <p>
                        {step === 1
                            ? 'Enter your email to receive a reset code'
                            : 'Enter the code and your new password'}
                    </p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type} auth-error`}>
                        {message.type === 'error' ? '⚠️' : '✅'} {message.text}
                    </div>
                )}

                {/* Demo code banner */}
                {demoCode && (
                    <div className="alert alert-success" style={{ marginBottom: '1.25rem', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, opacity: 0.7 }}>
                            Demo Mode — Your Reset Code
                        </span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.15em' }}>
                            {demoCode}
                        </span>
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestCode} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="reset-email">Email Address</label>
                            <input
                                id="reset-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block auth-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner small" aria-hidden="true"></span>
                                    Sending...
                                </>
                            ) : (
                                '📧 Send Reset Code'
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="reset-code">6-Digit Code</label>
                            <input
                                id="reset-code"
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                maxLength={6}
                                pattern="[0-9]{6}"
                                style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="new-reset-password">New Password</label>
                            <input
                                id="new-reset-password"
                                type="password"
                                placeholder="Min 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm-reset-password">Confirm Password</label>
                            <input
                                id="confirm-reset-password"
                                type="password"
                                placeholder="Repeat new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block auth-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner small" aria-hidden="true"></span>
                                    Resetting...
                                </>
                            ) : (
                                '🔒 Reset Password'
                            )}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary btn-block"
                            onClick={() => { setStep(1); setMessage({ text: '', type: '' }); setDemoCode(''); }}
                            style={{ marginTop: '0.5rem' }}
                        >
                            ← Back to Email
                        </button>
                    </form>
                )}

                <p className="auth-footer">
                    Remember your password? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
