'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { servicesAPI, bookingsAPI, messagesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Star, MapPin, DollarSign, Briefcase, MessageSquare, Calendar, Loader2 } from 'lucide-react';

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
        servicesAPI.getProviderById(params.id).then(r => setProvider(r.data.provider)).catch(() => { toast.error('Not found'); router.push('/services'); }).finally(() => setLoading(false));
    }, [params.id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) { router.push('/auth/login'); return; }
        try {
            setSubmitting(true);
            const s = new Date(`${bookingForm.date}T${bookingForm.startTime}:00`).toISOString();
            const en = new Date(`${bookingForm.date}T${bookingForm.endTime}:00`).toISOString();
            await bookingsAPI.create({ serviceProfileId: provider.id, startTime: s, endTime: en, notes: bookingForm.notes });
            toast.success('Booking sent!'); setShowBooking(false); router.push('/dashboard');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    const handleContact = async () => {
        if (!user) { router.push('/auth/login'); return; }
        try { const r = await messagesAPI.startConversation({ recipientId: provider.user.id }); router.push(`/messages?conv=${r.data.conversation.id}`); }
        catch { toast.error('Failed'); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 text-indigo-500 animate-spin" /></div>;
    if (!provider) return null;

    return (
        <div className="min-h-screen pb-16" style={{ background: '#F8FAFC' }}>
            <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-8 !rounded-3xl">
                        <div className="flex items-start gap-5">
                            <div className="w-20 h-20 rounded-3xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold flex-shrink-0">{provider.user?.name?.[0]}</div>
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{provider.user?.name}</h1>
                                <p className="text-indigo-600 font-medium mt-1">{provider.headline}</p>
                                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                                    <span className="badge bg-indigo-50 text-indigo-600 border border-indigo-100">{provider.category?.icon} {provider.serviceType || provider.category?.name}</span>
                                    <span className="flex items-center gap-1 text-slate-400 text-sm"><MapPin className="w-3.5 h-3.5" /> {provider.serviceArea}</span>
                                    <span className="flex items-center gap-1 text-slate-400 text-sm"><Briefcase className="w-3.5 h-3.5" /> {provider.yearsExperience} yrs</span>
                                    {provider.avgRating > 0 && <span className="flex items-center gap-1 text-slate-400 text-sm"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {provider.avgRating.toFixed(1)}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-100"><h3 className="font-semibold text-slate-900 mb-2">About</h3><p className="text-slate-500 leading-relaxed">{provider.bio}</p></div>
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <StatBox label="Hourly" value={`$${Number(provider.hourlyRate).toFixed(0)}`} icon={<DollarSign className="w-4 h-4 text-indigo-400" />} />
                            {provider.dailyRate && <StatBox label="Daily" value={`$${Number(provider.dailyRate).toFixed(0)}`} icon={<Calendar className="w-4 h-4 text-indigo-400" />} />}
                            <StatBox label="Bookings" value={provider._count?.bookings || 0} icon={<Calendar className="w-4 h-4 text-indigo-400" />} />
                        </div>
                    </div>

                    {provider.reviews?.length > 0 && (
                        <div className="card p-7 !rounded-3xl">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-400" /> Reviews ({provider._count?.reviews})</h3>
                            <div className="space-y-3">
                                {provider.reviews.map(r => (
                                    <div key={r.id} className="p-4 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">{r.author?.name?.[0]}</div>
                                            <div><p className="text-slate-900 text-sm font-medium">{r.author?.name}</p><div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />)}</div></div>
                                        </div>
                                        <p className="text-slate-500 text-sm">{r.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4 sticky top-24 self-start">
                    <div className="card p-6 !rounded-3xl">
                        <div className="text-center mb-5"><div className="text-3xl font-bold text-indigo-600">${Number(provider.hourlyRate).toFixed(0)}</div><div className="text-slate-400 text-sm">per hour</div></div>
                        <button onClick={() => setShowBooking(!showBooking)} className="btn-primary w-full !rounded-2xl !py-3.5"><Calendar className="w-5 h-5" /> Book Now</button>
                        <button onClick={handleContact} className="btn-secondary w-full !rounded-2xl !py-3.5 mt-3"><MessageSquare className="w-5 h-5" /> Message</button>

                        {showBooking && (
                            <form onSubmit={handleBooking} className="mt-5 space-y-3 animate-slide-down pt-5 border-t border-slate-100">
                                <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label><input type="date" required value={bookingForm.date} onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="input" /></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Start</label><input type="time" required value={bookingForm.startTime} onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })} className="input" /></div>
                                    <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">End</label><input type="time" required value={bookingForm.endTime} onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })} className="input" /></div>
                                </div>
                                <div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label><textarea value={bookingForm.notes} onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })} rows={3} placeholder="Describe what you need..." className="input resize-none" /></div>
                                <button type="submit" disabled={submitting} className="btn-primary w-full !rounded-xl !py-3 !text-sm">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}{submitting ? 'Booking...' : 'Confirm Booking'}</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, icon }) {
    return <div className="p-3 bg-slate-50 rounded-2xl text-center"><div className="flex justify-center mb-1">{icon}</div><div className="font-semibold text-slate-900">{value}</div><div className="text-slate-400 text-xs">{label}</div></div>;
}
