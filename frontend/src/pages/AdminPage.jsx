import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Shield, Bell, CheckCircle, RefreshCw } from 'lucide-react';

/*
 * ============================================================
 * 👑 AdminPage.jsx — The Command Center
 * ============================================================
 */

export function AdminPage() {
    const { logout, user } = useAuth();
    
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const [activeTab, setActiveTab] = useState('approvals');

    const [sourceHealths, setSourceHealths] = useState([]);
    const [healthLoading, setHealthLoading] = useState(false);

    const [allUsers, setAllUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    useEffect(() => {
        fetchPendingUsers();
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeTab === 'job_quality') {
            fetchSourceHealth();
        } else if (activeTab === 'users') {
            fetchAllUsers();
        }
    }, [activeTab]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/api/admin/notifications/unread');
            setNotifications(res.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/admin/notifications/${id}/read`);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/users/pending');
            setPendingUsers(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load pending users.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSourceHealth = async () => {
        try {
            setHealthLoading(true);
            const response = await api.get('/api/admin/dashboard/source-health');
            setSourceHealths(response.data);
        } catch (err) {
            console.error('Failed to load source health', err);
        } finally {
            setHealthLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            setUsersLoading(true);
            const response = await api.get('/api/admin/users');
            setAllUsers(response.data);
        } catch (err) {
            setError('Failed to load all users.');
            console.error(err);
        } finally {
            setUsersLoading(false);
        }
    };

    const handleStatusUpdate = async (userId, newStatus) => {
        try {
            await api.put(`/api/admin/users/${userId}/status`, {
                status: newStatus
            });
            // Update in pending users list if there
            setPendingUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
            // Update in all users list if there
            setAllUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, accountStatus: newStatus } : u));
        } catch (err) {
            alert('Failed to update status: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? Their chat messages will be deleted and job posts anonymized.")) {
            return;
        }
        try {
            await api.delete(`/api/admin/users/${userId}`);
            fetchAllUsers();
        } catch (err) {
            alert('Failed to delete user: ' + (err.response?.data?.error || err.message));
        }
    };

    const triggerScrapers = async () => {
        try {
            alert('Triggering scrapers... Check terminal/logs for details.');
            await api.get('/api/debug/trigger-scrapers');
            setTimeout(fetchSourceHealth, 3000);
        } catch (err) {
            alert('Failed to trigger scrapers.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <Shield className="text-primary-600" size={24} />
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
                </div>
                <div className="flex items-center gap-6">
                    {/* Notifications Bell */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                        >
                            <Bell size={20} />
                            {notifications.length > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-gray-900">System Alerts</h3>
                                    <span className="text-xs text-primary-600 font-medium">{notifications.length} unread</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-gray-500 text-sm">
                                            All systems operational.
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-red-600">{notif.source}</span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(notif.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 mb-3">{notif.message}</p>
                                                <button 
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="text-xs text-primary-600 hover:text-primary-700 transition-colors font-medium"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link to="/" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors border border-primary-200 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg">
                        Go to Chat
                    </Link>
                    <span className="text-sm text-gray-500">
                        Logged in as <span className="text-gray-900 font-medium">{user?.fullName}</span>
                    </span>
                    <button 
                        onClick={logout}
                        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-8 py-10">
                
                {/* Tabs */}
                <div className="flex space-x-4 border-b border-gray-200 mb-8 pb-2">
                    <button 
                        onClick={() => setActiveTab('approvals')}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'approvals' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                    >
                        Pending Approvals
                    </button>
                    <button 
                        onClick={() => setActiveTab('job_quality')}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'job_quality' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                    >
                        Job Quality Dashboard
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'users' ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
                    >
                        Manage Users
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {activeTab === 'approvals' && (
                    <>
                        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Pending Approvals</h2>
                                <p className="text-gray-500">Review and verify new student and alumni registrations.</p>
                            </div>
                            <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg border border-primary-200 font-medium inline-block shadow-sm">
                                {pendingUsers.length} Pending Request{pendingUsers.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                                <p className="text-gray-500">Loading requests...</p>
                            </div>
                        ) : pendingUsers.length === 0 ? (
                            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm flex flex-col items-center">
                                <CheckCircle size={48} className="text-primary-500 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">All caught up!</h3>
                                <p className="text-gray-500">There are no pending registrations waiting for approval right now.</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                                                <th className="p-5 font-medium">Name & Contact</th>
                                                <th className="p-5 font-medium">Role</th>
                                                <th className="p-5 font-medium">Details</th>
                                                <th className="p-5 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {pendingUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-5">
                                                        <div className="font-medium text-gray-900">{u.fullName}</div>
                                                        <div className="text-sm text-gray-500">{u.email}</div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Applied: {new Date(u.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                            u.role === 'ROLE_ALUMNI' 
                                                                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}>
                                                            {u.role === 'ROLE_ALUMNI' ? 'Alumni' : 'Student'}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-sm text-gray-700">
                                                        {u.batchNumber && <div><span className="text-gray-500">Batch:</span> {u.batchNumber}</div>}
                                                        {u.company && <div><span className="text-gray-500">Work:</span> {u.company}</div>}
                                                        {u.linkedinUrl && <div><a href={u.linkedinUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">LinkedIn Profile</a></div>}
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <button 
                                                                onClick={() => handleStatusUpdate(u.id, 'APPROVED')}
                                                                className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(u.id, 'REJECTED')}
                                                                className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'job_quality' && (
                    <>
                        <div className="mb-8 flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Job Quality Dashboard</h2>
                                <p className="text-gray-500">Monitor scraper health and aggregation statistics.</p>
                            </div>
                            <button 
                                onClick={triggerScrapers}
                                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                                <RefreshCw size={16} className="inline mr-2" /> Trigger Scrapers Now
                            </button>
                        </div>

                        {healthLoading ? (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                                <p className="text-gray-500">Loading metrics...</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                                                <th className="p-5 font-medium">Source</th>
                                                <th className="p-5 font-medium">Status</th>
                                                <th className="p-5 font-medium">Fetched</th>
                                                <th className="p-5 font-medium">Rejected / Duped</th>
                                                <th className="p-5 font-medium">Failures</th>
                                                <th className="p-5 font-medium text-right">Last Run</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sourceHealths.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                                        No scraper statistics available yet. Run scrapers to populate data.
                                                    </td>
                                                </tr>
                                            ) : (
                                                sourceHealths.map(sh => (
                                                    <tr key={sh.id} className="hover:bg-gray-50 transition-colors text-sm">
                                                        <td className="p-5 font-bold text-gray-900">{sh.sourceName}</td>
                                                        <td className="p-5">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                                                sh.status === 'HEALTHY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                sh.status === 'FAILING' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                'bg-gray-100 text-gray-600 border-gray-200'
                                                            }`}>
                                                                {sh.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-5 text-blue-600 font-medium">{sh.jobsFetched}</td>
                                                        <td className="p-5 text-orange-600 font-medium">{sh.jobsRejected}</td>
                                                        <td className="p-5 text-red-600 font-medium">{sh.failureCount}</td>
                                                        <td className="p-5 text-right text-gray-500">
                                                            {sh.lastRun ? new Date(sh.lastRun).toLocaleString() : 'Never'}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'users' && (
                    <>
                        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Users</h2>
                                <p className="text-gray-500">View and manage all registered accounts in the system.</p>
                            </div>
                        </div>

                        {usersLoading ? (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                                <p className="text-gray-500">Loading users...</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                                                <th className="p-5 font-medium">Name & Contact</th>
                                                <th className="p-5 font-medium">Role</th>
                                                <th className="p-5 font-medium">Status</th>
                                                <th className="p-5 font-medium">Details</th>
                                                <th className="p-5 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {allUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-5">
                                                        <div className="font-medium text-gray-900">{u.fullName}</div>
                                                        <div className="text-sm text-gray-500">{u.email}</div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Joined: {new Date(u.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                            u.role === 'ROLE_ADMIN'
                                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                : u.role === 'ROLE_ALUMNI' 
                                                                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}>
                                                            {u.role.replace('ROLE_', '')}
                                                        </span>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                            u.accountStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            u.accountStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                            'bg-red-50 text-red-700 border-red-200'
                                                        }`}>
                                                            {u.accountStatus}
                                                        </span>
                                                    </td>
                                                    <td className="p-5 text-sm text-gray-700">
                                                        {u.batchNumber && <div><span className="text-gray-500">Batch:</span> {u.batchNumber}</div>}
                                                        {u.company && <div><span className="text-gray-500">Work:</span> {u.company}</div>}
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <div className="flex justify-end gap-3">
                                                            {u.accountStatus !== 'APPROVED' && u.role !== 'ROLE_ADMIN' && (
                                                                <button 
                                                                    onClick={() => handleStatusUpdate(u.id, 'APPROVED')}
                                                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-medium transition-all shadow-sm"
                                                                >
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {u.accountStatus !== 'PENDING' && u.role !== 'ROLE_ADMIN' && (
                                                                <button 
                                                                    onClick={() => handleStatusUpdate(u.id, 'PENDING')}
                                                                    className="px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-600 hover:text-white rounded-lg text-xs font-medium transition-all shadow-sm"
                                                                    title="Suspend User (Cannot login)"
                                                                >
                                                                    Suspend
                                                                </button>
                                                            )}
                                                            {u.role !== 'ROLE_ADMIN' && (
                                                                <button 
                                                                    onClick={() => handleDeleteUser(u.id)}
                                                                    className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white rounded-lg text-xs font-medium transition-all shadow-sm"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
