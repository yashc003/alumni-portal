import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Briefcase, SearchX } from 'lucide-react';

/*
 * ============================================================
 * 🌐 DirectoryPage.jsx
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

    // Filter alumni based on search query
    const filteredAlumni = alumni.filter(person => {
        const query = searchQuery.toLowerCase();
        const matchesName = person.fullName?.toLowerCase().includes(query);
        const matchesCompany = person.company?.toLowerCase().includes(query);
        return matchesName || matchesCompany;
    });

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500 h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                <p>Loading Alumni Network...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto custom-scrollbar">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-200 p-8 shadow-sm">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Alumni Network</h1>
                    <p className="text-gray-500 mb-6">Connect with graduates, find mentors, and explore career paths.</p>
                    
                    {/* Search Bar */}
                    <div className="relative max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
                {filteredAlumni.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                        <div className="text-gray-300 mb-4">
                            <SearchX size={48} />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No alumni found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAlumni.map(person => (
                            <div key={person.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-300 group flex flex-col">
                                {/* Card Header (Banner) */}
                                <div className="h-20 bg-gradient-to-r from-primary-100 to-indigo-100 relative">
                                    <div className="absolute -bottom-8 left-6">
                                        <div className="w-16 h-16 rounded-xl bg-primary-600 flex items-center justify-center text-2xl font-bold text-white shadow-md border-4 border-white transform group-hover:scale-105 transition-transform">
                                            {person.fullName.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    {/* Batch Badge */}
                                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-xs font-semibold text-gray-700 px-2 py-1 rounded shadow-sm">
                                        Batch {person.batchNumber || '?'}
                                    </div>
                                </div>
                                
                                {/* Card Body */}
                                <div className="pt-10 p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 truncate mb-1" title={person.fullName}>
                                        {person.fullName}
                                    </h3>
                                    
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <Briefcase size={16} className="mr-2 text-gray-400" />
                                        <span className="truncate" title={person.company || 'Not specified'}>
                                            {person.company || 'Not specified'}
                                        </span>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        {person.linkedinUrl ? (
                                            <a 
                                                href={person.linkedinUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="w-full block text-center py-2 bg-[#0a66c2]/10 text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white rounded-lg text-sm font-medium transition-colors border border-[#0a66c2]/20"
                                            >
                                                Connect on LinkedIn
                                            </a>
                                        ) : (
                                            <div className="w-full text-center py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
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
