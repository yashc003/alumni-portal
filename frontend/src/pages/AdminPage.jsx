import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/*
 * ============================================================
 * 👑 AdminPage.jsx — The Command Center
 * ============================================================
 * This page is restricted to ROLE_ADMIN.
 * It fetches the list of PENDING users from the backend and
 * displays them in a beautiful Tailwind CSS table.
 * 
 * The admin can click "Approve" or "Reject" to send a PUT request
 * to our backend.
 * ============================================================
 */

export function AdminPage() {
    const { logout, user } = useAuth();
    
    // State to hold the array of pending users
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /*
     * 1. 🔄 Fetch pending users when the page first loads
     */
    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            // Calls GET /api/admin/users/pending (Interceptor adds JWT automatically!)
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

    /*
     * 2. ✅❌ Handle Approve or Reject button clicks
     */
    const handleStatusUpdate = async (userId, newStatus) => {
        try {
            // Calls PUT /api/admin/users/{id}/status with { "status": "APPROVED" }
            await api.put(`/api/admin/users/${userId}/status`, {
                status: newStatus
            });
            
            // Instantly remove the user from our local React state so they
            // disappear from the table without needing to refresh the page!
            setPendingUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
            
        } catch (err) {
            // Show a popup if something goes wrong
            alert('Failed to update status: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-slate-200">
            {/* Top Navigation Bar */}
            <nav className="bg-dark-surface border-b border-dark-border px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-lg">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">👑</span>
                    <h1 className="text-xl font-bold text-white tracking-tight">Admin Portal</h1>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors border border-primary-500/30 bg-primary-500/10 px-3 py-1.5 rounded-lg">
                        Go to Chat
                    </Link>
                    <span className="text-sm text-slate-400">
                        Logged in as <span className="text-white font-medium">{user?.fullName}</span>
                    </span>
                    <button 
                        onClick={logout}
                        className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                        Log Out
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-8 py-10">
                
                {/* Header section */}
                <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Pending Approvals</h2>
                        <p className="text-slate-400">Review and verify new student and alumni registrations.</p>
                    </div>
                    {/* Dynamic counter pill */}
                    <div className="bg-primary-500/10 text-primary-400 px-4 py-2 rounded-lg border border-primary-500/20 font-medium inline-block">
                        {pendingUsers.length} Pending Request{pendingUsers.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* State 1: Loading */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-slate-400">Loading requests...</p>
                    </div>
                ) : 
                
                /* State 2: Empty State (No users pending) */
                pendingUsers.length === 0 ? (
                    <div className="bg-dark-surface border border-dark-border rounded-xl p-16 text-center shadow-xl">
                        <div className="text-5xl mb-4">✨</div>
                        <h3 className="text-xl font-medium text-white mb-2">All caught up!</h3>
                        <p className="text-slate-400">There are no pending registrations waiting for approval right now.</p>
                    </div>
                ) : 
                
                /* State 3: Data Table */
                (
                    <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800/50 text-slate-300 text-sm uppercase tracking-wider border-b border-dark-border">
                                        <th className="p-5 font-medium">Name & Contact</th>
                                        <th className="p-5 font-medium">Role</th>
                                        <th className="p-5 font-medium">Details</th>
                                        <th className="p-5 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-border">
                                    {pendingUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                                            {/* Column 1: Name and Email */}
                                            <td className="p-5">
                                                <div className="font-medium text-white">{u.fullName}</div>
                                                <div className="text-sm text-slate-400">{u.email}</div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    Applied: {new Date(u.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            
                                            {/* Column 2: Role Badge */}
                                            <td className="p-5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                    u.role === 'ROLE_ALUMNI' 
                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {u.role === 'ROLE_ALUMNI' ? 'Alumni' : 'Student'}
                                                </span>
                                            </td>
                                            
                                            {/* Column 3: Extra Info */}
                                            <td className="p-5 text-sm text-slate-300">
                                                {u.batchNumber && <div><span className="text-slate-500">Batch:</span> {u.batchNumber}</div>}
                                                {u.company && <div><span className="text-slate-500">Work:</span> {u.company}</div>}
                                                {u.linkedinUrl && <div><a href={u.linkedinUrl} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline">LinkedIn Profile</a></div>}
                                            </td>
                                            
                                            {/* Column 4: Action Buttons */}
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button 
                                                        onClick={() => handleStatusUpdate(u.id, 'APPROVED')}
                                                        className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-emerald-500/20"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(u.id, 'REJECTED')}
                                                        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-red-500/20"
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
            </main>
        </div>
    );
}
