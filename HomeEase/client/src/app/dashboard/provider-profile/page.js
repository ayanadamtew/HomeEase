'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { servicesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Briefcase, DollarSign, MapPin, Clock, CheckCircle, Save } from 'lucide-react';

export default function ProviderProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [form, setForm] = useState({
        headline: '',
        bio: '',
        categoryId: '',
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

        // Load categories and existing profile
        Promise.all([
            servicesAPI.getCategories(),
            servicesAPI.getMyProfile().catch(() => null),
        ]).then(([catRes, profileRes]) => {
            setCategories(catRes.data.categories);
            if (profileRes?.data?.profile) {
                const p = profileRes.data.profile;
                setForm({
                    headline: p.headline || '',
                    bio: p.bio || '',
                    categoryId: p.categoryId || '',
                    hourlyRate: p.hourlyRate?.toString() || '',
                    dailyRate: p.dailyRate?.toString() || '',
                    yearsExperience: p.yearsExperience?.toString() || '1',
                    serviceArea: p.serviceArea || '',
                    availability: p.availability || '',
                    isActive: p.isActive ?? true,
                });
            }
        }).catch(console.error).finally(() => setLoadingProfile(false));
    }, [user, authLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await servicesAPI.createOrUpdateProfile({
                ...form,
                hourlyRate: parseFloat(form.hourlyRate),
                dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : undefined,
                yearsExperience: parseInt(form.yearsExperience),
            });
            toast.success('Profile saved! You are now listed as a provider.');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setSubmitting(false);
        }
    };

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
                    <p className="text-slate-500 text-sm mt-1">Set up your profile so clients can find and book you</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Category */}
                    <div className="card p-6 !rounded-3xl">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-indigo-500" /> Service Category
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {categories.map(c => (
                                <button type="button" key={c.id} onClick={() => setForm({ ...form, categoryId: c.id })}
                                    className={`p-4 rounded-2xl border text-left transition-all ${form.categoryId === c.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                    <div className="text-2xl mb-1">{c.icon}</div>
                                    <div className="font-medium text-sm">{c.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="card p-6 !rounded-3xl space-y-4">
                        <h3 className="font-semibold text-slate-900 mb-1">About You</h3>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Professional Headline</label>
                            <input value={form.headline} onChange={update('headline')} required placeholder="e.g. Professional House Cleaner with 5+ years experience" className="input" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Bio</label>
                            <textarea value={form.bio} onChange={update('bio')} rows={4} placeholder="Describe your experience, skills, and what clients can expect when they book you..." className="input resize-none" />
                        </div>
                    </div>

                    {/* Rates & Experience */}
                    <div className="card p-6 !rounded-3xl">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-indigo-500" /> Rates & Experience
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1.5">Hourly Rate ($) *</label>
                                <input type="number" value={form.hourlyRate} onChange={update('hourlyRate')} required min="1" placeholder="e.g. 25" className="input" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1.5">Daily Rate ($)</label>
                                <input type="number" value={form.dailyRate} onChange={update('dailyRate')} min="1" placeholder="Optional" className="input" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1.5">Years Experience</label>
                                <input type="number" value={form.yearsExperience} onChange={update('yearsExperience')} min="0" className="input" />
                            </div>
                        </div>
                    </div>

                    {/* Location & Availability */}
                    <div className="card p-6 !rounded-3xl space-y-4">
                        <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-500" /> Location & Availability
                        </h3>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Service Area</label>
                            <input value={form.serviceArea} onChange={update('serviceArea')} required placeholder="e.g. Manhattan, NY or Brooklyn & Queens" className="input" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Availability</label>
                            <input value={form.availability} onChange={update('availability')} placeholder="e.g. Mon–Fri 9am–6pm, Weekends available" className="input" />
                        </div>
                    </div>

                    {/* Active Status */}
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

                    <button type="submit" disabled={submitting || !form.categoryId || !form.headline || !form.hourlyRate || !form.serviceArea}
                        className="btn-primary w-full !rounded-2xl !py-4">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {submitting ? 'Saving...' : 'Save Provider Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}
