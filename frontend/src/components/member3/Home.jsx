import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import API, { getImageUrl } from '../../api';
import './Home.css';

const initialFilters = {
    city: '',
    foodType: '',
    endingSoon: false,
};

function Home() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [filters, setFilters] = useState(initialFilters);
    const [cityOptions, setCityOptions] = useState([]);
    const [impactStats, setImpactStats] = useState({ mealsSaved: 0, totalListings: 0, activeDonors: 0 });
    const [claimingId, setClaimingId] = useState(null);
    const [claimMsg, setClaimMsg] = useState({ id: '', text: '', type: '' });

    // Animated counter refs
    const [displayedMeals, setDisplayedMeals] = useState(0);
    const animFrame = useRef(null);

    // Business Reviews Modal State
    const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
    const [businessReviews, setBusinessReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState(null);

    // Fetch impact stats
    useEffect(() => {
        const fetchImpact = async () => {
            try {
                const res = await API.get('/impact/stats');
                setImpactStats(res.data);
            } catch (err) {
                // Non-critical
            }
        };
        fetchImpact();
    }, []);

    // Animate the meals counter
    useEffect(() => {
        const target = impactStats.mealsSaved;
        const duration = 1200;
        const startTime = performance.now();
        const startVal = displayedMeals;

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayedMeals(Math.round(startVal + (target - startVal) * eased));

            if (progress < 1) {
                animFrame.current = requestAnimationFrame(animate);
            }
        };

        if (target !== startVal) {
            animFrame.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animFrame.current) cancelAnimationFrame(animFrame.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [impactStats.mealsSaved]);

    // Debounce the free-text search so we don't fire a request per keystroke
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchInput.trim()), 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Build the city suggestion list once, from the unfiltered feed
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const loadCities = async () => {
            try {
                const res = await API.get('/listings');
                const cities = [...new Set(res.data.map((l) => l.city).filter(Boolean))].sort();
                setCityOptions(cities);
            } catch (err) {
                // Non-critical — city suggestions just stay empty
            }
        };
        loadCities();
    }, []);

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                const params = {};
                if (debouncedQuery) params.q = debouncedQuery;
                if (filters.city.trim()) params.city = filters.city.trim();
                if (filters.foodType) params.foodType = filters.foodType;
                if (filters.endingSoon) params.endingSoon = 'true';

                const res = await API.get('/listings', { params });
                setListings(res.data);
                setError('');
            } catch (err) {
                setError('Failed to load listings');
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [debouncedQuery, filters.city, filters.foodType, filters.endingSoon]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    };

    const clearFilters = () => {
        setSearchInput('');
        setFilters(initialFilters);
    };


    const hasActiveFilters =
        searchInput.trim() || filters.city.trim() || filters.foodType || filters.endingSoon;

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

    const getFoodTypeEmoji = (type) => (type === 'Veg' ? '🥗' : '🍗');

    // Visual urgency tier for the expiry pill
    const getExpiryTone = (dateStr) => {
        const diffMs = new Date(dateStr) - new Date();
        if (diffMs < 0) return 'badge-danger';
        if (diffMs < 3 * 60 * 60 * 1000) return 'badge-warn urgent';
        return 'badge-ok';
    };

    // Claim handler
    const handleClaim = async (listingId) => {
        const user = localStorage.getItem('user');
        if (!user) {
            setClaimMsg({ id: listingId, text: 'Please log in to claim listings', type: 'error' });
            return;
        }
        const parsed = JSON.parse(user);
        if (parsed.role !== 'Consumer') {
            setClaimMsg({ id: listingId, text: 'Only consumers can claim listings', type: 'error' });
            return;
        }

        setClaimingId(listingId);
        setClaimMsg({ id: '', text: '', type: '' });

        try {
            const res = await API.post(`/listings/${listingId}/claim`);
            // Update listing in local state
            setListings((prev) =>
                prev.map((l) =>
                    l._id === listingId ? { ...l, status: 'claimed' } : l
                )
            );
            
            setClaimMsg({ id: listingId, text: res.data.message, type: 'success' });
            
            // Pop up the OTP for the demo
            if (res.data.otp) {
                alert(`OTP Sent! Your pickup code is: ${res.data.otp}\nShow this to the business to complete the order.`);
            }
            
        } catch (err) {
            setClaimMsg({ id: listingId, text: err.response?.data?.message || 'Claim failed', type: 'error' });
        } finally {
            setClaimingId(null);
        }
    };

    const handleViewReviews = async (business) => {
        if (!business || !business._id) return;
        setSelectedBusiness(business);
        setReviewsModalOpen(true);
        setReviewsLoading(true);
        setBusinessReviews([]);

        try {
            const res = await API.get(`/reviews/business/${business._id}`);
            setBusinessReviews(res.data);
        } catch (err) {
            // Handle silently or show toast
        } finally {
            setReviewsLoading(false);
        }
    };

    const filterBar = (
        <div className="feed-toolbar panel panel-lit">
            <div className="search-field">
                <span className="search-icon" aria-hidden="true">🔎</span>
                <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    aria-label="Search food listings"
                />
            </div>

            <div className="filter-controls">
                <input
                    className="filter-input"
                    type="text"
                    name="city"
                    list="city-options"
                    placeholder="Neighborhood / City"
                    value={filters.city}
                    onChange={handleFilterChange}
                    aria-label="Filter by neighborhood or city"
                />
                <datalist id="city-options">
                    {cityOptions.map((city) => (
                        <option key={city} value={city} />
                    ))}
                </datalist>

                <select
                    className="filter-input"
                    name="foodType"
                    value={filters.foodType}
                    onChange={handleFilterChange}
                    aria-label="Filter by food type"
                >
                    <option value="">All Food Types</option>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                </select>

                <label className="ending-soon-toggle">
                    <input
                        type="checkbox"
                        name="endingSoon"
                        checked={filters.endingSoon}
                        onChange={handleFilterChange}
                    />
                    Ending Soon
                </label>

                {hasActiveFilters && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>
                        Clear
                    </button>
                )}
            </div>
        </div>
    );

    if (loading && listings.length === 0) {
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

    return (
        <div className="home-container page">
            <div className="page-inner">
                {/* ── Impact Stats Banner ──────────────────── */}
                <div className="impact-banner">
                    <div className="impact-card impact-hero-card">
                        <span className="impact-emoji" aria-hidden="true">🍽️</span>
                        <span className="impact-number">{displayedMeals.toLocaleString()}</span>
                        <span className="impact-label">Meals Saved</span>
                    </div>
                    <div className="impact-card">
                        <span className="impact-emoji" aria-hidden="true">📦</span>
                        <span className="impact-number">{impactStats.totalListings}</span>
                        <span className="impact-label">Total Listings</span>
                    </div>
                    <div className="impact-card">
                        <span className="impact-emoji" aria-hidden="true">🏪</span>
                        <span className="impact-number">{impactStats.activeDonors}</span>
                        <span className="impact-label">Active Donors</span>
                    </div>
                </div>

                <header className="home-hero">
                    <span className="eyebrow">
                        <span className="eyebrow-dot" aria-hidden="true"></span>
                        {listings.length} available right now
                    </span>

                    <h1>
                        Rescue food, <span className="gradient-text">reduce waste</span>
                    </h1>

                    <p>
                        Browse surplus food from local businesses — claim it before it expires
                        and keep good meals out of the bin.
                    </p>
                </header>

                {filterBar}

                {error && <div className="alert alert-error home-error" role="alert">⚠️ {error}</div>}

                {listings.length === 0 ? (
                    <div className="home-empty">
                        <div className="empty-icon" aria-hidden="true">📭</div>
                        <h3>No listings match your search</h3>
                        <p>Try a different search term, or clear your filters.</p>
                    </div>
                ) : (
                    <div className="listings-grid">
                        {listings.map((listing, index) => (
                            <article
                                className={`listing-card ${listing.status !== 'active' ? 'listing-claimed' : ''}`}
                                key={listing._id}
                                style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
                            >
                                {listing.imageUrl ? (
                                    <img
                                        className="card-image"
                                        src={getImageUrl(listing.imageUrl)}
                                        alt={listing.title}
                                    />
                                ) : (
                                    <div className="card-header">
                                        <span className="tile" aria-hidden="true">
                                            {getFoodTypeEmoji(listing.foodType)}
                                        </span>
                                        <div className="card-heading">
                                            <span className="food-type-badge">{listing.foodType}</span>
                                            <span
                                                className={`badge expiry-badge ${getExpiryTone(listing.expiryTime)}`}
                                            >
                                                {formatExpiry(listing.expiryTime)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {listing.imageUrl && (
                                    <div className="card-header card-header-compact">
                                        <span className="food-type-badge">
                                            {getFoodTypeEmoji(listing.foodType)} {listing.foodType}
                                        </span>
                                        <span
                                            className={`badge expiry-badge ${getExpiryTone(listing.expiryTime)}`}
                                        >
                                            {formatExpiry(listing.expiryTime)}
                                        </span>
                                    </div>
                                )}

                                <h3 className="card-title">{listing.title}</h3>
                                <p className="card-description">{listing.description}</p>

                                {(listing.neighborhood || listing.city) && (
                                    <p className="card-location">
                                        📍 {[listing.neighborhood, listing.city].filter(Boolean).join(', ')}
                                    </p>
                                )}

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
                                            <button
                                                type="button"
                                                className="btn-link-sm"
                                                onClick={() => handleViewReviews(listing.business)}
                                            >
                                                View reviews
                                            </button>
                                        </span>
                                    </div>
                                </div>
                                <div className="card-claim-section">
                                    {listing.status !== 'active' ? (
                                        <span className="badge badge-warn claim-status-badge">
                                            Claimed
                                        </span>
                                    ) : user?.role === 'Consumer' ? (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm btn-claim"
                                                onClick={() => handleClaim(listing._id)}
                                                disabled={claimingId === listing._id}
                                                id={`claim-${listing._id}`}
                                            >
                                                {claimingId === listing._id ? (
                                                    <>
                                                        <span className="loading-spinner small" aria-hidden="true"></span>
                                                        Claiming...
                                                    </>
                                                ) : (
                                                    '🤝 Claim This'
                                                )}
                                            </button>
                                            {claimMsg.id === listing._id && (
                                                <span className={`claim-feedback ${claimMsg.type}`} role="status">
                                                    {claimMsg.text}
                                                </span>
                                            )}
                                        </>
                                    ) : !user ? (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm btn-claim"
                                            onClick={() => navigate('/login')}
                                        >
                                            Sign in to claim
                                        </button>
                                    ) : (
                                        <span className="availability-note">Available for consumers</span>
                                    )}
                                </div>

                            </article>
                        ))}
                    </div>
                )}
            </div>

            {/* Business Reviews Modal */}
            {reviewsModalOpen && (
                <div className="business-reviews-overlay" onClick={() => setReviewsModalOpen(false)}>
                    <div
                        className="business-reviews-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reviews-modal-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 id="reviews-modal-title">Reviews for {selectedBusiness?.name}</h3>

                        {reviewsLoading ? (
                            <div className="state-block">
                                <div className="loading-spinner"></div>
                                <p>Loading reviews...</p>
                            </div>
                        ) : businessReviews.length === 0 ? (
                            <div className="state-block">
                                <p>No reviews yet for this business.</p>
                            </div>
                        ) : (
                            <div className="reviews-list">
                                {businessReviews.map((review) => (
                                    <div className="review-item" key={review._id}>
                                        <div className="review-header">
                                            <span className="review-author">
                                                {review.user?.name || 'Anonymous'}
                                            </span>
                                            <span className="review-stars">
                                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                            </span>
                                        </div>
                                        {review.reviewText && (
                                            <p className="review-text">{review.reviewText}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <button className="btn btn-secondary modal-close-btn" onClick={() => setReviewsModalOpen(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
