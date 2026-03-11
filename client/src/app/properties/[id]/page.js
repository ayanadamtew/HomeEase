'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { propertiesAPI, messagesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Bed, Bath, Maximize2, Star, ArrowLeft, MessageSquare, ChevronLeft, ChevronRight, Loader2, Mail, Wifi, Car, Dumbbell, TreeDeciduous, Phone, CheckCircle2, Shield } from 'lucide-react';

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
            .catch(() => { toast.error('Property not found'); router.push('/properties'); })
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleInquiry = async (e) => {
        e.preventDefault();
        if (!user) { router.push('/auth/login'); return; }
        try {
            setSending(true);
            const convRes = await messagesAPI.startConversation({ recipientId: property.landlord.id, propertyId: property.id });
            await messagesAPI.sendMessage(convRes.data.conversation.id, inquiryMsg || `Hi, I'm interested in "${property.title}"`);
            toast.success('Message sent to landlord!');
            setShowInquiry(false); setInquiryMsg('');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to send message'); }
        finally { setSending(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mr-4" /> <span className="font-medium text-lg">Loading property details...</span></div>;
    if (!property) return null;

    const images = property.images || [];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Gallery Full Width Header */}
            <div className="bg-gray-900 w-full relative">
                <div className="max-w-[1600px] mx-auto relative group h-[50vh] sm:h-[65vh]">
                    <button onClick={() => router.back()} className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to listings
                    </button>

                    {images.length > 0 ? (
                        <>
                            <img src={images[activeImg]?.imageUrl} alt={property.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent pointer-events-none" />
                            {images.length > 1 && (
                                <>
                                    <button onClick={() => setActiveImg(i => i === 0 ? images.length - 1 : i - 1)} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full transition opacity-0 group-hover:opacity-100"><ChevronLeft className="w-6 h-6" /></button>
                                    <button onClick={() => setActiveImg(i => i === images.length - 1 ? 0 : i + 1)} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full transition opacity-0 group-hover:opacity-100"><ChevronRight className="w-6 h-6" /></button>
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                        {images.map((_, idx) => <button key={idx} onClick={() => setActiveImg(idx)} className={`h-2 rounded-full transition-all ${idx === activeImg ? 'bg-white w-8 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/50 w-2 hover:bg-white/80'}`} />)}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-500">
                            <div className="text-6xl mb-4">🏠</div>
                            <p className="font-medium text-lg">No images available</p>
                        </div>
                    )}

                    {/* Quick Stats Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-5 sm:px-8 translate-y-1/2 sm:translate-y-1/3">
                        <div className="card p-6 flex flex-wrap items-center justify-between gap-6 shadow-xl shadow-gray-200/50">
                            <div>
                                <h1 className="text-2xl sm:text-4xl font-headings font-bold text-gray-900 tracking-tight leading-tight">{property.title}</h1>
                                <div className="flex items-center gap-2 mt-2 text-gray-500 font-medium"><MapPin className="w-4 h-4 text-indigo-500" />{property.location}, {property.city}, {property.state}</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-3xl sm:text-4xl font-headings font-bold text-indigo-600 tracking-tight">ETB {Number(property.pricePerMonth).toLocaleString()}</div>
                                <div className="text-gray-400 text-sm font-medium mt-1">per month</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-32 sm:pt-28">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Features Overview */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Stat icon={<Bed className="w-6 h-6 text-indigo-500" />} label="Bedrooms" value={property.bedrooms} />
                            <Stat icon={<Bath className="w-6 h-6 text-teal-500" />} label="Bathrooms" value={property.bathrooms} />
                            {property.area && <Stat icon={<Maximize2 className="w-6 h-6 text-emerald-500" />} label="Square Feet" value={property.area} />}
                            {property._count?.reviews > 0 && <Stat icon={<Star className="w-6 h-6 text-amber-500 fill-amber-500" />} label={`${property._count.reviews} Reviews`} value={property.avgRating?.toFixed(1)} />}
                        </div>

                        {/* Description */}
                        <div className="card p-8 sm:p-10 border-none shadow-sm">
                            <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center leading-none">📋</div> Description</h3>
                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{property.description}</p>
                        </div>

                        {/* Amenities */}
                        {property.amenities?.length > 0 && (
                            <div className="card p-8 sm:p-10 border-none shadow-sm">
                                <h3 className="font-bold text-gray-900 text-xl mb-6 flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center leading-none">✨</div> Premium Amenities</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {property.amenities.map(a => (
                                        <div key={a} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all text-gray-700 font-medium">
                                            <div className="text-indigo-500">{amenityIcons[a] || <CheckCircle2 className="w-4 h-4 text-emerald-500" />}</div>
                                            {a}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        {property.reviews?.length > 0 && (
                            <div className="card p-8 sm:p-10 border-none shadow-sm">
                                <h3 className="font-bold text-gray-900 text-xl mb-8 flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center leading-none"><Star className="w-4 h-4 fill-amber-600" /></div> Reviews ({property._count?.reviews})</h3>
                                <div className="space-y-6">
                                    {property.reviews.map(r => (
                                        <div key={r.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-lg font-bold">{r.author?.name?.[0]}</div>
                                                <div>
                                                    <p className="text-gray-900 font-bold">{r.author?.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}</div>
                                                        <span className="text-gray-400 text-xs">— {new Date(r.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed">{r.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="card p-8 sticky top-24 border-none shadow-md shadow-gray-200/50">
                            <h3 className="font-bold text-gray-900 text-lg mb-6">Listed By</h3>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-bold text-2xl shadow-md">{property.landlord?.name?.[0]}</div>
                                <div>
                                    <p className="text-gray-900 font-bold text-lg">{property.landlord?.name}</p>
                                    <p className="text-indigo-600 text-sm font-medium mt-0.5 flex items-center gap-1.5"><Shield className="w-4 h-4" /> Property Owner</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {property.landlord?.phone && (
                                    <a href={`tel:${property.landlord.phone}`} className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl transition-colors">
                                        <Phone className="w-4 h-4 text-gray-500" /> Call Landlord
                                    </a>
                                )}
                                <button onClick={() => setShowInquiry(!showInquiry)} className={`w-full py-3.5 flex items-center justify-center gap-2 font-semibold rounded-xl transition-all shadow-sm ${showInquiry ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}>
                                    <MessageSquare className="w-4 h-4" /> Message Landlord
                                </button>
                            </div>

                            {showInquiry && (
                                <form onSubmit={handleInquiry} className="mt-6 space-y-4 animate-slide-down p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Your Message</label>
                                        <textarea value={inquiryMsg} onChange={(e) => setInquiryMsg(e.target.value)} placeholder={`Hi, I'm interested in viewing "${property.title}"...`} rows={4} className="input shadow-sm resize-none" autoFocus />
                                    </div>
                                    <button type="submit" disabled={sending} className="btn-primary w-full shadow-sm">
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                            <>
                                                <Mail className="w-4 h-4" /> Send Inquiry
                                            </>
                                        )}
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
    return (
        <div className="card p-6 border-none text-center shadow-sm">
            <div className="w-12 h-12 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">{icon}</div>
            <div className="font-headings font-bold text-gray-900 text-2xl">{value}</div>
            <div className="text-gray-500 text-sm font-medium mt-1">{label}</div>
        </div>
    );
}
