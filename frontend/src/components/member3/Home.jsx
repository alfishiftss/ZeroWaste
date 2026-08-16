import React, { useState, useEffect } from 'react';
import API from '../../api';
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

    // Visual urgency tier for the expiry pill
    const getExpiryTone = (dateStr) => {
        const diffMs = new Date(dateStr) - new Date();
        if (diffMs < 0) return 'badge-danger';
        if (diffMs < 3 * 60 * 60 * 1000) return 'badge-warn urgent';
        return 'badge-ok';
    };

    if (loading) {
        return (
            <div className="home-container page">
                <div className="page-inner">
                    <div className="home-hero">
                        <div className="skeleton skel-chip"></div>
                        <div className="skeleton skel-title"></div>
                        <div className="skeleton skel-sub"></div>
                    </div>
                    <div className="listings-grid" aria-busy="true" aria-label="Loading available food">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div className="listing-skeleton" key={i}>
                                <div className="skeleton skel-row"></div>
                                <div className="skeleton skel-heading"></div>
                                <div className="skeleton skel-line"></div>
                                <div className="skeleton skel-line short"></div>
                                <div className="skeleton skel-footer"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const availableCount = listings.filter(
        (l) => new Date(l.expiryTime) > new Date()
    ).length;

    return (
        <div className="home-container page">
            <div className="page-inner">
                <header className="home-hero">
                    <span className="eyebrow">
                        <span className="eyebrow-dot" aria-hidden="true"></span>
                        {availableCount} available right now
                    </span>

                    <h1>
                        Rescue food, <span className="gradient-text">reduce waste</span>
                    </h1>

                    <p>
                        Browse surplus food from local businesses — claim it before it expires
                        and keep good meals out of the bin.
                    </p>
                </header>

                {error && <div className="alert alert-error home-error">⚠️ {error}</div>}

                {listings.length === 0 ? (
                    <div className="home-empty">
                        <div className="empty-icon" aria-hidden="true">📭</div>
                        <h3>No listings yet</h3>
                        <p>Check back soon — businesses are posting surplus food daily.</p>
                    </div>
                ) : (
                    <div className="listings-grid">
                        {listings.map((listing, index) => {
                            const isExpired = new Date(listing.expiryTime) < new Date();
                            return (
                                <article
                                    className={`listing-card ${isExpired ? 'expired' : ''}`}
                                    key={listing._id}
                                    style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
                                >
                                    <div className="card-header">
                                        <span className="tile" aria-hidden="true">
                                            {getFoodTypeEmoji(listing.foodType)}
                                        </span>
                                        <div className="card-heading">
                                            <span className="food-type-badge">{listing.foodType}</span>
                                            <span className={`badge expiry-badge ${getExpiryTone(listing.expiryTime)}`}>
                                                {formatExpiry(listing.expiryTime)}
                                            </span>
                                        </div>
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
                                            <span className="meta-value with-avatar">
                                                <span className="meta-avatar" aria-hidden="true">
                                                    {(listing.business?.name || 'U').charAt(0).toUpperCase()}
                                                </span>
                                                {listing.business?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
