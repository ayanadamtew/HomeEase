'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { servicesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, DollarSign, MapPin, Save, Plus, X } from 'lucide-react';

// Common service suggestions to help users get started
const SERVICE_SUGGESTIONS = [
    'House Cleaning', 'Deep Cleaning', 'Office Cleaning', 'Window Cleaning',
    'Cooking & Meal Prep', 'Personal Chef', 'Catering',
    'Childcare & Babysitting', 'Nanny', 'Tutoring',
    'Plumbing', 'Electrical Work', 'Painting & Decorating', 'Carpentry', 'Gardening & Landscaping',
    'Moving & Packing', 'Furniture Assembly', 'Handyman Services',
    'Laundry & Ironing', 'Grocery Shopping', 'Errand Running',
    'Pet Sitting', 'Dog Walking',
    'Personal Training', 'Massage Therapy', 'Hair & Beauty',
    'Security Guard', 'Driving / Chauffeur',
];

export default function ProviderProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [form, setForm] = useState({
        serviceType: '',
        headline: '',
        bio: '',
        hourlyRate: '',
        dailyRate: '',
        yearsExperience: '1',
        serviceArea: '',
        availability: '',
        isActive: true,
    });

    const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });

    useEffect(() => {
        if (!authLoading && !user) { router.push('/auth/login'); return; }
        if (!user) return;

        servicesAPI.getMyProfile()
            .then(res => {
                const p = res.data.profile;
                setForm({
                    serviceType: p.serviceType || '',
                    headline: p.headline || '',
                    bio: p.bio || '',
                    hourlyRate: p.hourlyRate?.toString() || '',
                    dailyRate: p.dailyRate?.toString() || '',
                    yearsExperience: p.yearsExperience?.toString() || '1',
                    serviceArea: p.serviceArea || '',
                    availability: typeof p.availability === 'string' ? p.availability : '',
                    isActive: p.isActive ?? true,
                });
            })
            .catch(() => { /* no profile yet, start blank */ })
            .finally(() => setLoadingProfile(false));
    }, [user, authLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.serviceType.trim()) { toast.error('Please enter the service you offer'); return; }
        try {
            setSubmitting(true);
            await servicesAPI.createOrUpdateProfile({
                serviceType: form.serviceType.trim(),
                headline: form.headline.trim(),
                bio: form.bio.trim(),
                hourlyRate: parseFloat(form.hourlyRate),
                dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : undefined,
                yearsExperience: parseInt(form.yearsExperience) || 0,
                serviceArea: form.serviceArea.trim(),
                availability: form.availability.trim(),
                isActive: form.isActive,
            });
            toast.success('Profile saved! You are now listed as a provider.');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setSubmitting(false);
        }
    };

    const pickSuggestion = (s) => {
        setForm({ ...form, serviceType: s });
        setShowSuggestions(false);
    };

    const filteredSuggestions = form.serviceType
        ? SERVICE_SUGGESTIONS.filter(s => s.toLowerCase().includes(form.serviceType.toLowerCase()))
        : SERVICE_SUGGESTIONS;

    if (authLoading || loadingProfile) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 text-indigo-500 animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen py-8" style={{ background: '#F8FAFC' }}>
            <div className="max-w-2xl mx-auto px-5">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service Provider Profile</h1>
                    <p className="text-slate-500 text-sm mt-1">List the service you offer so clients can find and book you</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ── What service do you offer? ── */}
                    <div className="card p-6 !rounded-3xl">
                        <h3 className="font-semibold text-slate-900 mb-1">What service do you offer? *</h3>
                        <p className="text-slate-400 text-sm mb-4">Type anything — be as specific as you like</p>

                        <div className="relative">
                            <input
                                value={form.serviceType}
                                onChange={(e) => { setForm({ ...form, serviceType: e.target.value }); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                required
                                placeholder="e.g. House Cleaning, Personal Chef, Plumbing Repairs..."
                                className="input !pr-10"
                            />
                            {form.serviceType && (
                                <button type="button" onClick={() => setForm({ ...form, serviceType: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                    <X className="w-4 h-4" />
                                </button>
                            )}

                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-lg z-10 max-h-52 overflow-y-auto">
                                    {filteredSuggestions.slice(0, 10).map(s => (
                                        <button type="button" key={s} onMouseDown={() => pickSuggestion(s)}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Popular suggestions (shown only if field is empty) */}
                        {!form.serviceType && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Popular services</p>
                                <div className="flex flex-wrap gap-2">
                                    {['House Cleaning', 'Cooking', 'Childcare', 'Plumbing', 'Electrical Work', 'Gardening', 'Pet Sitting', 'Tutoring'].map(s => (
                                        <button type="button" key={s} onClick={() => setForm({ ...form, serviceType: s })}
                                            className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── About You ── */}
                    <div className="card p-6 !rounded-3xl space-y-4">
                        <h3 className="font-semibold text-slate-900">About You</h3>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Professional Headline *</label>
                            <input value={form.headline} onChange={update('headline')} required
                                placeholder={`e.g. Experienced ${form.serviceType || 'service provider'} with 5+ years`}
                                className="input" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Bio</label>
                            <textarea value={form.bio} onChange={update('bio')} rows={4}
                                placeholder="Describe your experience, skills, and what clients can expect..."
                                className="input resize-none" />
                        </div>
                    </div>

                    {/* ── Rates & Experience ── */}
                    <div className="card p-6 !rounded-3xl">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-indigo-500" /> Rates & Experience
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1.5">Hourly Rate (ETB) *</label>
                                <input type="number" value={form.hourlyRate} onChange={update('hourlyRate')} required min="1" placeholder="25" className="input" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1.5">Daily Rate (ETB)</label>
                                <input type="number" value={form.dailyRate} onChange={update('dailyRate')} min="1" placeholder="Optional" className="input" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1.5">Years of Experience</label>
                                <input type="number" value={form.yearsExperience} onChange={update('yearsExperience')} min="0" className="input" />
                            </div>
                        </div>
                    </div>

                    {/* ── Location & Availability ── */}
                    <div className="card p-6 !rounded-3xl space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-500" /> Location & Availability
                        </h3>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Service Area *</label>
                            <input value={form.serviceArea} onChange={update('serviceArea')} required
                                placeholder="e.g. Bole, Addis Ababa — or — Kazanchis" className="input" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Availability</label>
                            <input value={form.availability} onChange={update('availability')}
                                placeholder="e.g. Mon–Fri 9am–6pm, Weekends on request" className="input" />
                        </div>
                    </div>

                    {/* ── Active toggle ── */}
                    <div className="card p-5 !rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-900 text-sm">Available for Bookings</p>
                            <p className="text-slate-400 text-xs mt-0.5">Toggle off to pause new booking requests</p>
                        </div>
                        <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <button type="submit" disabled={submitting || !form.serviceType.trim() || !form.headline.trim() || !form.hourlyRate || !form.serviceArea.trim()}
                        className="btn-primary w-full !rounded-2xl !py-4">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {submitting ? 'Saving...' : 'Save Profile & Go Live'}
                    </button>
                </form>
            </div>
        </div>
    );
}
