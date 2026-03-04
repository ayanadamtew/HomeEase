'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { propertiesAPI, messagesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Bed, Bath, Maximize2, Star, ArrowLeft, MessageSquare, ChevronLeft, ChevronRight, Loader2, Mail, Wifi, Car, Dumbbell, TreeDeciduous, Phone } from 'lucide-react';

const amenityIcons = { WiFi: <Wifi className="w-4 h-4" />, Parking: <Car className="w-4 h-4" />, Gym: <Dumbbell className="w-4 h-4" />, Pool: <TreeDeciduous className="w-4 h-4" /> };

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [showInquiry, setShowInquiry] = useState(false);
    const [inquiryMsg, setInquiryMsg] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        propertiesAPI.getById(params.id)
            .then(res => setProperty(res.data.property))
            .catch(() => { toast.error('Not found'); router.push('/properties'); })
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleInquiry = async (e) => {
        e.preventDefault();
        if (!user) { router.push('/auth/login'); return; }
        try {
            setSending(true);
            const convRes = await messagesAPI.startConversation({ recipientId: property.landlord.id, propertyId: property.id });
            await messagesAPI.sendMessage(convRes.data.conversation.id, inquiryMsg || `Hi, I'm interested in "${property.title}"`);
            toast.success('Message sent!');
            setShowInquiry(false); setInquiryMsg('');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setSending(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 text-indigo-500 animate-spin" /></div>;
    if (!property) return null;

    const images = property.images || [];

    return (
        <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
            <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 pb-16">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Gallery */}
                        <div className="card overflow-hidden !rounded-3xl">
                            <div className="relative aspect-[16/10] bg-slate-100">
                                {images.length > 0 ? (
                                    <>
                                        <img src={images[activeImg]?.imageUrl} alt={property.title} className="w-full h-full object-cover" />
                                        {images.length > 1 && (
                                            <>
                                                <button onClick={() => setActiveImg(i => i === 0 ? images.length - 1 : i - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-slate-700 hover:bg-white transition"><ChevronLeft className="w-5 h-5" /></button>
                                                <button onClick={() => setActiveImg(i => i === images.length - 1 ? 0 : i + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-slate-700 hover:bg-white transition"><ChevronRight className="w-5 h-5" /></button>
                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                    {images.map((_, idx) => <button key={idx} onClick={() => setActiveImg(idx)} className={`h-1.5 rounded-full transition-all ${idx === activeImg ? 'bg-white w-6' : 'bg-white/50 w-1.5'}`} />)}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-50">
                                        <div className="text-center"><div className="text-6xl mb-2">🏠</div><p className="text-slate-400 text-sm">No images</p></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="card p-7 !rounded-3xl">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{property.title}</h1>
                                    <div className="flex items-center gap-1.5 mt-2 text-slate-500"><MapPin className="w-4 h-4 text-indigo-400" />{property.location}, {property.city}, {property.state}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-indigo-600">${Number(property.pricePerMonth).toLocaleString()}</div>
                                    <div className="text-slate-400 text-sm">per month</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                                <Stat icon={<Bed className="w-5 h-5 text-indigo-400" />} label="Bedrooms" value={property.bedrooms} />
                                <Stat icon={<Bath className="w-5 h-5 text-indigo-400" />} label="Bathrooms" value={property.bathrooms} />
                                {property.area && <Stat icon={<Maximize2 className="w-5 h-5 text-indigo-400" />} label="Area" value={`${property.area} sqft`} />}
                                {property._count?.reviews > 0 && <Stat icon={<Star className="w-5 h-5 text-amber-400" />} label="Rating" value={`${property.avgRating?.toFixed(1)} (${property._count.reviews})`} />}
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                                <p className="text-slate-500 leading-relaxed">{property.description}</p>
                            </div>

                            {property.amenities?.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <h3 className="font-semibold text-slate-900 mb-3">Amenities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {property.amenities.map(a => (
                                            <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600">
                                                {amenityIcons[a] || <span>✨</span>}{a}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {property.reviews?.length > 0 && (
                            <div className="card p-7 !rounded-3xl">
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-400" /> Reviews ({property._count?.reviews})</h3>
                                <div className="space-y-4">
                                    {property.reviews.map(r => (
                                        <div key={r.id} className="p-4 bg-slate-50 rounded-2xl">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">{r.author?.name?.[0]}</div>
                                                <div><p className="text-slate-900 text-sm font-medium">{r.author?.name}</p><div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />)}</div></div>
                                                <span className="ml-auto text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-slate-500 text-sm">{r.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <div className="card p-6 !rounded-3xl sticky top-24">
                            <h3 className="font-semibold text-slate-900 mb-4">Listed by</h3>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">{property.landlord?.name?.[0]}</div>
                                <div><p className="text-slate-900 font-medium">{property.landlord?.name}</p><p className="text-slate-400 text-sm">Property Owner</p></div>
                            </div>
                            {property.landlord?.phone && <a href={`tel:${property.landlord.phone}`} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm mb-3 transition-colors"><Phone className="w-4 h-4" /> {property.landlord.phone}</a>}
                            <button onClick={() => setShowInquiry(!showInquiry)} className="btn-primary w-full !rounded-2xl !py-3.5"><MessageSquare className="w-5 h-5" /> Contact Landlord</button>

                            {showInquiry && (
                                <form onSubmit={handleInquiry} className="mt-4 space-y-3 animate-slide-down pt-4 border-t border-slate-100">
                                    <textarea value={inquiryMsg} onChange={(e) => setInquiryMsg(e.target.value)} placeholder={`Hi, I'm interested in "${property.title}"...`} rows={4} className="input !rounded-xl resize-none" />
                                    <button type="submit" disabled={sending} className="btn-primary w-full !rounded-xl !py-3 !text-sm">
                                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}{sending ? 'Sending...' : 'Send Inquiry'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stat({ icon, label, value }) {
    return <div className="p-3 bg-slate-50 rounded-2xl text-center"><div className="flex justify-center mb-1">{icon}</div><div className="font-semibold text-slate-900">{value}</div><div className="text-slate-400 text-xs">{label}</div></div>;
}
