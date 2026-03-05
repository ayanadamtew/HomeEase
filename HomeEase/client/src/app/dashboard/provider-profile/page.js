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
        return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-gray-400 text-[11px]"><Loader2 className="w-5 h-5 animate-spin mr-3" /> Loading profile...</div>;
    }

    return (
        <div className="min-h-screen py-16 bg-white">
            <div className="max-w-2xl mx-auto px-5">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-black text-[10px] font-black uppercase tracking-widest transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="mb-10">
                    <h1 className="text-3xl font-black text-black tracking-tighter uppercase leading-none">Service Profile</h1>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-4">List the service you offer so clients can find and book you</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ── What service do you offer? ── */}
                    <div className="bg-white border border-black p-8">
                        <h3 className="font-black text-black uppercase tracking-widest text-sm mb-2">What service do you offer? *</h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6 leading-relaxed">Type anything — be as specific as you like</p>

                        <div className="relative">
                            <input
                                value={form.serviceType}
                                onChange={(e) => { setForm({ ...form, serviceType: e.target.value }); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                required
                                placeholder="e.g. House Cleaning, Personal Chef, Plumbing Repairs..."
                                className="input !bg-gray-50 !border-gray-200 focus:!border-black !pr-10"
                            />
                            {form.serviceType && (
                                <button type="button" onClick={() => setForm({ ...form, serviceType: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black">
                                    <X className="w-4 h-4" />
                                </button>
                            )}

                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-black shadow-none z-10 max-h-60 overflow-y-auto">
                                    {filteredSuggestions.slice(0, 10).map(s => (
                                        <button type="button" key={s} onMouseDown={() => pickSuggestion(s)}
                                            className="w-full text-left px-5 py-3 text-[11px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all border-b border-gray-100 last:border-0">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Popular suggestions (shown only if field is empty) */}
                        {!form.serviceType && (
                            <div className="mt-8">
                                <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-4">Popular services</p>
                                <div className="flex flex-wrap gap-2">
                                    {['House Cleaning', 'Cooking', 'Childcare', 'Plumbing', 'Electrical Work', 'Gardening', 'Pet Sitting', 'Tutoring'].map(s => (
                                        <button type="button" key={s} onClick={() => setForm({ ...form, serviceType: s })}
                                            className="px-4 py-2 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-black hover:border-black transition-all">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── About You ── */}
                    <div className="bg-white border border-black p-8 space-y-6">
                        <h3 className="font-black text-black uppercase tracking-widest text-sm mb-4">About You</h3>
                        <div>
                            <label className="text-[11px] font-black text-black uppercase tracking-widest block mb-3">Professional Headline *</label>
                            <input value={form.headline} onChange={update('headline')} required
                                placeholder={`e.g. Experienced ${form.serviceType || 'service provider'} with 5+ years`}
                                className="input !bg-gray-50 !border-gray-200 focus:!border-black" />
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-black uppercase tracking-widest block mb-3">Bio</label>
                            <textarea value={form.bio} onChange={update('bio')} rows={5}
                                placeholder="Describe your experience, skills, and what clients can expect..."
                                className="input !bg-gray-50 !border-gray-200 focus:!border-black resize-none" />
                        </div>
                    </div>

                    {/* ── Rates & Experience ── */}
                    <div className="bg-white border border-black p-8">
                        <h3 className="font-black text-black uppercase tracking-widest text-sm mb-8 flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-black" /> Rates & Experience
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[11px] font-black text-black uppercase tracking-widest block mb-3">Hourly Rate *</label>
                                <input type="number" value={form.hourlyRate} onChange={update('hourlyRate')} required min="1" placeholder="25" className="input !bg-gray-50 !border-gray-200 focus:!border-black" />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-black uppercase tracking-widest block mb-3">Daily Rate</label>
                                <input type="number" value={form.dailyRate} onChange={update('dailyRate')} min="1" placeholder="Optional" className="input !bg-gray-50 !border-gray-200 focus:!border-black" />
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-black uppercase tracking-widest block mb-3">Years Exp.</label>
                                <input type="number" value={form.yearsExperience} onChange={update('yearsExperience')} min="0" className="input !bg-gray-50 !border-gray-200 focus:!border-black" />
                            </div>
                        </div>
                    </div>

                    {/* ── Location & Availability ── */}
                    <div className="bg-white border border-black p-8 space-y-6">
                        <h3 className="font-black text-black uppercase tracking-widest text-sm mb-4 flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-black" /> Location & Availability
                        </h3>
                        <div>
                            <label className="text-[11px] font-black text-black uppercase tracking-widest block mb-3">Service Area *</label>
                            <input value={form.serviceArea} onChange={update('serviceArea')} required
                                placeholder="e.g. Bole, Addis Ababa — or — Kazanchis" className="input !bg-gray-50 !border-gray-200 focus:!border-black" />
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-black uppercase tracking-widest block mb-3">Availability</label>
                            <input value={form.availability} onChange={update('availability')}
                                placeholder="e.g. Mon–Fri 9am–6pm, Weekends on request" className="input !bg-gray-50 !border-gray-200 focus:!border-black" />
                        </div>
                    </div>

                    {/* ── Active toggle ── */}
                    <div className="bg-black text-white p-8 flex items-center justify-between border border-black">
                        <div>
                            <p className="font-black uppercase tracking-widest text-[11px]">Available for Bookings</p>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">Toggle off to pause new booking requests</p>
                        </div>
                        <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                            className={`relative w-14 h-7 border border-white transition-colors ${form.isActive ? 'bg-white' : 'bg-black'}`}>
                            <div className={`absolute top-1 w-4 h-4 transition-transform ${form.isActive ? 'bg-black translate-x-8' : 'bg-white translate-x-1'}`} />
                        </button>
                    </div>

                    <button type="submit" disabled={submitting || !form.serviceType.trim() || !form.headline.trim() || !form.hourlyRate || !form.serviceArea.trim()}
                        className="btn-primary w-full !py-4 !text-[12px] !uppercase !tracking-[0.2em]">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {submitting ? 'Saving...' : 'Save Profile & Go Live'}
                    </button>
                </form>
            </div>
        </div>
    );
}
