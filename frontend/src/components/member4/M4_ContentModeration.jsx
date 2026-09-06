import React, { useState, useEffect } from 'react';
import API, { getImageUrl } from '../../api';
import './M4_ContentModeration.css';

function M4_ContentModeration() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const res = await API.get('/moderation/listings');
            setListings(res.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Access denied — Admin privileges required');
            } else if (err.response?.status === 401) {
                setError('Please log in to access this page');
            } else {
                setError('Failed to load listings');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForceDelete = async (id, title) => {
        if (!window.confirm(`Force-delete "${title}"?\n\nThis action cannot be undone.`)) return;

        setDeletingId(id);
        setSuccessMsg('');

        try {
            await API.delete(`/moderation/listings/${id}`);
            setListings((prev) => prev.filter((l) => l._id !== id));
            setSuccessMsg(`"${title}" has been removed`);
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete listing');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    const formatExpiry = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status, expiryTime) => {
        const isExpired = new Date(expiryTime) <= new Date();
        if (isExpired || status === 'expired') return { label: 'Expired', cls: 'badge-danger' };
        if (status === 'claimed') return { label: 'Claimed', cls: 'badge-warn' };
        return { label: 'Active', cls: 'badge-ok' };
    };

    /* ── Loading state ──────────────────────────────── */
    if (loading) {
        return (
            <div className="moderation-container page">
                <div className="state-block">
                    <div className="loading-spinner"></div>
                    <p>Loading listings for moderation…</p>
                </div>
            </div>
        );
    }

    /* ── Error state ────────────────────────────────── */
    if (error) {
        return (
            <div className="moderation-container page">
                <div className="state-block">
                    <div className="error-icon">🔒</div>
                    <h3>{error}</h3>
                </div>
            </div>
        );
    }

    /* ── Main view ──────────────────────────────────── */
    return (
        <div className="moderation-container page">
            <div className="page-inner">

                {/* Header */}
                <div className="moderation-header">
                    <h2>🛡️ Content Moderation</h2>
                    <p className="moderation-subtitle">
                        Total listings: <strong>{listings.length}</strong>
                    </p>
                </div>

                {/* Stat cards */}
                <div className="stat-grid moderation-stats">
                    <div className="stat-card ok">
                        <span className="stat-value">
                            {listings.filter((l) => l.status === 'active' && new Date(l.expiryTime) > new Date()).length}
                        </span>
                        <span className="stat-label">Active</span>
                    </div>
                    <div className="stat-card warn">
                        <span className="stat-value">
                            {listings.filter((l) => l.status === 'claimed').length}
                        </span>
                        <span className="stat-label">Claimed</span>
                    </div>
                    <div className="stat-card danger">
                        <span className="stat-value">
                            {listings.filter((l) => l.status === 'expired' || new Date(l.expiryTime) <= new Date()).length}
                        </span>
                        <span className="stat-label">Expired</span>
                    </div>
                </div>

                {/* Success toast */}
                {successMsg && (
                    <div className="alert alert-success moderation-toast">
                        <span>✅</span> {successMsg}
                    </div>
                )}

                {/* Empty state */}
                {listings.length === 0 ? (
                    <div className="state-block">
                        <div className="empty-icon">📭</div>
                        <h3>No listings found</h3>
                        <p>There are no food listings on the platform yet.</p>
                    </div>
                ) : (
                    /* Listings table */
                    <div className="table-wrap moderation-table-wrapper">
                        <table className="data-table moderation-table" id="moderation-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Business</th>
                                    <th>Type</th>
                                    <th>Qty</th>
                                    <th>Expiry</th>
                                    <th>Status</th>
                                    <th>Posted</th>
                                    <th className="th-action">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map((listing, index) => {
                                    const badge = getStatusBadge(listing.status, listing.expiryTime);
                                    return (
                                        <tr key={listing._id} className={deletingId === listing._id ? 'row-deleting' : ''}>
                                            <td className="row-number">{index + 1}</td>
                                            <td>
                                                {listing.imageUrl ? (
                                                    <img
                                                        src={getImageUrl(listing.imageUrl)}
                                                        alt={listing.title}
                                                        className="mod-thumb"
                                                    />
                                                ) : (
                                                    <div className="mod-thumb-placeholder">🍽️</div>
                                                )}
                                            </td>
                                            <td className="mod-title">{listing.title}</td>
                                            <td className="mod-business">
                                                {listing.business?.name || '—'}
                                            </td>
                                            <td>
                                                <span className={`badge ${listing.foodType === 'Veg' ? 'badge-ok' : 'badge-warn'}`}>
                                                    {listing.foodType}
                                                </span>
                                            </td>
                                            <td className="mod-qty">{listing.quantity}</td>
                                            <td className="mod-expiry">{formatExpiry(listing.expiryTime)}</td>
                                            <td>
                                                <span className={`badge ${badge.cls}`}>{badge.label}</span>
                                            </td>
                                            <td className="mod-date">{formatDate(listing.createdAt)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-force-delete"
                                                    disabled={deletingId === listing._id}
                                                    onClick={() => handleForceDelete(listing._id, listing.title)}
                                                    id={`delete-listing-${listing._id}`}
                                                >
                                                    {deletingId === listing._id ? (
                                                        <span className="loading-spinner small"></span>
                                                    ) : (
                                                        <>🗑️ Force Delete</>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default M4_ContentModeration;
