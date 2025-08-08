import React, { useState, useEffect } from 'react';
import './admin.css';

const AdminPage = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users');
            
            if (response.ok) {
                const data = await response.json();
                setStats({
                    total_users: data.total_users,
                    summary: data.summary
                });
                setUsers(data.users);
                setError(null);
            } else {
                throw new Error('Failed to load data');
            }
        } catch (err) {
            setError('Error connecting to server. Make sure the backend is running.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const exportUsers = async () => {
        try {
            const response = await fetch('/api/admin/users/export');
            const data = await response.json();
            
            if (response.ok) {
                const dataStr = JSON.stringify(data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(dataBlob);
                link.download = `users_export_${new Date().toISOString().split('T')[0]}.json`;
                link.click();
            } else {
                alert('Failed to export data');
            }
        } catch (error) {
            alert('Error exporting data: ' + error.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    if (loading && !stats) {
        return (
            <div className="admin-container">
                <div className="admin-header">
                    <h1>🚀 Admin Dashboard</h1>
                    <p>AI Personalized Learning Platform</p>
                </div>
                <div className="loading">Loading statistics...</div>
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="admin-container">
                <div className="admin-header">
                    <h1>🚀 Admin Dashboard</h1>
                    <p>AI Personalized Learning Platform</p>
                </div>
                <div className="error">❌ {error}</div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>🚀 Admin Dashboard</h1>
                <p>AI Personalized Learning Platform</p>
            </div>

            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">{stats.total_users}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.summary.total_learning_hours}</div>
                        <div className="stat-label">Learning Hours</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.summary.total_courses_completed}</div>
                        <div className="stat-label">Courses Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{stats.summary.total_achievements}</div>
                        <div className="stat-label">Total Achievements</div>
                    </div>
                </div>
            )}

            <div className="users-section">
                <div className="section-header">
                    <h2 className="section-title">👥 Registered Users</h2>
                    <div className="section-actions">
                        <button 
                            className="refresh-btn" 
                            onClick={loadData}
                            disabled={loading}
                        >
                            {loading ? '⏳ Loading...' : '🔄 Refresh'}
                        </button>
                        <button className="export-btn" onClick={exportUsers}>
                            📋 Export Data
                        </button>
                    </div>
                </div>

                {users.length === 0 ? (
                    <div className="no-users">No users registered yet.</div>
                ) : (
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>📧 Email</th>
                                    <th>👤 Name</th>
                                    <th>📅 Joined</th>
                                    <th>⏱️ Learning Hours</th>
                                    <th>📚 Courses</th>
                                    <th>🏆 Achievements</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user.email} className={index % 2 === 0 ? 'even' : 'odd'}>
                                        <td>{user.email}</td>
                                        <td>{user.name || 'Not provided'}</td>
                                        <td>{formatDate(user.created_at)}</td>
                                        <td><span className="badge">{user.learning_hours}h</span></td>
                                        <td><span className="badge">{user.courses_completed}</span></td>
                                        <td><span className="badge">{user.achievements}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="admin-footer">
                <p>Last updated: {new Date().toLocaleString()}</p>
                <p>Auto-refresh every 30 seconds</p>
            </div>
        </div>
    );
};

export default AdminPage;
