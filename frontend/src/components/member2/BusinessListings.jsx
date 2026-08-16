import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';
import './BusinessListings.css';

const initialForm = {
    title: '',
    description: '',
    quantity: '',
    foodType: 'Veg',
    expiryTime: '',
};

function BusinessListings() {
    const navigate = useNavigate();
    const [user] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [listings, setListings] = useState([]);
    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const isBusiness = useMemo(() => user?.role === 'Business', [user]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [navigate, user]);

    useEffect(() => {
        const fetchListings = async () => {
        if (!user) {
            return;
        }

        if (!isBusiness) {
            setLoading(false);
            return;
        }

            try {
                const res = await API.get('/listings/mine');
                setListings(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load listings');
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [isBusiness, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData(initialForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setSaving(true);

        try {
            const payload = {
                ...formData,
                quantity: Number(formData.quantity),
            };

            const res = await API.post('/listings', payload);
            setListings((current) => [res.data.listing, ...current]);
            setMessage('Listing posted successfully.');
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not create listing');
        } finally {
            setSaving(false);
        }
    };

    const formatDateTime = (value) =>
        new Date(value).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });

    const formatCreatedDate = (value) =>
        new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    if (loading) {
        return (
            <div className="business-container page">
                <div className="state-block">
                    <div className="loading-spinner"></div>
                    <p>Loading business dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="business-container page">
                <div className="state-block">
                    <div className="loading-spinner"></div>
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (!isBusiness) {
        return (
            <div className="business-container page">
                <div className="page-inner">
                    <div className="panel panel-lit business-access-panel">
                        <div className="state-block business-access-state">
                            <div className="error-icon">!</div>
                            <h3>Business access required</h3>
                            <p>Only business accounts can manage food listings.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const activeCount = listings.filter((listing) => listing.status === 'active').length;
    const totalQuantity = listings.reduce((sum, listing) => sum + Number(listing.quantity || 0), 0);

    return (
        <div className="business-container page">
            <div className="page-inner business-page-inner">
                <div className="business-hero panel panel-lit panel-glass">
                    <div className="business-hero-copy">
                        <span className="eyebrow">
                            <span className="eyebrow-dot" aria-hidden="true"></span>
                            Feature 10
                        </span>
                        <h2>Listing Management</h2>
                        <p>
                            Create text-only food listings for nearby users and keep track of what your
                            business has posted.
                        </p>
                    </div>

                    <div className="stat-grid business-stats">
                        <div className="stat-card info">
                            <span className="stat-value">{listings.length}</span>
                            <span className="stat-label">Listings Created</span>
                        </div>
                        <div className="stat-card ok">
                            <span className="stat-value">{activeCount}</span>
                            <span className="stat-label">Active Listings</span>
                        </div>
                        <div className="stat-card warn">
                            <span className="stat-value">{totalQuantity}</span>
                            <span className="stat-label">Items Posted</span>
                        </div>
                    </div>
                </div>

                <div className="business-layout">
                    <section className="panel panel-lit business-card">
                        <div className="section-heading">
                            <div>
                                <span className="section-kicker">New post</span>
                                <h3>Create a listing</h3>
                            </div>
                            <span className="badge badge-neutral">Text only</span>
                        </div>

                        {message && <div className="alert alert-success business-alert">{message}</div>}
                        {error && <div className="alert alert-error business-alert">{error}</div>}

                        <form className="business-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="listing-title">Title</label>
                                <input
                                    id="listing-title"
                                    name="title"
                                    type="text"
                                    placeholder="e.g. Fresh bakery box"
                                    value={formData.title}
                                    onChange={handleChange}
                                    minLength={3}
                                    maxLength={80}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="listing-description">Description</label>
                                <textarea
                                    id="listing-description"
                                    name="description"
                                    placeholder="Tell people what is available, how it should be stored, and any pickup notes."
                                    value={formData.description}
                                    onChange={handleChange}
                                    minLength={10}
                                    maxLength={500}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="listing-quantity">Quantity</label>
                                    <input
                                        id="listing-quantity"
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="12"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="listing-food-type">Food Type</label>
                                    <select
                                        id="listing-food-type"
                                        name="foodType"
                                        value={formData.foodType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Veg">Veg</option>
                                        <option value="Non-Veg">Non-Veg</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="listing-expiry">Expiry Time</label>
                                <input
                                    id="listing-expiry"
                                    name="expiryTime"
                                    type="datetime-local"
                                    value={formData.expiryTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                                {saving ? (
                                    <>
                                        <span className="loading-spinner small" aria-hidden="true"></span>
                                        Publishing...
                                    </>
                                ) : (
                                    'Publish Listing'
                                )}
                            </button>
                        </form>
                    </section>

                    <section className="panel panel-lit business-card">
                        <div className="section-heading">
                            <div>
                                <span className="section-kicker">Your posts</span>
                                <h3>Recent listings</h3>
                            </div>
                        </div>

                        {listings.length === 0 ? (
                            <div className="state-block business-empty-state">
                                <div className="empty-icon">~</div>
                                <h4>No listings yet</h4>
                                <p>Create your first post to start filling the marketplace.</p>
                            </div>
                        ) : (
                            <div className="listing-stack">
                                {listings.map((listing) => (
                                    <article key={listing._id} className="listing-card">
                                        <div className="listing-card-head">
                                            <div>
                                                <h4>{listing.title}</h4>
                                                <p className="listing-meta">
                                                    Posted {formatCreatedDate(listing.createdAt)}
                                                </p>
                                            </div>
                                            <span
                                                className={`badge ${
                                                    listing.status === 'active'
                                                        ? 'badge-ok'
                                                        : listing.status === 'claimed'
                                                            ? 'badge-info'
                                                            : 'badge-warn'
                                                }`}
                                            >
                                                {listing.status}
                                            </span>
                                        </div>

                                        <p className="listing-description">{listing.description}</p>

                                        <div className="listing-facts">
                                            <span className="listing-pill">Qty: {listing.quantity}</span>
                                            <span className="listing-pill">{listing.foodType}</span>
                                            <span className="listing-pill">
                                                Expires: {formatDateTime(listing.expiryTime)}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default BusinessListings;
