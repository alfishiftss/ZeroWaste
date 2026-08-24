import React, { useState, useEffect } from 'react';
import API, { getImageUrl } from '../../api';
import './Home.css';

const initialFilters = {
    city: '',
    foodType: '',
    endingSoon: false,
};

function Home() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [filters, setFilters] = useState(initialFilters);
    const [cityOptions, setCityOptions] = useState([]);

    // Debounce the free-text search so we don't fire a request per keystroke
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchInput.trim()), 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Build the city suggestion list once, from the unfiltered feed
    useEffect(() => {
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

                {error && <div className="alert alert-error home-error">⚠️ {error}</div>}

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
                                className="listing-card"
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
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
