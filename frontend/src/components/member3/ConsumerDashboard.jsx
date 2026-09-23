import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';
import './ConsumerDashboard.css';

function ConsumerDashboard() {
    const navigate = useNavigate();

    const [claims, setClaims] = useState([]);
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Review Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');
    
    // Track newly reviewed listings in state so we can disable the button immediately
    const [reviewedListings, setReviewedListings] = useState(new Set());

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch claims
                const claimsRes = await API.get('/claims/my-claims');
                setClaims(claimsRes.data);

                // Fetch pickups
                const pickupsRes = await API.get('/listings/pickups');
                setPickups(pickupsRes.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

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

    const openReviewModal = (listing) => {
        setSelectedListing(listing);
        setRating(0);
        setHoverRating(0);
        setReviewText('');
        setReviewError('');
        setReviewModalOpen(true);
    };

    const closeReviewModal = () => {
        setReviewModalOpen(false);
        setSelectedListing(null);
    };

    const submitReview = async () => {
        if (rating === 0) {
            setReviewError('Please select a star rating.');
            return;
        }

        setSubmitting(true);
        setReviewError('');

        try {
            await API.post('/reviews', {
                listingId: selectedListing._id,
                rating,
                reviewText
            });

            // Add to reviewed set
            setReviewedListings((prev) => new Set(prev).add(selectedListing._id));
            closeReviewModal();
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container page">
                <div className="page-inner">
                    <h2>Loading dashboard...</h2>
                    <div className="state-block">
                        <div className="loading-spinner"></div>
                        <p>Loading your data...</p>
                    </div>
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

                <div className="dashboard-hero panel panel-lit" style={{ marginTop: '2rem' }}>
                    <h2>My Pickups</h2>
                    <p>Track your claims and leave reviews for businesses.</p>
                </div>

                {pickups.length === 0 ? (
                    <div className="state-block panel">
                        <div className="empty-icon" aria-hidden="true">🛒</div>
                        <h4>No pickups yet</h4>
                        <p>Browse the home feed to claim surplus food!</p>
                        <button className="btn btn-primary" onClick={() => navigate('/')}>
                            Browse Food
                        </button>
                    </div>
                ) : (
                    <div className="pickups-grid">
                        {pickups.map(pickup => (
                            <div className="pickup-card" key={pickup._id}>
                                <div className="pickup-header">
                                    <h3 className="pickup-title">{pickup.title}</h3>
                                    <span className={`pickup-status ${pickup.status}`}>
                                        {pickup.status}
                                    </span>
                                </div>
                                <div className="pickup-details">
                                    <p><strong>Business:</strong> {pickup.business?.name || 'Unknown'}</p>
                                    <p><strong>Food Type:</strong> {pickup.foodType}</p>
                                    <p><strong>Quantity:</strong> {pickup.quantity}</p>
                                </div>
                                
                                <div className="pickup-actions">
                                    {pickup.status === 'completed' && !reviewedListings.has(pickup._id) ? (
                                        <button 
                                            className="btn btn-accent btn-sm"
                                            onClick={() => openReviewModal(pickup)}
                                        >
                                            ⭐ Leave a Review
                                        </button>
                                    ) : pickup.status === 'completed' && reviewedListings.has(pickup._id) ? (
                                        <span className="badge badge-ok">Reviewed</span>
                                    ) : (
                                        <span className="badge badge-neutral">Pending Verification</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewModalOpen && (
                <div className="review-modal-overlay" onClick={closeReviewModal}>
                    <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Review {selectedListing?.business?.name}</h3>
                        <p>How was your experience with "{selectedListing?.title}"?</p>

                        {reviewError && <div className="alert alert-error" style={{marginBottom: '1rem'}}>{reviewError}</div>}

                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    type="button"
                                    aria-label={`Rate ${star} stars`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="review-textarea"
                            placeholder="Share details about your experience (optional)..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            maxLength={500}
                        />

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={closeReviewModal} disabled={submitting}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={submitReview} disabled={submitting || rating === 0}>
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ConsumerDashboard;
