import React, { useState, useEffect, useRef } from 'react';
import API from '../../api';
import './Profile.css';

function Profile() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPw, setChangingPw] = useState(false);
    const [uploadingPic, setUploadingPic] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [pwMessage, setPwMessage] = useState({ text: '', type: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await API.get('/auth/me');
            setUser(res.data);
            setFormData({ name: res.data.name, email: res.data.email, phone: res.data.phone || '' });
        } catch (err) {
            setMessage({ text: 'Failed to load profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setSaving(true);

        try {
            const res = await API.put('/auth/profile', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser({ ...user, ...res.data.user });
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            // Trigger Navbar re-render
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('authChange'));
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPwMessage({ text: '', type: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPwMessage({ text: 'New passwords do not match', type: 'error' });
            return;
        }

        setChangingPw(true);

        try {
            const res = await API.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setPwMessage({ text: res.data.message, type: 'success' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPwMessage({ text: err.response?.data?.message || 'Failed to change password', type: 'error' });
        } finally {
            setChangingPw(false);
        }
    };

    const handlePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingPic(true);
        setMessage({ text: '', type: '' });

        const data = new FormData();
        data.append('profilePicture', file);

        try {
            const res = await API.put('/auth/profile/picture', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser({ ...user, ...res.data.user });
            setMessage({ text: 'Profile picture updated!', type: 'success' });
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('authChange'));
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Upload failed', type: 'error' });
        } finally {
            setUploadingPic(false);
        }
    };

    const getProfilePicUrl = () => {
        if (user?.profilePicture) {
            return `http://localhost:5000${user.profilePicture}`;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="profile-container page">
                <div className="state-block">
                    <div className="loading-spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container page">
            <div className="profile-content">
                {/* Profile Picture Section */}
                <div className="profile-pic-section">
                    <div className="profile-avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
                        {getProfilePicUrl() ? (
                            <img src={getProfilePicUrl()} alt="Profile" className="profile-avatar-img" />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}
                        <div className="avatar-overlay">
                            <span>📷</span>
                        </div>
                        {uploadingPic && <div className="avatar-uploading"><div className="loading-spinner small"></div></div>}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePictureUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="profile-picture-upload"
                    />
                    <h2 className="profile-name">{user?.name}</h2>
                    <span className="profile-role-badge">{user?.role}</span>
                    <p className="profile-email-display">{user?.email}</p>
                </div>

                {/* Profile Details Form */}
                <div className="profile-card panel">
                    <h3>📝 Edit Profile</h3>

                    {message.text && (
                        <div className={`alert alert-${message.type} profile-message`}>{message.text}</div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="profile-name">Full Name</label>
                            <input
                                id="profile-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                minLength={2}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="profile-email">Email</label>
                            <input
                                id="profile-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="profile-phone">Phone Number</label>
                            <input
                                id="profile-phone"
                                type="tel"
                                name="phone"
                                placeholder="e.g. +880 1234 567890"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block profile-save-btn" disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="loading-spinner small" aria-hidden="true"></span>
                                    Saving...
                                </>
                            ) : (
                                '💾 Save Changes'
                            )}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="profile-card panel">
                    <h3>🔒 Change Password</h3>

                    {pwMessage.text && (
                        <div className={`alert alert-${pwMessage.type} profile-message`}>{pwMessage.text}</div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="current-password">Current Password</label>
                            <input
                                id="current-password"
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="new-password">New Password</label>
                            <input
                                id="new-password"
                                type="password"
                                name="newPassword"
                                placeholder="Min 6 characters"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirm New Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength={6}
                            />
                        </div>

                        <button type="submit" className="btn btn-accent btn-block profile-pw-btn" disabled={changingPw}>
                            {changingPw ? (
                                <>
                                    <span className="loading-spinner small" aria-hidden="true"></span>
                                    Changing...
                                </>
                            ) : (
                                '🔑 Change Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
