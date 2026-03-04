'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { bookingsAPI, propertiesAPI, messagesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { User, Calendar, Building2, MessageSquare, Clock, CheckCircle, XCircle, Loader2, MapPin, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [properties, setProperties] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!authLoading && !user) { router.push('/auth/login'); return; }
        if (!user) return;
        const fetch = async () => {
            try {
                const [cb, pb, cv] = await Promise.all([
                    bookingsAPI.getAll({ role: 'client', limit: 50 }).catch(() => ({ data: { bookings: [] } })),
                    bookingsAPI.getAll({ role: 'provider', limit: 50 }).catch(() => ({ data: { bookings: [] } })),
                    messagesAPI.getConversations().catch(() => ({ data: { conversations: [] } })),
                ]);
                const all = [...cb.data.bookings, ...pb.data.bookings].filter((b, i, a) => a.findIndex(x => x.id === b.id) === i);
                setBookings(all);
                setConversations(cv.data.conversations);
                if (user.role === 'LANDLORD' || user.role === 'ADMIN') {
                    const p = await propertiesAPI.getMyListings().catch(() => ({ data: { properties: [] } }));
                    setProperties(p.data.properties);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, [user, authLoading]);

    const updateStatus = async (id, status) => {
        try { await bookingsAPI.updateStatus(id, status); toast.success(`Booking ${status.toLowerCase()}`); setBookings(p => p.map(b => b.id === id ? { ...b, status } : b)); }
        catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 text-indigo-500 animate-spin" /></div>;
    if (!user) return null;

    const pending = bookings.filter(b => b.status === 'PENDING');
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
    const unread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);
    const tabs = [
        { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
        { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-4 h-4" /> },
        ...(user.role === 'LANDLORD' || user.role === 'ADMIN' ? [{ id: 'properties', label: 'Properties', icon: <Building2 className="w-4 h-4" /> }] : []),
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">{user.name?.[0]}</div>
                        <div><h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user.name}</h1><p className="text-slate-400 text-sm">{user.email} · <span className="text-indigo-500 font-medium capitalize">{user.role.toLowerCase()}</span></p></div>
                    </div>
                    <div className="flex gap-1 mt-6 overflow-x-auto">
                        {tabs.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>{t.icon} {t.label}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard title="Pending" value={pending.length} icon={<Clock className="w-5 h-5" />} color="amber" />
                            <MetricCard title="Confirmed" value={confirmed.length} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
                            <MetricCard title="Total Bookings" value={bookings.length} icon={<Calendar className="w-5 h-5" />} color="indigo" />
                            <MetricCard title="Unread" value={unread} icon={<MessageSquare className="w-5 h-5" />} color="blue" />
                        </div>
                        {pending.length > 0 && (
                            <div className="card p-6 !rounded-3xl">
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-500" /> Action Required</h3>
                                <div className="space-y-3">{pending.slice(0, 3).map(b => <BookingRow key={b.id} booking={b} user={user} onUpdate={updateStatus} />)}</div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="space-y-3 animate-fade-in">
                        {bookings.length === 0 ? <Empty emoji="📅" title="No bookings yet" /> : bookings.map(b => <BookingRow key={b.id} booking={b} user={user} onUpdate={updateStatus} />)}
                    </div>
                )}

                {activeTab === 'properties' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">{properties.length} Properties</h3>
                            <Link href="/dashboard/add-property" className="btn-primary !py-2.5 !px-5 !text-sm !rounded-xl">+ Add Property</Link></div>
                        {properties.length === 0 ? <Empty emoji="🏠" title="No properties listed" /> : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {properties.map(p => (
                                    <Link key={p.id} href={`/properties/${p.id}`} className="card p-5 card-interactive group !rounded-2xl">
                                        <h4 className="text-slate-900 font-medium group-hover:text-indigo-600 transition-colors">{p.title}</h4>
                                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.city}</span>
                                            <span className="text-indigo-600 font-semibold">${Number(p.pricePerMonth).toLocaleString()}/mo</span>
                                            <span className={`badge text-xs ${p.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{p.status}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="space-y-3 animate-fade-in">
                        {conversations.length === 0 ? <Empty emoji="💬" title="No conversations" /> : conversations.map(c => {
                            const other = c.participantOne?.id === user.id ? c.participantTwo : c.participantOne;
                            return (
                                <Link key={c.id} href={`/messages?conv=${c.id}`} className="card p-4 card-interactive flex items-center gap-4 !rounded-2xl group">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">{other?.name?.[0]}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between"><p className="text-slate-900 font-medium group-hover:text-indigo-600 transition-colors text-sm">{other?.name}</p>
                                            {c.unreadCount > 0 && <span className="w-5 h-5 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{c.unreadCount}</span>}</div>
                                        <p className="text-slate-400 text-sm line-clamp-1">{c.messages?.[0]?.content || 'Start chatting...'}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, color }) {
    const styles = { amber: 'bg-amber-50 text-amber-600', emerald: 'bg-emerald-50 text-emerald-600', indigo: 'bg-indigo-50 text-indigo-600', blue: 'bg-blue-50 text-blue-600' };
    return (
        <div className="card p-5 !rounded-2xl">
            <div className="flex items-center justify-between mb-2"><div className={`w-10 h-10 rounded-xl ${styles[color]} flex items-center justify-center`}>{icon}</div><span className="text-3xl font-bold text-slate-900">{value}</span></div>
            <div className="text-slate-500 text-sm font-medium">{title}</div>
        </div>
    );
}

function BookingRow({ booking, user, onUpdate }) {
    const isProv = booking.serviceProfile?.user?.id === user.id;
    const name = isProv ? booking.client?.name : booking.serviceProfile?.user?.name;
    const sc = { PENDING: 'bg-amber-50 text-amber-600', CONFIRMED: 'bg-emerald-50 text-emerald-600', COMPLETED: 'bg-blue-50 text-blue-600', CANCELLED: 'bg-red-50 text-red-500' };
    return (
        <div className="card p-4 !rounded-2xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{name?.[0]}</div>
                    <div><p className="text-slate-900 font-medium text-sm">{name}</p><p className="text-slate-400 text-xs">{booking.serviceProfile?.category?.icon} {booking.serviceProfile?.category?.name} · {new Date(booking.startTime).toLocaleDateString()}</p></div>
                </div>
                <div className="flex items-center gap-2"><span className="text-indigo-600 font-semibold text-sm">${Number(booking.totalPrice).toFixed(0)}</span><span className={`badge text-xs ${sc[booking.status]}`}>{booking.status}</span></div>
            </div>
            {booking.status === 'PENDING' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    {isProv && <button onClick={() => onUpdate(booking.id, 'CONFIRMED')} className="flex-1 py-2 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Confirm</button>}
                    <button onClick={() => onUpdate(booking.id, 'CANCELLED')} className="flex-1 py-2 bg-red-50 text-red-500 text-xs font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-1"><XCircle className="w-3.5 h-3.5" />Cancel</button>
                </div>
            )}
        </div>
    );
}

function Empty({ emoji, title }) {
    return <div className="text-center py-20"><div className="text-5xl mb-3">{emoji}</div><h3 className="text-lg font-semibold text-slate-900">{title}</h3></div>;
}
