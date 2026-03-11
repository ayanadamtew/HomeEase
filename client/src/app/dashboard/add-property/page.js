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

    if (authLoading) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-gray-400 text-[11px]"><Loader2 className="w-5 h-5 animate-spin mr-3" /> Loading...</div>;
    if (!user || (user.role !== 'LANDLORD' && user.role !== 'ADMIN')) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><p className="text-4xl mb-4">🔒</p><h2 className="text-2xl font-black text-black uppercase tracking-tighter">Access Denied</h2><p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Only landlords can list properties</p></div></div>;

    const amenities = ['WiFi', 'Parking', 'Pool', 'Gym', 'Laundry', 'AC', 'Balcony', 'Elevator', 'Security', 'Pet-Friendly', 'Dishwasher', 'Furnished'];

    return (
        <div className="min-h-screen py-16 bg-white">
            <div className="max-w-2xl mx-auto px-5">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-black text-[10px] font-black uppercase tracking-widest transition-colors mb-8"><ArrowLeft className="w-4 h-4" /> Back</button>
                <h1 className="text-3xl font-black text-black tracking-tighter uppercase mb-10">List a New Property</h1>

                <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-12 border border-black space-y-8">
                    <Field label="Title" value={form.title} onChange={update('title')} placeholder="e.g. Cozy Downtown Apartment" required />
                    <div><label className="text-[11px] font-black text-black uppercase tracking-widest block mb-3">Description</label><textarea value={form.description} onChange={update('description')} rows={5} required placeholder="Describe your property..." className="input !bg-gray-50 !border-gray-200 focus:!border-black resize-none" /></div>

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

                    <div><label className="text-[11px] font-black text-black uppercase tracking-widest block mb-4">Amenities</label>
                        <div className="flex flex-wrap gap-2">
                            {amenities.map(a => (
                                <button type="button" key={a} onClick={() => toggleAmenity(a)} className={`px-5 py-2 border text-[11px] font-black uppercase tracking-widest transition-all ${form.amenities.includes(a) ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-black hover:border-black'}`}>{a}</button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={submitting} className="btn-primary w-full !py-4 !text-[12px] !uppercase !tracking-[0.2em]">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}{submitting ? 'Listing...' : 'List Property'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Field({ label, ...props }) {
    return <div><label className="text-[11px] font-black text-black uppercase tracking-widest block mb-2">{label}</label><input {...props} className="input !bg-gray-50 !border-gray-200 focus:!border-black" /></div>;
}
