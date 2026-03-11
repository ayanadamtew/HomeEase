'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { servicesAPI, bookingsAPI, messagesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Star, MapPin, DollarSign, Briefcase, MessageSquare, Calendar, Loader2, Award, Clock } from 'lucide-react';

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
            .then(r => setProvider(r.data.provider))
            .catch(() => { toast.error('Provider not found'); router.push('/services'); })
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) { router.push('/auth/login'); return; }
        try {
            setSubmitting(true);
            const s = new Date(`${bookingForm.date}T${bookingForm.startTime}:00`).toISOString();
            const en = new Date(`${bookingForm.date}T${bookingForm.endTime}:00`).toISOString();
            await bookingsAPI.create({ serviceProfileId: provider.id, startTime: s, endTime: en, notes: bookingForm.notes });
            toast.success('Booking request sent!'); setShowBooking(false); router.push('/dashboard');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to request booking'); }
        finally { setSubmitting(false); }
    };

    const handleContact = async () => {
        if (!user) { router.push('/auth/login'); return; }
        try {
            const r = await messagesAPI.startConversation({ recipientId: provider.user.id });
            router.push(`/messages?conv=${r.data.conversation.id}`);
        }
        catch { toast.error('Failed to start conversation'); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin text-teal-500 mr-4" /> <span className="font-medium text-lg">Loading profile...</span></div>;
    if (!provider) return null;

    return (
        <div className="min-h-screen pb-20 bg-gray-50">
            {/* Header / Cover Area */}
            <div className="bg-gradient-to-r from-gray-900 to-slate-800 pb-32 pt-10">
                <div className="max-w-7xl mx-auto px-5 sm:px-8">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to providers
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 -mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Profile Card */}
                    <div className="card p-8 sm:p-10 border-none shadow-sm relative pt-12">
                        <div className="absolute -top-16 left-8 sm:left-10">
                            <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-lg">
                                <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-inner">
                                    {provider.user?.name?.[0]}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mb-4">
                            {provider.avgRating > 0 && (
                                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg border border-amber-100 font-bold shadow-sm">
                                    <Star className="w-4 h-4 fill-amber-500" /> {provider.avgRating.toFixed(1)} <span className="text-amber-500/70 text-sm font-semibold ml-1">({provider._count?.reviews || 0} reviews)</span>
                                </div>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-headings font-bold text-gray-900 tracking-tight">{provider.user?.name}</h1>
                        <p className="text-gray-500 font-medium text-lg mt-2">{provider.headline}</p>

                        <div className="flex flex-wrap items-center gap-3 mt-6">
                            <span className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-md text-sm font-semibold flex items-center gap-1.5 border border-teal-100">
                                {provider.category?.icon} {provider.serviceType || provider.category?.name}
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-600 text-sm font-medium"><MapPin className="w-4 h-4 text-gray-400" /> {provider.serviceArea}</span>
                            <span className="flex items-center gap-1.5 text-gray-600 text-sm font-medium"><Briefcase className="w-4 h-4 text-gray-400" /> {provider.yearsExperience} yrs experience</span>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-md"><User className="w-4 h-4" /></div> About Me</h3>
                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{provider.bio}</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
                            <StatBox label="Hourly Rate" value={`ETB ${Number(provider.hourlyRate).toFixed(0)}`} icon={<DollarSign className="w-5 h-5 text-emerald-500" />} />
                            {provider.dailyRate && <StatBox label="Daily Rate" value={`ETB ${Number(provider.dailyRate).toFixed(0)}`} icon={<Clock className="w-5 h-5 text-indigo-500" />} />}
                            <StatBox label="Total Bookings" value={provider._count?.bookings || 0} icon={<Award className="w-5 h-5 text-amber-500" />} />
                        </div>
                    </div>

                    {/* Reviews */}
                    {provider.reviews?.length > 0 && (
                        <div className="card p-8 sm:p-10 border-none shadow-sm">
                            <h3 className="font-bold text-gray-900 text-xl mb-8 flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center leading-none"><Star className="w-4 h-4 fill-amber-600" /></div> Client Reviews ({provider._count?.reviews})</h3>
                            <div className="space-y-6">
                                {provider.reviews.map(r => (
                                    <div key={r.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-bold">{r.author?.name?.[0]}</div>
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

                {/* Sidebar Booking Widget */}
                <div className="space-y-6">
                    <div className="card p-8 border-none shadow-md shadow-gray-200/50 sticky top-24">
                        <div className="text-center mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="text-3xl font-headings font-bold text-gray-900 tracking-tight">ETB {Number(provider.hourlyRate).toFixed(0)}</div>
                            <div className="text-gray-500 font-medium text-sm mt-1">per hour</div>
                        </div>

                        <button onClick={() => setShowBooking(!showBooking)} className={`btn-primary w-full !py-3.5 justify-center font-bold text-base shadow-sm ${showBooking ? '!bg-gray-100 !text-gray-700 hover:!bg-gray-200 !shadow-none' : ''}`}>
                            <Calendar className="w-5 h-5" /> {showBooking ? 'Cancel Booking' : 'Book Professional'}
                        </button>

                        {!showBooking && (
                            <button onClick={handleContact} className="btn-secondary w-full !py-3.5 justify-center mt-3 font-semibold text-gray-700">
                                <MessageSquare className="w-5 h-5" /> Send Message
                            </button>
                        )}

                        {showBooking && (
                            <form onSubmit={handleBooking} className="mt-6 space-y-4 animate-slide-down pt-6 border-t border-gray-100">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Service Date</label>
                                    <input type="date" required value={bookingForm.date} onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="input shadow-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Start Time</label>
                                        <input type="time" required value={bookingForm.startTime} onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })} className="input shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">End Time</label>
                                        <input type="time" required value={bookingForm.endTime} onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })} className="input shadow-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Additional Notes</label>
                                    <textarea value={bookingForm.notes} onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })} rows={3} placeholder="Describe what you need help with..." className="input shadow-sm resize-none" />
                                </div>
                                <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5 justify-center bg-teal-600 hover:bg-teal-700 shadow-teal-600/30">
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Booking Request'}
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
        <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl text-center">
            <div className="w-10 h-10 mx-auto bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-3">{icon}</div>
            <div className="font-bold text-gray-900 text-xl">{value}</div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-1">{label}</div>
        </div>
    );
}

function User(props) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
