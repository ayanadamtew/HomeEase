'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { servicesAPI, bookingsAPI, messagesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Star, MapPin, Clock, DollarSign, Briefcase,
    MessageSquare, Calendar, Loader2, Mail,
} from 'lucide-react';

export default function ServiceProviderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingForm, setBookingForm] = useState({ date: '', startTime: '09:00', endTime: '13:00', notes: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        servicesAPI.getProviderById(params.id)
            .then(res => setProvider(res.data.provider))
            .catch(() => { toast.error('Provider not found'); router.push('/services'); })
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Please log in to book'); router.push('/auth/login'); return; }
        try {
            setSubmitting(true);
            const startTime = new Date(`${bookingForm.date}T${bookingForm.startTime}:00`).toISOString();
            const endTime = new Date(`${bookingForm.date}T${bookingForm.endTime}:00`).toISOString();
            await bookingsAPI.create({ serviceProfileId: provider.id, startTime, endTime, notes: bookingForm.notes });
            toast.success('Booking request sent!');
            setShowBooking(false);
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleContact = async () => {
        if (!user) { toast.error('Please log in'); router.push('/auth/login'); return; }
        try {
            const res = await messagesAPI.startConversation({ recipientId: provider.user.id });
            router.push(`/messages?conv=${res.data.conversation.id}`);
        } catch (err) {
            toast.error('Failed to start conversation');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>;
    if (!provider) return null;

    return (
        <div className="min-h-screen pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Services
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Header */}
                    <div className="glass rounded-2xl p-8">
                        <div className="flex items-start gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                                {provider.user?.name?.[0]}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-white">{provider.user?.name}</h1>
                                <p className="text-teal-400 font-medium mt-1">{provider.headline}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                    <span className="flex items-center gap-1 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-sm text-teal-400">
                                        {provider.category?.icon} {provider.category?.name}
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                                        <MapPin className="w-3.5 h-3.5" /> {provider.serviceArea}
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                                        <Briefcase className="w-3.5 h-3.5" /> {provider.yearsExperience} yrs experience
                                    </span>
                                    {provider.avgRating > 0 && (
                                        <span className="flex items-center gap-1 text-gray-400 text-sm">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {provider.avgRating.toFixed(1)} ({provider._count?.reviews} reviews)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5">
                            <h3 className="text-white font-semibold mb-2">About</h3>
                            <p className="text-gray-400 leading-relaxed">{provider.bio}</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                            <StatBox label="Hourly Rate" value={`$${Number(provider.hourlyRate).toFixed(0)}`} icon={<DollarSign className="w-4 h-4 text-emerald-400" />} />
                            {provider.dailyRate && <StatBox label="Daily Rate" value={`$${Number(provider.dailyRate).toFixed(0)}`} icon={<Clock className="w-4 h-4 text-teal-400" />} />}
                            <StatBox label="Bookings" value={provider._count?.bookings || 0} icon={<Calendar className="w-4 h-4 text-cyan-400" />} />
                        </div>
                    </div>

                    {/* Reviews */}
                    {provider.reviews?.length > 0 && (
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-400" /> Reviews ({provider._count?.reviews})
                            </h3>
                            <div className="space-y-4">
                                {provider.reviews.map((review) => (
                                    <div key={review.id} className="p-4 bg-gray-800/30 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                                                {review.author?.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{review.author?.name}</p>
                                                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />)}</div>
                                            </div>
                                            <span className="ml-auto text-gray-500 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4 sticky top-24 self-start">
                    <div className="glass rounded-2xl p-6">
                        <div className="text-center mb-4">
                            <div className="text-3xl font-bold text-emerald-400">${Number(provider.hourlyRate).toFixed(0)}</div>
                            <div className="text-gray-500 text-sm">per hour</div>
                        </div>

                        <button onClick={() => setShowBooking(!showBooking)} className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-2xl hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2">
                            <Calendar className="w-5 h-5" /> Book Now
                        </button>

                        <button onClick={handleContact} className="w-full mt-3 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            <MessageSquare className="w-5 h-5" /> Message
                        </button>

                        {showBooking && (
                            <form onSubmit={handleBooking} className="mt-4 space-y-3 animate-fade-in pt-4 border-t border-white/5">
                                <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Date</label>
                                    <input type="date" required value={bookingForm.date} onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500/50" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Start</label>
                                        <input type="time" required value={bookingForm.startTime} onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500/50" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">End</label>
                                        <input type="time" required value={bookingForm.endTime} onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500/50" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Notes (optional)</label>
                                    <textarea value={bookingForm.notes} onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })} rows={3} placeholder="Describe what you need..." className="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500/50 resize-none" />
                                </div>
                                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                                    {submitting ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, icon }) {
    return (
        <div className="p-3 bg-gray-800/30 rounded-xl border border-white/5 text-center">
            <div className="flex justify-center mb-1 text-gray-400">{icon}</div>
            <div className="text-white font-semibold">{value}</div>
            <div className="text-gray-500 text-xs">{label}</div>
        </div>
    );
}
