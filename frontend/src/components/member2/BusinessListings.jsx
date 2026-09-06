import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getImageUrl } from '../../api';
import './BusinessListings.css';

const initialForm = {
    title: '',
    description: '',
    quantity: '',
    foodType: 'Veg',
    expiryTime: '',
    city: '',
    neighborhood: '',
};

// Format a Date/ISO string into the value a <input type="datetime-local"> expects
const toDateTimeLocal = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
        date.getHours()
    )}:${pad(date.getMinutes())}`;
};

function BusinessListings() {
    const navigate = useNavigate();
    const [user] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [listings, setListings] = useState([]);
    const [formData, setFormData] = useState(initialForm);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
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

    // Release the object URL used for the local image preview when it changes/unmounts
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const resetForm = () => {
        setFormData(initialForm);
        setImageFile(null);
        setImagePreview('');
        setEditingId(null);
    };

    const startEdit = (listing) => {
        setEditingId(listing._id);
        setFormData({
            title: listing.title,
            description: listing.description,
            quantity: String(listing.quantity),
            foodType: listing.foodType,
            expiryTime: toDateTimeLocal(listing.expiryTime),
            city: listing.city || '',
            neighborhood: listing.neighborhood || '',
        });
        setImageFile(null);
        setImagePreview('');
        setMessage('');
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (listingId) => {
        setDeletingId(listingId);
        setError('');
        setMessage('');

        try {
            await API.delete(`/listings/${listingId}`);
            setListings((current) => current.filter((listing) => listing._id !== listingId));
            setMessage('Listing deleted.');
            if (editingId === listingId) resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not delete listing');
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    const requestDelete = (listingId) => {
        // toggle inline confirmation
        setConfirmDeleteId((current) => (current === listingId ? null : listingId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setSaving(true);

        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('description', formData.description);
            payload.append('quantity', formData.quantity);
            payload.append('foodType', formData.foodType);
            payload.append('expiryTime', formData.expiryTime);
            payload.append('city', formData.city);
            payload.append('neighborhood', formData.neighborhood);
            if (imageFile) payload.append('image', imageFile);

            if (editingId) {
                const res = await API.put(`/listings/${editingId}`, payload);
                setListings((current) =>
                    current.map((listing) => (listing._id === editingId ? res.data.listing : listing))
                );
                setMessage('Listing updated successfully.');
            } else {
                const res = await API.post('/listings', payload);
                setListings((current) => [res.data.listing, ...current]);
                setMessage('Listing posted successfully.');
            }

            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save listing');
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
                            Create food listings with a photo for nearby users, and edit or remove them
                            any time.
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
                                <span className="section-kicker">{editingId ? 'Editing post' : 'New post'}</span>
                                <h3>{editingId ? 'Edit listing' : 'Create a listing'}</h3>
                            </div>
                            {editingId ? (
                                <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
                                    Cancel edit
                                </button>
                            ) : (
                                <span className="badge badge-neutral">Photo optional</span>
                            )}
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
                                    <div className="field-help">Number of items available for pickup.</div>
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

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="listing-city">City</label>
                                    <input
                                        id="listing-city"
                                        name="city"
                                        type="text"
                                        placeholder="e.g. Dhaka"
                                        value={formData.city}
                                        onChange={handleChange}
                                        maxLength={60}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="listing-neighborhood">Neighborhood</label>
                                    <input
                                        id="listing-neighborhood"
                                        name="neighborhood"
                                        type="text"
                                        placeholder="e.g. Gulshan"
                                        value={formData.neighborhood}
                                        onChange={handleChange}
                                        maxLength={60}
                                    />
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
                                <div className="field-help">Local date and time when the listing should be removed.</div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="listing-image">Photo</label>
                                <input
                                    id="listing-image"
                                    name="image"
                                    type="file"
                                    accept="image/png, image/jpeg, image/gif, image/webp"
                                    onChange={handleImageChange}
                                />
                                <div className="field-help">Optional — helps buyers identify items. Max 5MB recommended.</div>
                                {(imagePreview || (editingId && listings.find((l) => l._id === editingId)?.imageUrl)) && (
                                    <img
                                        className="image-preview"
                                        alt="Listing preview"
                                        src={
                                            imagePreview ||
                                            getImageUrl(listings.find((l) => l._id === editingId)?.imageUrl)
                                        }
                                    />
                                )}
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                                {saving ? (
                                    <>
                                        <span className="loading-spinner small" aria-hidden="true"></span>
                                        {editingId ? 'Saving...' : 'Publishing...'}
                                    </>
                                ) : editingId ? (
                                    'Save Changes'
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
                                            {listing.imageUrl && (
                                                <img
                                                    className="listing-thumb"
                                                    src={getImageUrl(listing.imageUrl)}
                                                    alt={listing.title}
                                                />
                                            )}
                                            <div className="listing-card-title-wrap">
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
                                            {(listing.neighborhood || listing.city) && (
                                                <span className="listing-pill">
                                                    {[listing.neighborhood, listing.city].filter(Boolean).join(', ')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="listing-actions">
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => startEdit(listing)}
                                            >
                                                Edit
                                            </button>
                                            {confirmDeleteId === listing._id ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(listing._id)}
                                                        disabled={deletingId === listing._id}
                                                    >
                                                        {deletingId === listing._id ? 'Deleting...' : 'Confirm Delete'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => requestDelete(null)}
                                                        disabled={deletingId === listing._id}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-danger-ghost btn-sm"
                                                    onClick={() => requestDelete(listing._id)}
                                                    disabled={deletingId === listing._id}
                                                >
                                                    Delete
                                                </button>
                                            )}
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
