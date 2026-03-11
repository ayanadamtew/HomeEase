'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { servicesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, DollarSign, MapPin, Save, ListPlus, X, Briefcase, User, Info, Calendar } from 'lucide-react';

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
        serviceType: '', headline: '', bio: '', hourlyRate: '', dailyRate: '',
        yearsExperience: '1', serviceArea: '', availability: '', isActive: true,
    });

    const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });

    useEffect(() => {
        if (!authLoading && !user) { router.push('/auth/login'); return; }
        if (!user) return;
        servicesAPI.getMyProfile()
            .then(res => {
                const p = res.data.profile;
                setForm({
                    serviceType: p.serviceType || '', headline: p.headline || '', bio: p.bio || '',
                    hourlyRate: p.hourlyRate?.toString() || '', dailyRate: p.dailyRate?.toString() || '',
                    yearsExperience: p.yearsExperience?.toString() || '1', serviceArea: p.serviceArea || '',
                    availability: typeof p.availability === 'string' ? p.availability : '', isActive: p.isActive ?? true,
                });
            })
            .catch(() => { })
            .finally(() => setLoadingProfile(false));
    }, [user, authLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.serviceType.trim()) { toast.error('Please enter the service you offer'); return; }
        try {
            setSubmitting(true);
            await servicesAPI.createOrUpdateProfile({
                serviceType: form.serviceType.trim(), headline: form.headline.trim(), bio: form.bio.trim(),
                hourlyRate: parseFloat(form.hourlyRate), dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : undefined,
                yearsExperience: parseInt(form.yearsExperience) || 0, serviceArea: form.serviceArea.trim(),
                availability: form.availability.trim(), isActive: form.isActive,
            });
            toast.success('Profile saved! You are now live.');
            router.push('/dashboard');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save profile'); }
        finally { setSubmitting(false); }
    };

    const pickSuggestion = (s) => { setForm({ ...form, serviceType: s }); setShowSuggestions(false); };
    const filteredSuggestions = form.serviceType ? SERVICE_SUGGESTIONS.filter(s => s.toLowerCase().includes(form.serviceType.toLowerCase())) : SERVICE_SUGGESTIONS;

    if (authLoading || loadingProfile) return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin text-teal-500 mr-3" /> <span className="font-semibold text-lg">Loading profile...</span></div>;

    return (
        <div className="min-h-screen pb-24 bg-gray-50">
            {/* Header */}
            <div className="bg-teal-600 h-64 w-full absolute top-0 left-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500 to-teal-800" />

            <div className="max-w-3xl mx-auto px-5 pt-12">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-teal-100 hover:text-white font-medium transition-colors mb-8 shadow-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <div className="mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-lg text-sm font-semibold backdrop-blur-md border border-white/10 mb-4"><ListPlus className="w-4 h-4" /> Provider Tools</span>
                    <h1 className="text-3xl sm:text-4xl font-headings font-bold text-white tracking-tight leading-tight">Service Profile</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Active Toggle */}
                    <div className="card p-6 border-none shadow-sm flex items-center justify-between bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative">
                            <h3 className="font-bold text-gray-900 text-lg">Available for Bookings</h3>
                            <p className="text-gray-500 text-sm font-medium mt-1">Toggle off to pause new incoming requests</p>
                        </div>
                        <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })} className={`relative w-14 h-8 rounded-full transition-colors border-2 shadow-inner shrink-0 ${form.isActive ? 'bg-emerald-500 border-emerald-600' : 'bg-gray-200 border-gray-300'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-sm flex items-center justify-center ${form.isActive ? 'translate-x-[24px]' : 'translate-x-0'}`}>
                                {form.isActive && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            </div>
                        </button>
                    </div>

                    {/* What service do you offer? */}
                    <SectionBox icon={<Briefcase className="w-5 h-5" />} title="Primary Service">
                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Service Type *</label>
                            <input
                                value={form.serviceType}
                                onChange={(e) => { setForm({ ...form, serviceType: e.target.value }); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                required placeholder="e.g. House Cleaning, Plumbing..."
                                className="input shadow-sm !pr-10" autoComplete="off"
                            />
                            {form.serviceType && (
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); setForm({ ...form, serviceType: '' }); }} className="absolute right-3 top-[34px] p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto py-2">
                                    {filteredSuggestions.slice(0, 10).map(s => (
                                        <button type="button" key={s} onMouseDown={(e) => { e.preventDefault(); pickSuggestion(s); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {!form.serviceType && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {['House Cleaning', 'Cooking', 'Childcare', 'Plumbing', 'Electrical Work'].map(s => (
                                    <button type="button" key={s} onClick={() => setForm({ ...form, serviceType: s })} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-white hover:border-teal-300 hover:text-teal-600 transition-colors shadow-sm">{s}</button>
                                ))}
                            </div>
                        )}
                    </SectionBox>

                    {/* About You */}
                    <SectionBox icon={<User className="w-5 h-5" />} title="About You">
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Professional Headline *</label>
                                <input value={form.headline} onChange={update('headline')} required placeholder={`e.g. Experienced ${form.serviceType || 'provider'} with 5+ years`} className="input shadow-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Bio</label>
                                <textarea value={form.bio} onChange={update('bio')} rows={4} placeholder="Describe your experience, skills, and what clients can expect..." className="input shadow-sm resize-none" />
                            </div>
                        </div>
                    </SectionBox>

                    {/* Rates & Experience */}
                    <SectionBox icon={<DollarSign className="w-5 h-5" />} title="Rates & Experience">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Hourly Rate *</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">ETB</div>
                                    <input type="number" value={form.hourlyRate} onChange={update('hourlyRate')} required min="1" placeholder="250" className="input shadow-sm !pl-14" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Daily Rate</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">ETB</div>
                                    <input type="number" value={form.dailyRate} onChange={update('dailyRate')} min="1" placeholder="Optional" className="input shadow-sm !pl-14" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Years Exp.</label>
                                <input type="number" value={form.yearsExperience} onChange={update('yearsExperience')} min="0" className="input shadow-sm" />
                            </div>
                        </div>
                    </SectionBox>

                    {/* Location & Availability */}
                    <SectionBox icon={<MapPin className="w-5 h-5" />} title="Location & Timing">
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Service Area *</label>
                                <input value={form.serviceArea} onChange={update('serviceArea')} required placeholder="e.g. Bole, Addis Ababa" className="input shadow-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Availability Notes</label>
                                <input value={form.availability} onChange={update('availability')} placeholder="e.g. Mon–Fri 9am–6pm, Weekends on request" className="input shadow-sm" />
                            </div>
                        </div>
                    </SectionBox>

                    <div className="pt-6">
                        <button type="submit" disabled={submitting || !form.serviceType.trim()} className="btn-primary w-full !py-4 text-base shadow-teal-600/30 bg-teal-600 hover:bg-teal-700">
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><Save className="w-5 h-5" /> Save Profile & Go Live</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SectionBox({ title, icon, children }) {
    return (
        <div className="card p-8 border-none shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">{icon}</div>
                {title}
            </h3>
            {children}
        </div>
    );
}
