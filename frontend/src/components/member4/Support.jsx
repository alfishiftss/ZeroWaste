import React, { useState, useEffect } from 'react';
import API from '../../api';
import './Support.css';

function Support() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState({ text: '', type: '' });
    const [submitted, setSubmitted] = useState(false);

    // Pre-fill from logged-in user
    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const user = JSON.parse(stored);
            setFormData((prev) => ({ ...prev, name: user.name || '', email: user.email || '' }));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResult({ text: '', type: '' });
        setLoading(true);

        try {
            const res = await API.post('/support', formData);
            setResult({ text: res.data.message, type: 'success' });
            setSubmitted(true);
        } catch (err) {
            setResult({ text: err.response?.data?.message || 'Failed to submit', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleNewTicket = () => {
        setFormData((prev) => ({ ...prev, subject: '', message: '' }));
        setResult({ text: '', type: '' });
        setSubmitted(false);
    };

    return (
        <div className="support-container page">
            <div className="support-card">
                <div className="support-header">
                    <div className="support-icon" aria-hidden="true">💬</div>
                    <h2>Contact Support</h2>
                    <p>Have a question, feedback, or issue? We'd love to hear from you.</p>
                </div>

                {submitted ? (
                    <div className="support-success-block">
                        <div className="success-checkmark" aria-hidden="true">
                            <svg viewBox="0 0 52 52">
                                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                        </div>
                        <h3>Message Sent!</h3>
                        <p className="success-detail">
                            Your support ticket has been submitted successfully.
                            Our team will review it and get back to you soon.
                        </p>
                        <button className="btn btn-secondary" onClick={handleNewTicket}>
                            📝 Send Another Message
                        </button>
                    </div>
                ) : (
                    <>
                        {result.text && (
                            <div className={`alert alert-${result.type} support-alert`}>
                                {result.type === 'error' ? '⚠️' : '✅'} {result.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="support-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="support-name">Full Name</label>
                                    <input
                                        id="support-name"
                                        type="text"
                                        name="name"
                                        placeholder="Your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="support-email">Email</label>
                                    <input
                                        id="support-email"
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="support-subject">Subject</label>
                                <input
                                    id="support-subject"
                                    type="text"
                                    name="subject"
                                    placeholder="Brief summary of your issue"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="support-message">Message</label>
                                <textarea
                                    id="support-message"
                                    name="message"
                                    placeholder="Describe your issue or feedback in detail..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block support-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner small" aria-hidden="true"></span>
                                        Sending...
                                    </>
                                ) : (
                                    '🚀 Send Message'
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default Support;
