import React, { useState, useEffect } from 'react';
import API from '../../api';
import './ConsumerDashboard.css';

function ConsumerDashboard() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const res = await API.get('/claims/my-claims');
                setClaims(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load your claims.');
            } finally {
                setLoading(false);
            }
        };

        fetchClaims();
    }, []);

    const formatExpiry = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = date - now;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffMs < 0) return 'Expired';
        if (diffHrs > 24) return `${Math.floor(diffHrs / 24)}d ${diffHrs % 24}h left`;
        if (diffHrs > 0) return `${diffHrs}h ${diffMins}m left`;
        return `${diffMins}m left`;
    };

    if (loading) {
        return (
            <div className="dashboard-container page">
                <div className="page-inner">
                    <h2>Loading dashboard...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container page">
            <div className="page-inner">
                <header className="dashboard-header">
                    <h1>My Claims</h1>
                    <p>Show these 4-digit codes to the business when picking up your food.</p>
                </header>

                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {claims.length === 0 && !error ? (
                    <div className="dashboard-empty">
                        <div className="empty-icon" aria-hidden="true">🧾</div>
                        <h3>No Active Claims</h3>
                        <p>When you claim a food listing, it will appear here.</p>
                    </div>
                ) : (
                    <div className="claims-grid">
                        {claims.map((claim) => (
                            <div className="claim-card" key={claim._id}>
                                <div className="claim-card-header">
                                    <span className={`status-badge status-${claim.status.toLowerCase()}`}>
                                        {claim.status}
                                    </span>
                                    <div className="otp-display">
                                        <span className="otp-label">PICKUP CODE</span>
                                        <span className="otp-code">{claim.otp}</span>
                                    </div>
                                </div>
                                <div className="claim-card-body">
                                    {claim.listing ? (
                                        <>
                                            <h3 className="claim-title">{claim.listing.title}</h3>
                                            <p className="claim-desc">{claim.listing.description}</p>
                                            <p className="claim-meta">
                                                📍 {[claim.listing.neighborhood, claim.listing.city].filter(Boolean).join(', ')}
                                            </p>
                                            <p className="claim-meta">
                                                ⏳ {formatExpiry(claim.listing.expiryTime)}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="claim-desc text-muted">Listing information unavailable (possibly deleted).</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ConsumerDashboard;
