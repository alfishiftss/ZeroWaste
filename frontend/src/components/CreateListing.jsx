import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './CreateListing.css';

function CreateListing() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        quantity: '',
        foodType: 'Cooked',
        expiryTime: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await API.post('/listings', formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-listing-container">
            <div className="create-listing-card">
                <div className="create-listing-header">
                    <div className="create-listing-icon">🍱</div>
                    <h2>Post Surplus Food</h2>
                    <p>Help reduce waste — list food that needs rescuing</p>
                </div>

                {error && <div className="listing-error">{error}</div>}

                <form onSubmit={handleSubmit} className="listing-form">
                    <div className="form-group">
                        <label htmlFor="listing-title">Title</label>
                        <input
                            id="listing-title"
                            type="text"
                            name="title"
                            placeholder="e.g. Fresh Sandwiches — 20 pcs"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="listing-description">Description</label>
                        <textarea
                            id="listing-description"
                            name="description"
                            placeholder="Describe the food, packaging, pickup instructions..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            maxLength={500}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="listing-quantity">Quantity</label>
                            <input
                                id="listing-quantity"
                                type="text"
                                name="quantity"
                                placeholder="e.g. 5 kg, 20 pcs"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="listing-foodType">Food Type</label>
                            <select
                                id="listing-foodType"
                                name="foodType"
                                value={formData.foodType}
                                onChange={handleChange}
                            >
                                <option value="Cooked">Cooked</option>
                                <option value="Raw">Raw</option>
                                <option value="Packaged">Packaged</option>
                                <option value="Bakery">Bakery</option>
                                <option value="Dairy">Dairy</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="listing-expiry">Expiry Time</label>
                        <input
                            id="listing-expiry"
                            type="datetime-local"
                            name="expiryTime"
                            value={formData.expiryTime}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="listing-submit-btn" disabled={loading}>
                        {loading ? 'Posting...' : '🚀 Publish Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateListing;
