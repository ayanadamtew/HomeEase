'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { bookingsAPI, propertiesAPI, messagesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
    User, Calendar, Building2, MessageSquare, Clock, CheckCircle,
    XCircle, Loader2, MapPin, AlertCircle, Plus, Wrench, ArrowRight,
    Star, TrendingUp, DollarSign,
} from 'lucide-react';

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
        const fetchData = async () => {
            try {
                const [cb, pb, cv] = await Promise.all([
                    bookingsAPI.getAll({ role: 'client', limit: 100 }).catch(() => ({ data: { bookings: [] } })),
                    bookingsAPI.getAll({ role: 'provider', limit: 100 }).catch(() => ({ data: { bookings: [] } })),
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
        fetchData();
    }, [user, authLoading]);

    const updateStatus = async (id, status) => {
        try {
            await bookingsAPI.updateStatus(id, status);
            toast.success(`Booking ${status.toLowerCase()}`);
            setBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 text-indigo-500 animate-spin" /></div>;
    if (!user) return null;

    const pending = bookings.filter(b => b.status === 'PENDING');
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
    const unread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);
    const revenue = bookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + Number(b.totalPrice), 0);

    // Role-based tabs
    const tabs = [
        { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'bookings', label: `Bookings ${bookings.length > 0 ? `(${bookings.length})` : ''}`, icon: <Calendar className="w-4 h-4" /> },
        ...(user.role === 'LANDLORD' || user.role === 'ADMIN'
            ? [{ id: 'properties', label: `Properties (${properties.length})`, icon: <Building2 className="w-4 h-4" /> }]
            : []),
        ...(user.role === 'PROVIDER' || user.role === 'ADMIN'
            ? [{ id: 'service', label: 'My Service', icon: <Wrench className="w-4 h-4" /> }]
            : []),
        { id: 'messages', label: `Messages${unread > 0 ? ` (${unread})` : ''}`, icon: <MessageSquare className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                {user.name?.[0]}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                                <p className="text-slate-400 text-sm mt-0.5">{user.email} · <RoleBadge role={user.role} /></p>
                            </div>
                        </div>

                        <RoleQuickAction role={user.role} />
                    </div>

                    <div className="flex gap-1 mt-6 overflow-x-auto pb-1">
                        {tabs.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard title="Pending" value={pending.length} icon={<Clock className="w-5 h-5" />} color="amber" />
                            <MetricCard title="Confirmed" value={confirmed.length} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
                            <MetricCard title="Total Bookings" value={bookings.length} icon={<Calendar className="w-5 h-5" />} color="indigo" />
                            <MetricCard title={user.role === 'PROVIDER' ? 'Revenue' : 'Unread'} value={user.role === 'PROVIDER' ? `$${revenue.toFixed(0)}` : unread} icon={user.role === 'PROVIDER' ? <DollarSign className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />} color="blue" />
                        </div>
                        <RoleQuickCards role={user.role} propertiesCount={properties.length} />

                        {pending.length > 0 && (
                            <div className="card p-6 !rounded-3xl">
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-500" /> Action Required ({pending.length})
                                </h3>
                                <div className="space-y-3">
                                    {pending.slice(0, 3).map(b => <BookingRow key={b.id} booking={b} user={user} onUpdate={updateStatus} />)}
                                    {pending.length > 3 && <button onClick={() => setActiveTab('bookings')} className="text-indigo-600 text-sm font-medium hover:underline">View all {pending.length} pending →</button>}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="space-y-3 animate-fade-in">
                        {bookings.length === 0 ? (
                            <Empty emoji="📅" title="No bookings yet" desc={user.role === 'CLIENT' ? 'Browse services and book your first provider' : 'Bookings from clients will appear here'} link={user.role === 'CLIENT' ? '/services' : null} linkLabel="Browse Services" />
                        ) : (
                            <>
                                <BookingFilters bookings={bookings} onUpdate={updateStatus} user={user} />
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'properties' && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-semibold text-slate-900">{properties.length} Properties Listed</h3>
                            <Link href="/dashboard/add-property" className="btn-primary !py-2.5 !px-5 !text-sm !rounded-xl">
                                <Plus className="w-4 h-4" /> Add Property
                            </Link>
                        </div>
                        {properties.length === 0 ? (
                            <Empty emoji="🏠" title="No properties listed" desc="Start listing properties for renters" link="/dashboard/add-property" linkLabel="Add First Property" />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {properties.map(p => <PropertyRow key={p.id} property={p} />)}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'service' && (
                    <div className="animate-fade-in max-w-lg">
                        <div className="card p-8 !rounded-3xl text-center">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                                <Wrench className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Manage Your Service Profile</h3>
                            <p className="text-slate-500 text-sm mt-2 mb-6">
                                Update your headline, bio, rates, service area, and availability — or pause new bookings.
                            </p>
                            <Link href="/dashboard/provider-profile" className="btn-primary !rounded-2xl !py-3.5 w-full justify-center">
                                <Wrench className="w-5 h-5" /> Edit Service Profile
                            </Link>
                            {bookings.filter(b => b.serviceProfile?.user?.id === user.id).length > 0 && (
                                <div className="mt-5 pt-5 border-t border-slate-100 text-left">
                                    <p className="text-sm font-semibold text-slate-700 mb-3">Recent Provider Bookings</p>
                                    <div className="space-y-2">
                                        {bookings.filter(b => b.serviceProfile?.user?.id === user.id).slice(0, 3).map(b => (
                                            <BookingRow key={b.id} booking={b} user={user} onUpdate={updateStatus} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="space-y-3 animate-fade-in">
                        {conversations.length === 0 ? (
                            <Empty emoji="💬" title="No conversations" desc="Start a conversation from a property or service listing" />
                        ) : conversations.map(c => {
                            const other = c.participantOne?.id === user.id ? c.participantTwo : c.participantOne;
                            return (
                                <Link key={c.id} href={`/messages?conv=${c.id}`} className="card p-4 card-interactive flex items-center gap-4 !rounded-2xl group">
                                    <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">{other?.name?.[0]}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-slate-900 font-medium text-sm group-hover:text-indigo-600 transition-colors">{other?.name}</p>
                                            {c.unreadCount > 0 && <span className="w-5 h-5 bg-indigo-500 text-white text-[11px] rounded-full flex items-center justify-center font-bold">{c.unreadCount}</span>}
                                        </div>
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

function RoleBadge({ role }) {
    const styles = { CLIENT: 'text-sky-600', LANDLORD: 'text-emerald-600', PROVIDER: 'text-violet-600', ADMIN: 'text-red-600' };
    return <span className={`font-semibold capitalize ${styles[role] || 'text-slate-500'}`}>{role.toLowerCase()}</span>;
}

function RoleQuickAction({ role }) {
    if (role === 'LANDLORD' || role === 'ADMIN') {
        return (
            <Link href="/dashboard/add-property" className="btn-primary !py-2.5 !px-5 !text-sm !rounded-xl">
                <Plus className="w-4 h-4" /> Add Property
            </Link>
        );
    }
    if (role === 'PROVIDER') {
        return (
            <Link href="/dashboard/provider-profile" className="btn-primary !py-2.5 !px-5 !text-sm !rounded-xl">
                <Wrench className="w-4 h-4" /> Edit Service Profile
            </Link>
        );
    }
    return (
        <Link href="/services" className="btn-secondary !py-2.5 !px-5 !text-sm !rounded-xl">
            Browse Services <ArrowRight className="w-4 h-4" />
        </Link>
    );
}

function RoleQuickCards({ role, propertiesCount }) {
    if (role === 'CLIENT') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickCard href="/properties" emoji="🏠" title="Browse Properties" desc="Find your next rental home" color="indigo" />
                <QuickCard href="/services" emoji="🔧" title="Browse Services" desc="Book a trusted local professional" color="violet" />
            </div>
        );
    }
    if (role === 'LANDLORD') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickCard href="/dashboard/add-property" emoji="➕" title="List a Property" desc="Add a new rental listing" color="emerald" />
                <QuickCard href="/properties" emoji="🔍" title="Browse Market" desc="See what's listed in your area" color="indigo" />
            </div>
        );
    }
    if (role === 'PROVIDER') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickCard href="/dashboard/provider-profile" emoji="✏️" title="Update Profile" desc="Keep your service profile current" color="violet" />
                <QuickCard href={`/services`} emoji="👁️" title="View Your Listing" desc="See how clients see your profile" color="indigo" />
            </div>
        );
    }
    if (role === 'ADMIN') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <QuickCard href="/dashboard/add-property" emoji="🏗️" title="Add Property" desc="List a new property" color="emerald" />
                <QuickCard href="/dashboard/provider-profile" emoji="🔧" title="Provider Profile" desc="Manage service profile" color="violet" />
                <QuickCard href="/properties" emoji="📊" title="Browse All" desc="View marketplace" color="indigo" />
            </div>
        );
    }
    return null;
}

function QuickCard({ href, emoji, title, desc, color }) {
    const colors = {
        indigo: 'hover:border-indigo-200 hover:bg-indigo-50/50',
        emerald: 'hover:border-emerald-200 hover:bg-emerald-50/50',
        violet: 'hover:border-violet-200 hover:bg-violet-50/50',
    };
    return (
        <Link href={href} className={`card p-5 flex items-center gap-4 !rounded-2xl transition-all ${colors[color]} group`}>
            <div className="text-3xl">{emoji}</div>
            <div>
                <p className="text-slate-900 font-semibold text-sm group-hover:text-indigo-600 transition-colors">{title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 ml-auto transition-colors" />
        </Link>
    );
}

function BookingFilters({ bookings, onUpdate, user }) {
    const [filter, setFilter] = useState('ALL');
    const filters = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);
    return (
        <div>
            <div className="flex flex-wrap gap-1.5 mb-4">
                {filters.map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>
                        {f === 'ALL' ? `All (${bookings.length})` : f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>
            <div className="space-y-3">
                {filtered.map(b => <BookingRow key={b.id} booking={b} user={user} onUpdate={onUpdate} />)}
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, color }) {
    const c = { amber: 'bg-amber-50 text-amber-600', emerald: 'bg-emerald-50 text-emerald-600', indigo: 'bg-indigo-50 text-indigo-600', blue: 'bg-blue-50 text-blue-600' };
    return (
        <div className="card p-5 !rounded-2xl">
            <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl ${c[color]} flex items-center justify-center`}>{icon}</div>
                <span className="text-2xl font-bold text-slate-900">{value}</span>
            </div>
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
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">{name?.[0]}</div>
                    <div>
                        <p className="text-slate-900 font-medium text-sm">{name}</p>
                        <p className="text-slate-400 text-xs">{booking.serviceProfile?.category?.icon} {booking.serviceProfile?.serviceType || booking.serviceProfile?.category?.name} · {new Date(booking.startTime).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold text-sm">${Number(booking.totalPrice).toFixed(0)}</span>
                    <span className={`badge text-xs ${sc[booking.status]}`}>{booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}</span>
                </div>
            </div>
            {booking.status === 'PENDING' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    {isProv && <button onClick={() => onUpdate(booking.id, 'CONFIRMED')} className="flex-1 py-2 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Accept</button>}
                    <button onClick={() => onUpdate(booking.id, 'CANCELLED')} className="flex-1 py-2 bg-red-50 text-red-500 text-xs font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-1"><XCircle className="w-3.5 h-3.5" /> Decline</button>
                </div>
            )}
            {booking.status === 'CONFIRMED' && isProv && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button onClick={() => onUpdate(booking.id, 'COMPLETED')} className="flex-1 py-2 bg-blue-50 text-blue-600 text-xs font-medium rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Mark Complete</button>
                    <button onClick={() => onUpdate(booking.id, 'CANCELLED')} className="flex-1 py-2 bg-red-50 text-red-500 text-xs font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-1"><XCircle className="w-3.5 h-3.5" /> Cancel</button>
                </div>
            )}
        </div>
    );
}

function PropertyRow({ property }) {
    return (
        <Link href={`/properties/${property.id}`} className="card p-5 card-interactive group !rounded-2xl">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h4 className="text-slate-900 font-semibold text-sm group-hover:text-indigo-600 transition-colors">{property.title}</h4>
                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {property.city}, {property.state}</p>
                </div>
                <div className="text-right">
                    <p className="text-indigo-600 font-bold text-sm">${Number(property.pricePerMonth).toLocaleString()}/mo</p>
                    <span className={`badge text-xs mt-1 ${property.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{property.status}</span>
                </div>
            </div>
            <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                <span>🛏 {property.bedrooms} beds</span>
                <span>🛁 {property.bathrooms} baths</span>
                {property.area && <span>📐 {property.area} sqft</span>}
            </div>
        </Link>
    );
}

function Empty({ emoji, title, desc, link, linkLabel }) {
    return (
        <div className="text-center py-20">
            <div className="text-5xl mb-3">{emoji}</div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {desc && <p className="text-slate-400 text-sm mt-1">{desc}</p>}
            {link && <Link href={link} className="btn-primary !rounded-xl !py-2.5 !px-6 !text-sm inline-flex mt-5">{linkLabel} <ArrowRight className="w-4 h-4" /></Link>}
        </div>
    );
}
