import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../../api';
import './NotificationBell.css';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await API.get('/notifications');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            // Silent fail — notifications are non-critical
        }
    }, []);

    // Initial fetch + poll every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const markAllRead = async () => {
        setLoading(true);
        try {
            await API.put('/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            // Silent fail
        } finally {
            setLoading(false);
        }
    };

    const markOneRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            // Silent fail
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case 'claim': return '🎉';
            case 'complete': return '✅';
            default: return '📢';
        }
    };

    return (
        <div className="notif-bell-wrapper" ref={dropdownRef}>
            <button
                className="notif-bell-btn"
                onClick={toggleDropdown}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                aria-expanded={isOpen}
                id="notification-bell"
            >
                <svg
                    className="notif-bell-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="notif-badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notif-dropdown" role="menu">
                    <div className="notif-dropdown-header">
                        <h4>Notifications</h4>
                        {unreadCount > 0 && (
                            <button
                                className="notif-mark-all-btn"
                                onClick={markAllRead}
                                disabled={loading}
                            >
                                {loading ? 'Marking...' : 'Mark all read'}
                            </button>
                        )}
                    </div>

                    <div className="notif-dropdown-body">
                        {notifications.length === 0 ? (
                            <div className="notif-empty">
                                <span className="notif-empty-icon" aria-hidden="true">🔔</span>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className={`notif-item ${notif.read ? '' : 'unread'}`}
                                    onClick={() => !notif.read && markOneRead(notif._id)}
                                    role="menuitem"
                                >
                                    <span className="notif-item-icon" aria-hidden="true">
                                        {getNotifIcon(notif.type)}
                                    </span>
                                    <div className="notif-item-content">
                                        <p className="notif-item-message">{notif.message}</p>
                                        <span className="notif-item-time">{timeAgo(notif.createdAt)}</span>
                                    </div>
                                    {!notif.read && <span className="notif-unread-dot" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
