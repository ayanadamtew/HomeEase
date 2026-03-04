'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { propertiesAPI, messagesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
    MapPin, Bed, Bath, Maximize2, Star, ArrowLeft,
    MessageSquare, Phone, Mail, ChevronLeft, ChevronRight,
    Loader2, Calendar, Wifi, Car, Dumbbell, TreeDeciduous,
} from 'lucide-react';
import Link from 'next/link';

const amenityIcons = {
    WiFi: <Wifi className="w-4 h-4" />,
    Parking: <Car className="w-4 h-4" />,
    Gym: <Dumbbell className="w-4 h-4" />,
    Pool: <TreeDeciduous className="w-4 h-4" />,
};

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIdx, setActiveImageIdx] = useState(0);
    const [showInquiry, setShowInquiry] = useState(false);
    const [inquiryMsg, setInquiryMsg] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await propertiesAPI.getById(params.id);
                setProperty(res.data.property);
            } catch (err) {
                toast.error('Property not found');
                router.push('/properties');
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [params.id]);

    const handleInquiry = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please log in to contact the landlord');
            router.push('/auth/login');
            return;
        }

        try {
            setSending(true);
            const convRes = await messagesAPI.startConversation({
                recipientId: property.landlord.id,
                propertyId: property.id,
            });
            await messagesAPI.sendMessage(convRes.data.conversation.id, inquiryMsg || `Hi, I'm interested in your property: "${property.title}"`);
            toast.success('Message sent to landlord!');
            setShowInquiry(false);
            setInquiryMsg('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!property) return null;

    const images = property.images || [];

    return (
        <div className="min-h-screen pb-16">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Properties
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="rounded-2xl overflow-hidden bg-gray-900/50 border border-white/5">
                            <div className="relative aspect-video bg-gray-800">
                                {images.length > 0 ? (
                                    <>
                                        <img
                                            src={images[activeImageIdx]?.imageUrl}
                                            alt={property.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setActiveImageIdx(i => (i === 0 ? images.length - 1 : i - 1))}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-gray-950/60 backdrop-blur-sm rounded-full border border-white/10 text-white hover:bg-gray-950/80 transition-all"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setActiveImageIdx(i => (i === images.length - 1 ? 0 : i + 1))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-950/60 backdrop-blur-sm rounded-full border border-white/10 text-white hover:bg-gray-950/80 transition-all"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                    {images.map((_, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setActiveImageIdx(idx)}
                                                            className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIdx ? 'bg-emerald-400 w-6' : 'bg-white/40'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <div className="text-center">
                                            <div className="text-6xl mb-2">🏠</div>
                                            <p className="text-sm">No images available</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="glass rounded-2xl p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white">{property.title}</h1>
                                    <div className="flex items-center gap-1 mt-2 text-gray-400">
                                        <MapPin className="w-4 h-4 text-emerald-500" />
                                        {property.location}, {property.city}, {property.state}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-emerald-400">${Number(property.pricePerMonth).toLocaleString()}</div>
                                    <div className="text-gray-500 text-sm">per month</div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                <QuickStat icon={<Bed className="w-5 h-5" />} label="Bedrooms" value={property.bedrooms} />
                                <QuickStat icon={<Bath className="w-5 h-5" />} label="Bathrooms" value={property.bathrooms} />
                                {property.area && <QuickStat icon={<Maximize2 className="w-5 h-5" />} label="Area" value={`${property.area} sqft`} />}
                                {property._count?.reviews > 0 && (
                                    <QuickStat icon={<Star className="w-5 h-5 text-amber-400" />} label="Rating" value={`${property.avgRating?.toFixed(1)} (${property._count.reviews})`} />
                                )}
                            </div>

                            {/* Description */}
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <h3 className="text-white font-semibold mb-3">Description</h3>
                                <p className="text-gray-400 leading-relaxed">{property.description}</p>
                            </div>

                            {/* Amenities */}
                            {property.amenities?.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <h3 className="text-white font-semibold mb-3">Amenities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {property.amenities.map((amenity) => (
                                            <span key={amenity} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/50 border border-white/5 rounded-xl text-sm text-gray-300">
                                                {amenityIcons[amenity] || <span className="w-4 h-4 text-center">✨</span>}
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reviews */}
                        {property.reviews?.length > 0 && (
                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-400" />
                                    Reviews ({property._count?.reviews})
                                </h3>
                                <div className="space-y-4">
                                    {property.reviews.map((review) => (
                                        <div key={review.id} className="p-4 bg-gray-800/30 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {review.author?.name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{review.author?.name}</p>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="ml-auto text-gray-500 text-xs">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Landlord Card */}
                        <div className="glass rounded-2xl p-6 sticky top-24">
                            <h3 className="text-white font-semibold mb-4">Listed by</h3>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                                    {property.landlord?.name?.[0] || '?'}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{property.landlord?.name}</p>
                                    <p className="text-gray-400 text-sm">Property Owner</p>
                                </div>
                            </div>

                            {property.landlord?.phone && (
                                <a href={`tel:${property.landlord.phone}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-2 transition-colors">
                                    <Phone className="w-4 h-4" /> {property.landlord.phone}
                                </a>
                            )}

                            <button
                                onClick={() => setShowInquiry(!showInquiry)}
                                className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-5 h-5" />
                                Contact Landlord
                            </button>

                            {/* Inquiry Form */}
                            {showInquiry && (
                                <form onSubmit={handleInquiry} className="mt-4 space-y-3 animate-fade-in">
                                    <textarea
                                        value={inquiryMsg}
                                        onChange={(e) => setInquiryMsg(e.target.value)}
                                        placeholder={`Hi, I'm interested in "${property.title}"...`}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="w-full py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                        {sending ? 'Sending...' : 'Send Inquiry'}
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

function QuickStat({ icon, label, value }) {
    return (
        <div className="p-3 bg-gray-800/30 rounded-xl border border-white/5 text-center">
            <div className="text-gray-400 flex justify-center mb-1">{icon}</div>
            <div className="text-white font-semibold">{value}</div>
            <div className="text-gray-500 text-xs">{label}</div>
        </div>
    );
}
