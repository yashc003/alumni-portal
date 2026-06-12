import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

/*
 * ============================================================
 * 💼 JobBoardPage.jsx
 * ============================================================
 * Displays a list of job postings. Alumni and Admins can post.
 * Students can only view and apply.
 * ============================================================
 */

export function JobBoardPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state for posting a job
    const [isPosting, setIsPosting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        description: '',
        applyLink: ''
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchJobs = () => {
        setLoading(true);
        api.get('/api/jobs')
            .then(res => {
                setJobs(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load jobs", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');
        
        try {
            await api.post('/api/jobs', formData);
            setIsPosting(false);
            setFormData({ title: '', company: '', location: '', description: '', applyLink: '' });
            fetchJobs(); // Refresh the list
        } catch (err) {
            setError(err.response?.data || "Failed to post job.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const canPost = user?.role === 'ROLE_ALUMNI' || user?.role === 'ROLE_ADMIN';

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-dark-bg text-gray-500 h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                <p>Loading Job Board...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-dark-bg overflow-y-auto custom-scrollbar relative">
            {/* Header Area */}
            <div className="bg-dark-surface border-b border-gray-800 p-8 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Job Board</h1>
                        <p className="text-gray-400">Discover career opportunities shared by our alumni network.</p>
                    </div>
                    {canPost && (
                        <Button onClick={() => setIsPosting(true)}>
                            + Post a Job
                        </Button>
                    )}
                </div>
            </div>

            {/* Jobs List */}
            <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
                {jobs.length === 0 ? (
                    <div className="text-center py-20 bg-dark-surface rounded-xl border border-gray-800">
                        <div className="text-4xl mb-4">📭</div>
                        <h3 className="text-xl font-medium text-white mb-2">No jobs posted yet</h3>
                        <p className="text-gray-400">Check back later for new opportunities.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {jobs.map(job => (
                            <div key={job.id} className="bg-dark-surface border border-gray-800 rounded-xl p-6 shadow-md hover:border-primary-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1">{job.title}</h2>
                                        <div className="flex items-center text-sm text-gray-400 space-x-4">
                                            <span className="flex items-center">🏢 {job.company}</span>
                                            <span className="flex items-center">📍 {job.location}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-300">Posted by {job.postedByFullName}</div>
                                        <div className="text-xs text-gray-500 mt-1">{new Date(job.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                
                                <div className="text-gray-300 mb-6 whitespace-pre-wrap text-sm leading-relaxed bg-gray-900/50 p-4 rounded-lg">
                                    {job.description}
                                </div>
                                
                                <div className="flex justify-end">
                                    {job.applyLink ? (
                                        <a 
                                            href={job.applyLink.startsWith('http') ? job.applyLink : `mailto:${job.applyLink}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary-500/20"
                                        >
                                            Apply Now
                                        </a>
                                    ) : (
                                        <span className="text-sm text-gray-500 italic">No application link provided</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Post Job Modal */}
            {isPosting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-dark-card border border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-gray-900/50">
                            <h2 className="text-lg font-bold text-white">Post a New Job</h2>
                            <button onClick={() => setIsPosting(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <div className="text-red-400 text-sm p-3 bg-red-500/10 rounded">{error}</div>}
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Job Title</label>
                                        <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-dark-bg border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                                        <input type="text" name="company" required value={formData.company} onChange={handleChange} className="w-full bg-dark-bg border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                                        <input type="text" name="location" required value={formData.location} onChange={handleChange} placeholder="e.g. Remote, New York..." className="w-full bg-dark-bg border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Apply Link or Email</label>
                                        <input type="text" name="applyLink" required value={formData.applyLink} onChange={handleChange} placeholder="https://... or jobs@..." className="w-full bg-dark-bg border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Job Description</label>
                                    <textarea name="description" required rows="5" value={formData.description} onChange={handleChange} className="w-full bg-dark-bg border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none custom-scrollbar"></textarea>
                                </div>

                                <div className="pt-4 flex justify-end space-x-3">
                                    <button type="button" onClick={() => setIsPosting(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                    <Button type="submit" disabled={submitLoading}>{submitLoading ? 'Posting...' : 'Post Job'}</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
