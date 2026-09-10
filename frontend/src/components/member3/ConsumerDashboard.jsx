import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import API from '../../api';
import './ConsumerDashboard.css';

function ConsumerDashboard() {
    const navigate = useNavigate();
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewedListings, setReviewedListings] = useState(new Set());

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        let parsedUser;
        try {
            parsedUser = JSON.parse(storedUser);
        } catch {
            localStorage.removeItem('user');
            navigate('/login');
            return;
        }

        if (parsedUser.role !== 'Consumer') {
            navigate('/');
            return;
        }

        const fetchPickups = async () => {
            try {
                const res = await API.get('/listings/pickups');
                setPickups(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load your pickups');
            } finally {
                setLoading(false);
            }
        };

        fetchPickups();
    }, [navigate]);

    const openReviewModal = (listing) => {
        setSelectedListing(listing);
        setRating(0);
        setHoverRating(0);
        setReviewText('');
        setReviewError('');
        setReviewModalOpen(true);
    };

    const closeReviewModal = () => {
        if (submitting) return;
        setReviewModalOpen(false);
        setSelectedListing(null);
    };

    const submitReview = async () => {
        if (!selectedListing || rating === 0) {
            setReviewError('Please select a star rating.');
            return;
        }

        setSubmitting(true);
        setReviewError('');

        try {
            await API.post('/reviews', {
                listingId: selectedListing._id,
                rating,
                reviewText,
            });
            setReviewedListings((current) => new Set(current).add(selectedListing._id));
            setReviewModalOpen(false);
            setSelectedListing(null);
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container page">
                <div className="state-block">
                    <div className="loading-spinner" aria-hidden="true"></div>
                    <p>Loading your pickups...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container page">
            <div className="page-inner">
                <div className="dashboard-hero panel panel-lit">
                    <span className="eyebrow">Your food rescue history</span>
                    <h1>My Pickups</h1>
                    <p>Track claimed food and review completed pickups.</p>
                </div>

                {error && <div className="alert alert-error" role="alert">{error}</div>}

                {pickups.length === 0 ? (
                    <div className="state-block panel">
                        <div className="empty-icon" aria-hidden="true">🛒</div>
                        <h2>No pickups yet</h2>
                        <p>Browse nearby surplus food and claim your first listing.</p>
                        <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
                            Browse food
                        </button>
                    </div>
                ) : (
                    <div className="pickups-grid">
                        {pickups.map((pickup) => (
                            <article className="pickup-card" key={pickup._id}>
                                <div className="pickup-header">
                                    <h2 className="pickup-title">{pickup.title}</h2>
                                    <span className={`pickup-status ${pickup.status}`}>{pickup.status}</span>
                                </div>
                                <div className="pickup-details">
                                    <p><strong>Business:</strong> {pickup.business?.name || 'Unknown'}</p>
                                    <p><strong>Food type:</strong> {pickup.foodType}</p>
                                    <p><strong>Quantity:</strong> {pickup.quantity}</p>
                                </div>
                                <div className="pickup-actions">
                                    {pickup.status === 'completed' && !reviewedListings.has(pickup._id) ? (
                                        <button
                                            type="button"
                                            className="btn btn-accent btn-sm"
                                            onClick={() => openReviewModal(pickup)}
                                        >
                                            Leave a review
                                        </button>
                                    ) : pickup.status === 'completed' ? (
                                        <span className="badge badge-ok">Reviewed</span>
                                    ) : (
                                        <span className="badge badge-neutral">Pending verification</span>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {reviewModalOpen && (
                <div className="review-modal-overlay" onClick={closeReviewModal}>
                    <div
                        className="review-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="review-dialog-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 id="review-dialog-title">Review {selectedListing?.business?.name}</h2>
                        <p>How was your experience with “{selectedListing?.title}”?</p>
                        {reviewError && <div className="alert alert-error" role="alert">{reviewError}</div>}
                        <div className="star-rating" aria-label="Rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onFocus={() => setHoverRating(star)}
                                    onBlur={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <label className="review-label" htmlFor="review-text">Review details (optional)</label>
                        <textarea
                            id="review-text"
                            className="review-textarea"
                            placeholder="Share details about your experience..."
                            value={reviewText}
                            onChange={(event) => setReviewText(event.target.value)}
                            maxLength={500}
                        />
                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={closeReviewModal} disabled={submitting}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={submitReview} disabled={submitting || rating === 0}>
                                {submitting ? 'Submitting...' : 'Submit review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ConsumerDashboard;
