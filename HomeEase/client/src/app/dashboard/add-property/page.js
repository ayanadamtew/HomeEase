'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';

export default function AddPropertyPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', pricePerMonth: '', location: '', city: '', state: '',
        bedrooms: '1', bathrooms: '1', area: '', amenities: [],
    });
    const [amenityInput, setAmenityInput] = useState('');

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const addAmenity = () => {
        if (amenityInput.trim() && !form.amenities.includes(amenityInput.trim())) {
            setForm({ ...form, amenities: [...form.amenities, amenityInput.trim()] });
            setAmenityInput('');
        }
    };

    const removeAmenity = (a) => setForm({ ...form, amenities: form.amenities.filter(x => x !== a) });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await propertiesAPI.create({
                ...form,
                pricePerMonth: parseFloat(form.pricePerMonth),
                bedrooms: parseInt(form.bedrooms),
                bathrooms: parseInt(form.bathrooms),
                area: form.area ? parseInt(form.area) : undefined,
            });
            toast.success('Property listed!');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to list property');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
    if (!user || (user.role !== 'LANDLORD' && user.role !== 'ADMIN')) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center px-4">
                <div>
                    <p className="text-2xl mb-2">🔒</p>
                    <h2 className="text-xl font-bold text-white mb-1">Access Denied</h2>
                    <p className="text-gray-400 text-sm">Only landlords can list properties.</p>
                </div>
            </div>
        );
    }

    const quickAmenities = ['WiFi', 'Parking', 'Pool', 'Gym', 'Laundry', 'AC', 'Balcony', 'Elevator', 'Security', 'Pet-Friendly'];

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-2xl mx-auto px-4">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <h1 className="text-2xl font-bold text-white mb-6">List a New Property</h1>

                <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-5">
                    <Field label="Title" value={form.title} onChange={update('title')} placeholder="e.g. Cozy Downtown Apartment" required />
                    <div>
                        <label className="text-sm font-medium text-gray-300 block mb-1.5">Description</label>
                        <textarea value={form.description} onChange={update('description')} rows={4} required placeholder="Describe your property..." className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Price/Month ($)" type="number" value={form.pricePerMonth} onChange={update('pricePerMonth')} placeholder="1500" required />
                        <Field label="Bedrooms" type="number" value={form.bedrooms} onChange={update('bedrooms')} min="0" required />
                        <Field label="Bathrooms" type="number" value={form.bathrooms} onChange={update('bathrooms')} min="0" required />
                    </div>

                    <Field label="Street Address" value={form.location} onChange={update('location')} placeholder="123 Main St" required />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="City" value={form.city} onChange={update('city')} placeholder="New York" required />
                        <Field label="State" value={form.state} onChange={update('state')} placeholder="NY" required />
                        <Field label="Area (sqft)" type="number" value={form.area} onChange={update('area')} placeholder="Optional" />
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="text-sm font-medium text-gray-300 block mb-1.5">Amenities</label>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {quickAmenities.map(a => (
                                <button type="button" key={a} onClick={() => form.amenities.includes(a) ? removeAmenity(a) : setForm({ ...form, amenities: [...form.amenities, a] })}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${form.amenities.includes(a) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-gray-800/50 border-white/5 text-gray-400 hover:text-white'}`}>
                                    {a}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input value={amenityInput} onChange={e => setAmenityInput(e.target.value)} placeholder="Add custom amenity" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())} className="flex-1 px-3 py-2 bg-gray-800 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
                            <button type="button" onClick={addAmenity} className="px-3 py-2 bg-emerald-500/10 text-emerald-400 text-sm rounded-xl hover:bg-emerald-500/20 transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        {submitting ? 'Listing...' : 'List Property'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Field({ label, ...inputProps }) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">{label}</label>
            <input {...inputProps} className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
        </div>
    );
}
