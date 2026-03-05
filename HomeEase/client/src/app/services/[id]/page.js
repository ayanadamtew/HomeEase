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

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-gray-400 text-[11px]"><Loader2 className="w-5 h-5 animate-spin mr-3" /> Loading profile...</div>;
    if (!provider) return null;

    return (
        <div className="min-h-screen pb-16 bg-white">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-black text-[10px] font-black uppercase tracking-widest transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-black p-10 sm:p-14">
                        <div className="flex items-start gap-8">
                            <div className="w-32 h-32 bg-black flex items-center justify-center text-white text-5xl font-black uppercase flex-shrink-0">{provider.user?.name?.[0]}</div>
                            <div className="flex-1">
                                <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tighter uppercase leading-none">{provider.user?.name}</h1>
                                <p className="text-black font-bold uppercase tracking-tight mt-3 text-lg">{provider.headline}</p>
                                <div className="flex flex-wrap items-center gap-4 mt-6">
                                    <span className="px-4 py-1 border border-black text-[10px] font-black uppercase tracking-[0.15em] bg-black text-white">{provider.category?.icon} {provider.serviceType || provider.category?.name}</span>
                                    <span className="flex items-center gap-1.5 text-black text-[10px] font-black uppercase tracking-widest"><MapPin className="w-4 h-4" /> {provider.serviceArea}</span>
                                    <span className="flex items-center gap-1.5 text-black text-[10px] font-black uppercase tracking-widest"><Briefcase className="w-4 h-4" /> {provider.yearsExperience} YRS EXP</span>
                                    {provider.avgRating > 0 && <span className="flex items-center gap-1.5 text-black text-[10px] font-black uppercase tracking-widest"><Star className="w-4 h-4 fill-black" /> {provider.avgRating.toFixed(1)}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 pt-12 border-t border-gray-100 italic font-medium leading-relaxed text-gray-600 text-lg">"{provider.bio}"</div>
                        <div className="mt-12 pt-12 border-t border-black italic font-medium leading-relaxed text-black text-lg">"{provider.bio}"</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-12">
                            <StatBox label="Hourly" value={`ETB ${Number(provider.hourlyRate).toFixed(0)}`} icon={<DollarSign className="w-4 h-4 text-black" />} />
                            {provider.dailyRate && <StatBox label="Daily" value={`$${Number(provider.dailyRate).toFixed(0)}`} icon={<Calendar className="w-4 h-4 text-black" />} />}
                            <StatBox label="Bookings" value={provider._count?.bookings || 0} icon={<Calendar className="w-4 h-4 text-black" />} />
                        </div>
                    </div>

                    {provider.reviews?.length > 0 && (
                        <div className="bg-white border border-black p-10 sm:p-14">
                            <h3 className="font-black text-black uppercase tracking-widest text-sm mb-10 flex items-center gap-3"><Star className="w-6 h-6 text-black fill-black" /> Reviews ({provider._count?.reviews})</h3>
                            <div className="space-y-6">
                                {provider.reviews.map(r => (
                                    <div key={r.id} className="p-10 bg-white border border-black">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-black flex items-center justify-center text-white text-md font-black uppercase">{r.author?.name?.[0]}</div>
                                            <div><p className="text-black text-md font-black uppercase tracking-tighter">{r.author?.name}</p><div className="flex mt-1">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-black fill-black' : 'text-gray-300'}`} />)}</div></div>
                                            <span className="ml-auto text-gray-400 text-[10px] font-black tracking-[0.2em] uppercase">{new Date(r.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-600 text-md font-medium leading-relaxed">"{r.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6 sticky top-24 self-start">
                    <div className="bg-white border border-black p-10">
                        <div className="text-center mb-10"><div className="text-5xl font-black text-black tracking-tighter uppercase leading-none">ETB {Number(provider.hourlyRate).toFixed(0)}</div><div className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] mt-3">per hour</div></div>
                        <button onClick={() => setShowBooking(!showBooking)} className="btn-primary w-full !py-5 uppercase tracking-[0.2em] text-[11px]"><Calendar className="w-5 h-5" /> Book Professional</button>
                        <button onClick={handleContact} className="btn-secondary !border-black w-full !py-5 uppercase tracking-[0.2em] text-[11px] mt-4"><MessageSquare className="w-5 h-5" /> Inquire</button>

                        {showBooking && (
                            <form onSubmit={handleBooking} className="mt-12 space-y-6 animate-slide-down pt-12 border-t border-black">
                                <div><label className="text-[11px] font-black text-black uppercase tracking-[0.2em] mb-3 block">Service Date</label><input type="date" required value={bookingForm.date} onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="input !bg-gray-50 !border-gray-200 focus:!border-black !py-4" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-[11px] font-black text-black uppercase tracking-[0.2em] mb-3 block">Start Time</label><input type="time" required value={bookingForm.startTime} onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })} className="input !bg-gray-50 !border-gray-200 focus:!border-black !py-4" /></div>
                                    <div><label className="text-[11px] font-black text-black uppercase tracking-[0.2em] mb-3 block">End Time</label><input type="time" required value={bookingForm.endTime} onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })} className="input !bg-gray-50 !border-gray-200 focus:!border-black !py-4" /></div>
                                </div>
                                <div><label className="text-[11px] font-black text-black uppercase tracking-[0.2em] mb-3 block">Additional Notes</label><textarea value={bookingForm.notes} onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })} rows={4} placeholder="Describe your specific requirements..." className="input !bg-gray-50 !border-gray-200 focus:!border-black resize-none" /></div>
                                <button type="submit" disabled={submitting} className="btn-primary w-full !py-5 uppercase tracking-[0.2em] text-[11px]">{submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}{submitting ? 'Confirming...' : 'Submit Booking'}</button>
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
        <div className="p-8 bg-gray-50 border border-gray-200 text-center">
            <div className="flex justify-center mb-4">{icon}</div>
            <div className="font-black text-black uppercase tracking-tighter text-2xl">{value}</div>
            <div className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{label}</div>
        </div>
    );
}
