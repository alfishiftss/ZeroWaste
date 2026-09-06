import React, { useState, useEffect } from 'react';
import API from '../../api';
import './AdminDashboard.css';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [resolvingId, setResolvingId] = useState(null);
    const [ticketMsg, setTicketMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, ticketsRes] = await Promise.all([
                    API.get('/auth/users'),
                    API.get('/support'),
                ]);
                setUsers(usersRes.data);
                setTickets(ticketsRes.data);
            } catch (err) {
                if (err.response?.status === 403) {
                    setError('Access denied — Admin privileges required');
                } else if (err.response?.status === 401) {
                    setError('Please log in to access this page');
                } else {
                    setError('Failed to load data');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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

    const handleResolve = async (id) => {
        setResolvingId(id);
        setTicketMsg('');
        try {
            await API.put(`/support/${id}/resolve`);
            setTickets((prev) =>
                prev.map((t) => (t._id === id ? { ...t, status: 'resolved' } : t))
            );
            setTicketMsg('Ticket resolved!');
            setTimeout(() => setTicketMsg(''), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to resolve ticket');
        } finally {
            setResolvingId(null);
        }
    };

    if (loading) {
        return (
            <div className="admin-container page">
                <div className="state-block">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard...</p>
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

    const openTickets = tickets.filter((t) => t.status === 'open').length;

    return (
        <div className="admin-container page">
            <div className="page-inner">
                <div className="admin-header">
                    <h2>⚙️ Admin Dashboard</h2>
                    <p className="admin-subtitle">
                        Manage users, moderation, and support tickets
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👤 Users
                        <span className="tab-count">{users.length}</span>
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'tickets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tickets')}
                    >
                        🎫 Support Tickets
                        {openTickets > 0 && <span className="tab-count alert-count">{openTickets}</span>}
                    </button>
                </div>

                {/* ────── USERS TAB ────── */}
                {activeTab === 'users' && (
                    <>
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
                    </>
                )}

                {/* ────── SUPPORT TICKETS TAB ────── */}
                {activeTab === 'tickets' && (
                    <>
                        <div className="stat-grid admin-stats">
                            <div className="stat-card warn">
                                <span className="stat-value">{openTickets}</span>
                                <span className="stat-label">Open</span>
                            </div>
                            <div className="stat-card ok">
                                <span className="stat-value">
                                    {tickets.filter((t) => t.status === 'resolved').length}
                                </span>
                                <span className="stat-label">Resolved</span>
                            </div>
                            <div className="stat-card info">
                                <span className="stat-value">{tickets.length}</span>
                                <span className="stat-label">Total</span>
                            </div>
                        </div>

                        {ticketMsg && (
                            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                                ✅ {ticketMsg}
                            </div>
                        )}

                        {tickets.length === 0 ? (
                            <div className="state-block" style={{ minHeight: '20vh' }}>
                                <div className="empty-icon">📭</div>
                                <h3>No support tickets yet</h3>
                                <p>Tickets will appear here when users submit them.</p>
                            </div>
                        ) : (
                            <div className="tickets-grid">
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket._id}
                                        className={`ticket-card ${ticket.status === 'resolved' ? 'ticket-resolved' : ''}`}
                                    >
                                        <div className="ticket-header">
                                            <div className="ticket-meta">
                                                <span className="ticket-name">{ticket.name}</span>
                                                <span className="ticket-email">{ticket.email}</span>
                                            </div>
                                            <span className={`badge ${ticket.status === 'open' ? 'badge-warn' : 'badge-ok'}`}>
                                                {ticket.status}
                                            </span>
                                        </div>

                                        <h4 className="ticket-subject">{ticket.subject}</h4>
                                        <p className="ticket-message">{ticket.message}</p>

                                        <div className="ticket-footer">
                                            <span className="ticket-date">{formatDate(ticket.createdAt)}</span>
                                            {ticket.status === 'open' && (
                                                <button
                                                    className="btn btn-sm btn-primary ticket-resolve-btn"
                                                    onClick={() => handleResolve(ticket._id)}
                                                    disabled={resolvingId === ticket._id}
                                                    id={`resolve-${ticket._id}`}
                                                >
                                                    {resolvingId === ticket._id ? (
                                                        <span className="loading-spinner small"></span>
                                                    ) : (
                                                        '✅ Resolve'
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
