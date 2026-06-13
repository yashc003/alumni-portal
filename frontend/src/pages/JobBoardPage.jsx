import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Building2, MapPin, GraduationCap, Star, User, Bot, Inbox, X } from 'lucide-react';

/*
 * ============================================================
 * 💼 JobBoardPage.jsx
 * ============================================================
 */

export function JobBoardPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    
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
            fetchJobs();
        } catch (err) {
            setError(err.response?.data || "Failed to post job.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const canPost = user?.role === 'ROLE_ALUMNI' || user?.role === 'ROLE_ADMIN';

    const filteredJobs = jobs.filter(job => {
        if (filter === 'All') return true;
        if (filter === 'Alumni') return job.source === 'Alumni';
        if (filter === 'External') return job.source !== 'Alumni';
        return true;
    });

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500 h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                <p>Loading Job Board...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto custom-scrollbar relative">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-200 p-8 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Board</h1>
                        <p className="text-gray-500">Discover career opportunities shared by our alumni network.</p>
                    </div>
                    {canPost && (
                        <Button onClick={() => setIsPosting(true)}>
                            + Post a Job
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Area */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="max-w-5xl mx-auto flex space-x-2">
                    <button 
                        onClick={() => setFilter('All')} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'All' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All Jobs
                    </button>
                    <button 
                        onClick={() => setFilter('Alumni')} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'Alumni' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Alumni Posts
                    </button>
                    <button 
                        onClick={() => setFilter('External')} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'External' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        External Jobs
                    </button>
                </div>
            </div>

            {/* Jobs List */}
            <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
                {filteredJobs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                        <div className="text-gray-300 mb-4">
                            <Inbox size={48} />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                        <p className="text-gray-500">Check back later for new opportunities.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredJobs.map(job => (
                            <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary-300 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center space-x-3 mb-1">
                                            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                                            
                                            {/* Source Badge */}
                                            {job.source === 'Alumni' ? (
                                                <span className="flex items-center bg-primary-50 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-primary-100">
                                                    <User size={12} className="mr-1" /> Alumni Post
                                                </span>
                                            ) : (
                                                <span className="flex items-center bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-indigo-100">
                                                    <Bot size={12} className="mr-1" /> {job.source}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center text-sm text-gray-500 space-x-4 mt-2">
                                            <span className="flex items-center"><Building2 size={16} className="mr-1.5 text-gray-400" /> {job.company}</span>
                                            <span className="flex items-center"><MapPin size={16} className="mr-1.5 text-gray-400" /> {job.location}</span>
                                            {(job.minExperience != null || job.maxExperience != null) && (
                                                <span className="flex items-center text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100 font-medium">
                                                    <GraduationCap size={14} className="mr-1.5" /> {job.minExperience}{job.maxExperience != null ? `-${job.maxExperience}` : '+'} Years Exp
                                                </span>
                                            )}
                                            {job.isReferralAvailable && (
                                                <span className="flex items-center text-yellow-700 font-medium bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                                                    <Star size={14} className="mr-1.5 text-yellow-500" /> Referral Available
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        {job.relevanceScore != null && (
                                            <div className="mb-2">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                    job.relevanceScore >= 90 ? 'bg-green-50 text-green-700 border border-green-200' :
                                                    job.relevanceScore >= 70 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                    'bg-gray-100 text-gray-600 border border-gray-200'
                                                }`}>
                                                    Score: {job.relevanceScore}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-sm font-medium text-gray-700">
                                            {job.source === 'Alumni' ? `Posted by ${job.postedByFullName}` : 'Automated Import'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{new Date(job.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                
                                <div className="text-gray-600 mb-6 whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    {job.description}
                                </div>
                                
                                <div className="flex justify-end">
                                    {job.applyLink ? (
                                        <a 
                                            href={job.applyLink.startsWith('http') ? job.applyLink : `mailto:${job.applyLink}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Post a New Job</h2>
                            <button onClick={() => setIsPosting(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded">{error}</div>}
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                        <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                        <input type="text" name="company" required value={formData.company} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none shadow-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input type="text" name="location" required value={formData.location} onChange={handleChange} placeholder="e.g. Remote, New York..." className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Apply Link or Email</label>
                                        <input type="text" name="applyLink" required value={formData.applyLink} onChange={handleChange} placeholder="https://... or jobs@..." className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none shadow-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                                    <textarea name="description" required rows="5" value={formData.description} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none shadow-sm custom-scrollbar"></textarea>
                                </div>

                                <div className="pt-4 flex justify-end space-x-3">
                                    <button type="button" onClick={() => setIsPosting(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
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
