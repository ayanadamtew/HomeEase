'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI, uploadAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Plus, Building2, MapPin, Grid, Info, Upload, X as CloseIcon, Image as ImageIcon } from 'lucide-react';

export default function AddPropertyPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]); // [{ url, file, preview }]
    const [form, setForm] = useState({ title: '', description: '', pricePerMonth: '', location: '', city: '', state: '', bedrooms: '1', bathrooms: '1', area: '', amenities: [] });
    const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });
    const toggleAmenity = (a) => setForm({ ...form, amenities: form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a] });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            url: null
        }));
        setImages([...images, ...newImages]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);

            // 1. Upload images first
            const uploadedUrls = [];
            for (let i = 0; i < images.length; i++) {
                if (images[i].url) {
                    uploadedUrls.push({ url: images[i].url });
                    continue;
                }
                const res = await uploadAPI.upload(images[i].file);
                uploadedUrls.push({ url: res.data.url });
            }

            // 2. Create property
            await propertiesAPI.create({
                ...form,
                pricePerMonth: parseFloat(form.pricePerMonth),
                bedrooms: parseInt(form.bedrooms),
                bathrooms: parseInt(form.bathrooms),
                area: form.area ? parseInt(form.area) : undefined,
                images: uploadedUrls
            });

            toast.success('Property listed successfully!');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to list property');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mr-3" /> <span className="font-semibold text-lg">Verifying access...</span></div>;
    if (!user || (user.role !== 'LANDLORD' && user.role !== 'ADMIN')) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="card p-10 text-center border-none shadow-sm max-w-sm"><div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><div className="text-3xl">🔒</div></div><h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2><p className="text-gray-500 font-medium">Only verified landlords can list properties.</p><button onClick={() => router.back()} className="btn-secondary w-full mt-8">Go Back</button></div></div>;

    const amenities = ['WiFi', 'Parking', 'Pool', 'Gym', 'Laundry', 'AC', 'Balcony', 'Elevator', 'Security', 'Pet-Friendly', 'Dishwasher', 'Furnished'];

    return (
        <div className="min-h-screen pb-24 bg-gray-50">
            {/* Soft background header */}
            <div className="bg-indigo-600 h-64 w-full absolute top-0 left-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500 to-indigo-800" />

            <div className="max-w-3xl mx-auto px-5 pt-12">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-indigo-100 hover:text-white font-medium transition-colors mb-8 shadow-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <div className="mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-lg text-sm font-semibold backdrop-blur-md border border-white/10 mb-4"><Building2 className="w-4 h-4" /> Listing Manager</span>
                    <h1 className="text-3xl sm:text-4xl font-headings font-bold text-white tracking-tight leading-tight">List a New Property</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <SectionBox icon={<Info className="w-5 h-5" />} title="Basic Information">
                        <div className="space-y-5">
                            <Field label="Property Title" value={form.title} onChange={update('title')} placeholder="e.g. Modern Apartment in Downtown" required />
                            <div><label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-2">Description</label><textarea value={form.description} onChange={update('description')} rows={4} required placeholder="Describe what makes your property special..." className="input shadow-sm resize-none" /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Field label="Monthly Rent (ETB)" type="number" value={form.pricePerMonth} onChange={update('pricePerMonth')} placeholder="15000" prefix="ETB" required />
                            </div>
                        </div>
                    </SectionBox>

                    {/* Specifications */}
                    <SectionBox icon={<Grid className="w-5 h-5" />} title="Layout & Specifications">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <Field label="Bedrooms" type="number" value={form.bedrooms} onChange={update('bedrooms')} min="0" required />
                            <Field label="Bathrooms" type="number" value={form.bathrooms} onChange={update('bathrooms')} min="0" required />
                            <Field label="Area Space (sqft)" type="number" value={form.area} onChange={update('area')} placeholder="Optional" />
                        </div>
                    </SectionBox>

                    {/* Location */}
                    <SectionBox icon={<MapPin className="w-5 h-5" />} title="Location">
                        <div className="space-y-5">
                            <Field label="Street Address" value={form.location} onChange={update('location')} placeholder="Format: Bole Road, DB Building" required />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Field label="City" value={form.city} onChange={update('city')} placeholder="Addis Ababa" required />
                                <Field label="State / Region" value={form.state} onChange={update('state')} placeholder="Addis Ababa" required />
                            </div>
                        </div>
                    </SectionBox>

                    {/* Amenities */}
                    <SectionBox icon={<Plus className="w-5 h-5" />} title="Amenities">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-4">Select all that apply</label>
                            <div className="flex flex-wrap gap-2.5">
                                {amenities.map(a => (
                                    <button type="button" key={a} onClick={() => toggleAmenity(a)} className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${form.amenities.includes(a) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-gray-50'}`}>{a}</button>
                                ))}
                            </div>
                        </div>
                    </SectionBox>

                    {/* Image Upload */}
                    <SectionBox icon={<ImageIcon className="w-5 h-5" />} title="Property Images">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
                                        <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 p-1 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-indigo-300 transition-all cursor-pointer group">
                                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 mb-2" />
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-indigo-600">Add Image</span>
                                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium italic">Tip: Upload high-quality photos to attract more tenants. The first image will be the primary photo.</p>
                        </div>
                    </SectionBox>

                    <div className="pt-6">
                        <button type="submit" disabled={submitting} className="btn-primary w-full !py-4 text-base shadow-indigo-600/30">
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><Plus className="w-5 h-5" /> Publish Property Listing</>}
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
                <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 border border-gray-100 flex items-center justify-center">{icon}</div>
                {title}
            </h3>
            {children}
        </div>
    );
}

function Field({ label, prefix, ...props }) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-2">{label}</label>
            <div className="relative">
                {prefix && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">{prefix}</div>}
                <input {...props} className={`input shadow-sm ${prefix ? '!pl-14' : ''}`} />
            </div>
        </div>
    );
}
