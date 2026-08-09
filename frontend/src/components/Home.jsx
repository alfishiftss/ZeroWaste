import React, { useState, useEffect } from 'react';
import API from '../api';
import './Home.css';

function Home() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await API.get('/listings');
                setListings(res.data);
            } catch (err) {
                setError('Failed to load listings');
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
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

    const getFoodTypeEmoji = (type) => {
        const emojis = {
            Cooked: '🍲',
            Raw: '🥬',
            Packaged: '📦',
            Bakery: '🍞',
            Dairy: '🧀',
            Other: '🍽️',
        };
        return emojis[type] || '🍽️';
    };

    if (loading) {
        return (
            <div className="home-container">
                <div className="home-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading available food...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className="home-hero">
                <h1>🌍 Rescue Food, Reduce Waste</h1>
                <p>Browse surplus food from local businesses — pick up before it expires!</p>
            </div>

            {error && <div className="home-error">{error}</div>}

            {listings.length === 0 ? (
                <div className="home-empty">
                    <div className="empty-icon">📭</div>
                    <h3>No listings yet</h3>
                    <p>Check back soon — businesses are posting surplus food daily.</p>
                </div>
            ) : (
                <div className="listings-grid">
                    {listings.map((listing) => {
                        const isExpired = new Date(listing.expiryTime) < new Date();
                        return (
                            <div
                                className={`listing-card ${isExpired ? 'expired' : ''}`}
                                key={listing._id}
                            >
                                <div className="card-header">
                                    <span className="food-type-badge">
                                        {getFoodTypeEmoji(listing.foodType)} {listing.foodType}
                                    </span>
                                    <span className={`expiry-badge ${isExpired ? 'expired' : ''}`}>
                                        {formatExpiry(listing.expiryTime)}
                                    </span>
                                </div>

                                <h3 className="card-title">{listing.title}</h3>
                                <p className="card-description">{listing.description}</p>

                                <div className="card-meta">
                                    <div className="meta-item">
                                        <span className="meta-label">Quantity</span>
                                        <span className="meta-value">{listing.quantity}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-label">Posted by</span>
                                        <span className="meta-value">
                                            {listing.businessId?.name || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Home;
