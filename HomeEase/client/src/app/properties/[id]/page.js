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

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-gray-400 text-[11px]"><Loader2 className="w-5 h-5 animate-spin mr-3" /> Loading property details...</div>;
    if (!property) return null;

    const images = property.images || [];

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-20">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-black text-[10px] font-black uppercase tracking-widest transition-colors mb-10">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Gallery */}
                        <div className="bg-white border border-black overflow-hidden">
                            <div className="relative aspect-[16/10] bg-gray-50">
                                {images.length > 0 ? (
                                    <>
                                        <img src={images[activeImg]?.imageUrl} alt={property.title} className="w-full h-full object-cover" />
                                        {images.length > 1 && (
                                            <>
                                                <button onClick={() => setActiveImg(i => i === 0 ? images.length - 1 : i - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm border border-black shadow-none text-black hover:bg-white transition"><ChevronLeft className="w-5 h-5" /></button>
                                                <button onClick={() => setActiveImg(i => i === images.length - 1 ? 0 : i + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm border border-black shadow-none text-black hover:bg-white transition"><ChevronRight className="w-5 h-5" /></button>
                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                    {images.map((_, idx) => <button key={idx} onClick={() => setActiveImg(idx)} className={`h-1 transition-all ${idx === activeImg ? 'bg-white w-8' : 'bg-white/50 w-2'}`} />)}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                        <div className="text-center"><div className="text-6xl mb-2">🏠</div><p className="text-gray-400 text-sm font-bold uppercase tracking-widest">No images</p></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-white border border-black p-10 sm:p-14">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-3xl sm:text-64px font-headings text-black tracking-tight uppercase leading-none">{property.title}</h1>
                                    <div className="flex items-center gap-2 mt-6 text-black font-headings uppercase text-[10px] tracking-widest"><MapPin className="w-4 h-4 text-black" />{property.location}, {property.city}, {property.state}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-5xl font-headings text-black tracking-tight uppercase leading-none">ETB {Number(property.pricePerMonth).toLocaleString()}</div>
                                    <div className="text-gray-400 text-[11px] font-headings uppercase tracking-[0.3em] mt-3">per month</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
                                <Stat icon={<Bed className="w-5 h-5 text-black" />} label="Bedrooms" value={property.bedrooms} />
                                <Stat icon={<Bath className="w-5 h-5 text-black" />} label="Bathrooms" value={property.bathrooms} />
                                {property.area && <Stat icon={<Maximize2 className="w-5 h-5 text-black" />} label="Area" value={`${property.area} sqft`} />}
                                {property._count?.reviews > 0 && <Stat icon={<Star className="w-5 h-5 text-black fill-black" />} label="Rating" value={`${property.avgRating?.toFixed(1)} (${property._count.reviews})`} />}
                            </div>

                            <div className="mt-12 pt-12 border-t border-black">
                                <h3 className="font-black text-black uppercase tracking-widest text-[11px] mb-6">Property Description</h3>
                                <p className="text-gray-500 leading-relaxed font-medium text-lg italic">"{property.description}"</p>
                            </div>

                            {property.amenities?.length > 0 && (
                                <div className="mt-12 pt-12 border-t border-black">
                                    <h3 className="font-black text-black uppercase tracking-widest text-[11px] mb-6">Premium Amenities</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {property.amenities.map(a => (
                                            <span key={a} className="flex items-center gap-2 px-6 py-3 bg-white border border-black text-[10px] font-black uppercase tracking-[0.1em] text-black">
                                                {amenityIcons[a] || <span>✨</span>}{a}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {property.reviews?.length > 0 && (
                            <div className="card p-8">
                                <h3 className="font-black text-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2"><Star className="w-5 h-5 text-black" /> Reviews ({property._count?.reviews})</h3>
                                <div className="space-y-4">
                                    {property.reviews.map(r => (
                                        <div key={r.id} className="p-6 bg-gray-50 border border-gray-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-white border border-black flex items-center justify-center text-black text-sm font-black uppercase">{r.author?.name?.[0]}</div>
                                                <div><p className="text-black text-sm font-black uppercase tracking-tight">{r.author?.name}</p><div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-black fill-black' : 'text-gray-200'}`} />)}</div></div>
                                                <span className="ml-auto text-gray-400 text-xs font-bold tracking-widest uppercase">{new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-500 text-sm font-medium leading-relaxed">{r.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white border border-black p-10 sticky top-24">
                            <h3 className="font-black text-black uppercase tracking-widest text-sm mb-6">Listed by</h3>
                            <div className="flex items-center gap-5 mb-10">
                                <div className="w-16 h-16 bg-black flex items-center justify-center text-white font-black text-2xl uppercase">{property.landlord?.name?.[0]}</div>
                                <div><p className="text-black font-black uppercase tracking-tighter text-lg">{property.landlord?.name}</p><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Property Owner</p></div>
                            </div>
                            {property.landlord?.phone && <a href={`tel:${property.landlord.phone}`} className="flex items-center gap-2 text-black hover:bg-gray-50 border border-black p-4 text-[10px] font-black uppercase tracking-widest mb-4 transition-colors justify-center"><Phone className="w-4 h-4" /> Call Landlord</a>}
                            <button onClick={() => setShowInquiry(!showInquiry)} className="btn-primary w-full !py-5 uppercase tracking-[0.2em] text-[11px]"><MessageSquare className="w-5 h-5" /> Inquire</button>

                            {showInquiry && (
                                <form onSubmit={handleInquiry} className="mt-10 space-y-6 animate-slide-down pt-10 border-t border-black">
                                    <textarea value={inquiryMsg} onChange={(e) => setInquiryMsg(e.target.value)} placeholder={`Hi, I'm interested in "${property.title}"...`} rows={5} className="input !bg-gray-50 !border-gray-200 focus:!border-black resize-none" />
                                    <button type="submit" disabled={sending} className="btn-primary w-full !py-5 uppercase tracking-[0.2em] text-[11px]">
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}{sending ? 'Sending...' : 'Send Inquiry'}
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
        <div className="p-6 bg-gray-50 border border-gray-200 text-center">
            <div className="flex justify-center mb-3">{icon}</div>
            <div className="font-headings text-black uppercase tracking-tight text-2xl">{value}</div>
            <div className="text-gray-400 text-[10px] font-headings uppercase tracking-[0.3em] mt-2">{label}</div>
        </div>
    );
}
