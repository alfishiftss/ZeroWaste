import React, { useState, useEffect } from 'react';
import API from '../../api';
import './AdminDashboard.css';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await API.get('/auth/users');
                setUsers(res.data);
            } catch (err) {
                if (err.response?.status === 403) {
                    setError('Access denied — Admin privileges required');
                } else if (err.response?.status === 401) {
                    setError('Please log in to access this page');
                } else {
                    setError('Failed to load users');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getRoleBadgeClass = (role) => {
        const classes = {
            Admin: 'role-admin',
            Business: 'role-business',
            Consumer: 'role-consumer',
        };
        return classes[role] || '';
    };

    if (loading) {
        return (
            <div className="admin-container page">
                <div className="state-block">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-container page">
                <div className="state-block">
                    <div className="error-icon">🔒</div>
                    <h3>{error}</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container page">
            <div className="page-inner">
                <div className="admin-header">
                    <h2>👤 Users Panel</h2>
                    <p className="admin-subtitle">
                        Total registered users: <strong>{users.length}</strong>
                    </p>
                </div>

                <div className="stat-grid admin-stats">
                    <div className="stat-card warn">
                        <span className="stat-value">
                            {users.filter((u) => u.role === 'Admin').length}
                        </span>
                        <span className="stat-label">Admins</span>
                    </div>
                    <div className="stat-card info">
                        <span className="stat-value">
                            {users.filter((u) => u.role === 'Business').length}
                        </span>
                        <span className="stat-label">Businesses</span>
                    </div>
                    <div className="stat-card ok">
                        <span className="stat-value">
                            {users.filter((u) => u.role === 'Consumer').length}
                        </span>
                        <span className="stat-label">Consumers</span>
                    </div>
                </div>

                <div className="table-wrap admin-table-wrapper">
                    <table className="data-table admin-table" id="users-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user._id}>
                                    <td className="row-number">{index + 1}</td>
                                    <td className="user-name">{user.name}</td>
                                    <td className="user-email">{user.email}</td>
                                    <td>
                                        <span className={`badge role-badge ${getRoleBadgeClass(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="user-date">{formatDate(user.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
