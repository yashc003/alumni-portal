import React, { useState, useEffect } from 'react';
import api from '../api/axios';

/*
 * ============================================================
 * 🌐 DirectoryPage.jsx
 * ============================================================
 * Displays a beautiful grid of all approved Alumni.
 * Includes search functionality to filter by name or company.
 * ============================================================
 */

export function DirectoryPage() {
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        api.get('/api/directory/alumni')
            .then(res => {
                setAlumni(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load directory", err);
                setLoading(false);
            });
    }, []);

    // Filter alumni based on search query (checks name and company)
    const filteredAlumni = alumni.filter(person => {
        const query = searchQuery.toLowerCase();
        const matchesName = person.fullName?.toLowerCase().includes(query);
        const matchesCompany = person.company?.toLowerCase().includes(query);
        return matchesName || matchesCompany;
    });

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-dark-bg text-gray-500 h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                <p>Loading Alumni Network...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-dark-bg overflow-y-auto custom-scrollbar">
            {/* Header Area */}
            <div className="bg-dark-surface border-b border-gray-800 p-8 shadow-sm">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-2">Alumni Network</h1>
                    <p className="text-gray-400 mb-6">Connect with graduates, find mentors, and explore career paths.</p>
                    
                    {/* Search Bar */}
                    <div className="relative max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            🔍
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors shadow-inner"
                        />
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
                {filteredAlumni.length === 0 ? (
                    <div className="text-center py-20 bg-dark-surface rounded-xl border border-gray-800">
                        <div className="text-4xl mb-4">🕵️‍♂️</div>
                        <h3 className="text-xl font-medium text-white mb-2">No alumni found</h3>
                        <p className="text-gray-400">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAlumni.map(person => (
                            <div key={person.id} className="bg-dark-surface border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:border-gray-700 transition-all duration-300 group flex flex-col">
                                {/* Card Header (Banner) */}
                                <div className="h-20 bg-gradient-to-r from-primary-900/40 to-purple-900/40 relative">
                                    <div className="absolute -bottom-8 left-6">
                                        <div className="w-16 h-16 rounded-xl bg-primary-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-dark-surface transform group-hover:scale-105 transition-transform">
                                            {person.fullName.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    {/* Batch Badge */}
                                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-xs font-semibold text-gray-300 px-2 py-1 rounded">
                                        Batch {person.batchNumber || '?'}
                                    </div>
                                </div>
                                
                                {/* Card Body */}
                                <div className="pt-10 p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-white truncate mb-1" title={person.fullName}>
                                        {person.fullName}
                                    </h3>
                                    
                                    <div className="flex items-center text-sm text-gray-400 mb-4">
                                        <span className="mr-2">💼</span>
                                        <span className="truncate" title={person.company || 'Not specified'}>
                                            {person.company || 'Not specified'}
                                        </span>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-800">
                                        {person.linkedinUrl ? (
                                            <a 
                                                href={person.linkedinUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-full block text-center py-2 bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white rounded-lg text-sm font-medium transition-colors border border-[#0077b5]/20"
                                            >
                                                Connect on LinkedIn
                                            </a>
                                        ) : (
                                            <div className="w-full text-center py-2 bg-gray-800 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
                                                No LinkedIn Profile
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
