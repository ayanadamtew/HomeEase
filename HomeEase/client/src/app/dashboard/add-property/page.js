'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';

export default function AddPropertyPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', pricePerMonth: '', location: '', city: '', state: '', bedrooms: '1', bathrooms: '1', area: '', amenities: [] });
    const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });
    const toggleAmenity = (a) => setForm({ ...form, amenities: form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a] });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try { setSubmitting(true); await propertiesAPI.create({ ...form, pricePerMonth: parseFloat(form.pricePerMonth), bedrooms: parseInt(form.bedrooms), bathrooms: parseInt(form.bathrooms), area: form.area ? parseInt(form.area) : undefined }); toast.success('Property listed!'); router.push('/dashboard'); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 text-indigo-500 animate-spin" /></div>;
    if (!user || (user.role !== 'LANDLORD' && user.role !== 'ADMIN')) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><p className="text-2xl mb-2">🔒</p><h2 className="text-xl font-bold text-slate-900">Access Denied</h2><p className="text-slate-400 text-sm mt-1">Only landlords can list properties</p></div></div>;

    const amenities = ['WiFi', 'Parking', 'Pool', 'Gym', 'Laundry', 'AC', 'Balcony', 'Elevator', 'Security', 'Pet-Friendly', 'Dishwasher', 'Furnished'];

    return (
        <div className="min-h-screen py-8" style={{ background: '#F8FAFC' }}>
            <div className="max-w-2xl mx-auto px-5">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors mb-6"><ArrowLeft className="w-4 h-4" /> Back</button>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">List a New Property</h1>

                <form onSubmit={handleSubmit} className="card p-7 sm:p-9 !rounded-3xl space-y-5">
                    <Field label="Title" value={form.title} onChange={update('title')} placeholder="e.g. Cozy Downtown Apartment" required />
                    <div><label className="text-sm font-medium text-slate-700 block mb-1.5">Description</label><textarea value={form.description} onChange={update('description')} rows={4} required placeholder="Describe your property..." className="input resize-none" /></div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Price/Month (ETB)" type="number" value={form.pricePerMonth} onChange={update('pricePerMonth')} placeholder="15000" required />
                        <Field label="Bedrooms" type="number" value={form.bedrooms} onChange={update('bedrooms')} min="0" required />
                        <Field label="Bathrooms" type="number" value={form.bathrooms} onChange={update('bathrooms')} min="0" required />
                    </div>

                    <Field label="Street Address" value={form.location} onChange={update('location')} placeholder="Bole Road, DB Building" required />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="City" value={form.city} onChange={update('city')} placeholder="Addis Ababa" required />
                        <Field label="State / Region" value={form.state} onChange={update('state')} placeholder="Addis Ababa" required />
                        <Field label="Area (sqft)" type="number" value={form.area} onChange={update('area')} placeholder="Optional" />
                    </div>

                    <div><label className="text-sm font-medium text-slate-700 block mb-2">Amenities</label>
                        <div className="flex flex-wrap gap-2">
                            {amenities.map(a => (
                                <button type="button" key={a} onClick={() => toggleAmenity(a)} className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all ${form.amenities.includes(a) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>{a}</button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={submitting} className="btn-primary w-full !rounded-xl !py-3.5">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}{submitting ? 'Listing...' : 'List Property'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Field({ label, ...props }) {
    return <div><label className="text-sm font-medium text-slate-700 block mb-1.5">{label}</label><input {...props} className="input" /></div>;
}
