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

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 text-gray-600 animate-spin" /></div>;
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
        <div className="min-h-screen bg-white">
            <div className="bg-white border-b border-black">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-black flex items-center justify-center text-white text-3xl font-black">
                                {user.name?.[0]}
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-black tracking-tighter uppercase">{user.name}</h1>
                                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-2">{user.email} · <RoleBadge role={user.role} /></p>
                            </div>
                        </div>

                        <RoleQuickAction role={user.role} />
                    </div>

                    <div className="flex gap-2 mt-10 overflow-x-auto pb-1">
                        {tabs.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-2 px-6 py-3 border border-black text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Pending" value={pending.length} icon={<Clock className="w-5 h-5" />} color="gray" />
                            <MetricCard title="Confirmed" value={confirmed.length} icon={<CheckCircle className="w-5 h-5" />} color="gray" />
                            <MetricCard title="Total Bookings" value={bookings.length} icon={<Calendar className="w-5 h-5" />} color="gray" />
                            <MetricCard title={user.role === 'PROVIDER' ? 'Revenue' : 'Unread'} value={user.role === 'PROVIDER' ? `ETB ${revenue.toFixed(0)}` : unread} icon={user.role === 'PROVIDER' ? <DollarSign className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />} color="gray" />
                        </div>
                        <RoleQuickCards role={user.role} propertiesCount={properties.length} />

                        {pending.length > 0 && (
                            <div className="bg-white border border-black p-8">
                                <h3 className="font-black text-black uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-black" /> Action Required ({pending.length})
                                </h3>
                                <div className="space-y-4">
                                    {pending.slice(0, 3).map(b => <BookingRow key={b.id} booking={b} user={user} onUpdate={updateStatus} />)}
                                    {pending.length > 3 && <button onClick={() => setActiveTab('bookings')} className="text-black text-[11px] font-black uppercase tracking-widest hover:underline mt-4">View all {pending.length} pending →</button>}
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
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-black uppercase tracking-tighter text-xl">{properties.length} Properties Listed</h3>
                            <Link href="/dashboard/add-property" className="btn-primary !py-3 !px-8 !text-[11px] !uppercase !tracking-widest">
                                <Plus className="w-4 h-4" strokeWidth={3} /> Add Property
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
                    <div className="animate-fade-in max-w-xl">
                        <div className="bg-white border border-black p-12 text-center">
                            <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6">
                                <Wrench className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-black uppercase tracking-tighter">Manage Your Service</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-4 mb-10 leading-relaxed">
                                Update headline, bio, rates, service area, and availability — or pause new bookings.
                            </p>
                            <Link href="/dashboard/provider-profile" className="btn-primary !py-4 w-full justify-center !text-[12px] !uppercase !tracking-[0.2em]">
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
                                    <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-black font-bold flex-shrink-0">{other?.name?.[0]}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-slate-900 font-medium text-sm group-hover:text-black transition-colors">{other?.name}</p>
                                            {c.unreadCount > 0 && <span className="w-5 h-5 bg-gray-800 text-white text-[11px] rounded-full flex items-center justify-center font-bold">{c.unreadCount}</span>}
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
    return <span className="font-black uppercase tracking-widest text-[10px] text-black border border-black px-2 py-0.5 ml-2">{role}</span>;
}

function RoleQuickAction({ role }) {
    if (role === 'LANDLORD' || role === 'ADMIN') {
        return (
            <Link href="/dashboard/add-property" className="btn-primary !py-3 !px-8 !text-[11px] !uppercase !tracking-widest">
                <Plus className="w-4 h-4" strokeWidth={3} /> Add Property
            </Link>
        );
    }
    if (role === 'PROVIDER') {
        return (
            <Link href="/dashboard/provider-profile" className="btn-primary !py-3 !px-8 !text-[11px] !uppercase !tracking-widest">
                <Wrench className="w-4 h-4" /> Edit Service Profile
            </Link>
        );
    }
    return (
        <Link href="/services" className="btn-secondary !py-3 !px-8 !text-[11px] !uppercase !tracking-widest !border-black">
            Browse Services <ArrowRight className="w-4 h-4" />
        </Link>
    );
}

function RoleQuickCards({ role, propertiesCount }) {
    if (role === 'CLIENT') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickCard href="/properties" emoji="🏠" title="Browse Properties" desc="Find your next rental home" color="gray" />
                <QuickCard href="/services" emoji="🔧" title="Browse Services" desc="Book a trusted local professional" color="gray" />
            </div>
        );
    }
    if (role === 'LANDLORD') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickCard href="/dashboard/add-property" emoji="➕" title="List a Property" desc="Add a new rental listing" color="gray" />
                <QuickCard href="/properties" emoji="🔍" title="Browse Market" desc="See what's listed in your area" color="gray" />
            </div>
        );
    }
    if (role === 'PROVIDER') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickCard href="/dashboard/provider-profile" emoji="✏️" title="Update Profile" desc="Keep your service profile current" color="gray" />
                <QuickCard href={`/services`} emoji="👁️" title="View Your Listing" desc="See how clients see your profile" color="gray" />
            </div>
        );
    }
    if (role === 'ADMIN') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <QuickCard href="/dashboard/add-property" emoji="🏗️" title="Add Property" desc="List a new property" color="gray" />
                <QuickCard href="/dashboard/provider-profile" emoji="🔧" title="Provider Profile" desc="Manage service profile" color="gray" />
                <QuickCard href="/properties" emoji="📊" title="Browse All" desc="View marketplace" color="gray" />
            </div>
        );
    }
    return null;
}

function QuickCard({ href, emoji, title, desc, color }) {
    return (
        <Link href={href} className="bg-white border border-gray-100 p-6 flex items-center gap-6 transition-all hover:border-black group">
            <div className="text-4xl">{emoji}</div>
            <div>
                <p className="text-black font-black text-[15px] uppercase tracking-tighter group-hover:text-black transition-colors">{title}</p>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">{desc}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-200 group-hover:text-black ml-auto transition-all" />
        </Link>
    );
}

function BookingFilters({ bookings, onUpdate, user }) {
    const [filter, setFilter] = useState('ALL');
    const filters = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);
    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-8">
                {filters.map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 border border-black text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}>
                        {f === 'ALL' ? `All (${bookings.length})` : f}
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
    return (
        <div className="bg-white border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center">{icon}</div>
                <span className="text-3xl font-black text-black tracking-tighter">{value}</span>
            </div>
            <div className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</div>
        </div>
    );
}

function BookingRow({ booking, user, onUpdate }) {
    const isProv = booking.serviceProfile?.user?.id === user.id;
    const name = isProv ? booking.client?.name : booking.serviceProfile?.user?.name;
    return (
        <div className="border border-gray-100 p-6 bg-white hover:border-black transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-gray-50 border border-gray-200 flex items-center justify-center text-black font-black text-sm uppercase">{name?.[0]}</div>
                    <div>
                        <p className="text-black font-black text-[15px] uppercase tracking-tighter">{name}</p>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">
                            {booking.serviceProfile?.category?.icon} {booking.serviceProfile?.serviceType || booking.serviceProfile?.category?.name} · {new Date(booking.startTime).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-black font-black text-[15px] uppercase tracking-tighter">ETB {Number(booking.totalPrice).toFixed(0)}</span>
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-black ${booking.status === 'CANCELLED' ? 'bg-black text-white' : 'bg-white text-black'}`}>
                        {booking.status}
                    </span>
                </div>
            </div>
            {booking.status === 'PENDING' && (
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-100">
                    {isProv && (
                        <button onClick={() => onUpdate(booking.id, 'CONFIRMED')} className="flex-1 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Accept
                        </button>
                    )}
                    <button onClick={() => onUpdate(booking.id, 'CANCELLED')} className="flex-1 py-3 bg-white text-black border border-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4" /> Decline
                    </button>
                </div>
            )}
            {booking.status === 'CONFIRMED' && isProv && (
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-100">
                    <button onClick={() => onUpdate(booking.id, 'COMPLETED')} className="flex-1 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Mark Complete
                    </button>
                    <button onClick={() => onUpdate(booking.id, 'CANCELLED')} className="flex-1 py-3 bg-white text-black border border-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4" /> Cancel
                    </button>
                </div>
            )}
        </div>
    );
}

function PropertyRow({ property }) {
    return (
        <Link href={`/properties/${property.id}`} className="bg-white border border-gray-100 p-6 transition-all hover:border-black group">
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                    <h4 className="text-black font-black text-[15px] uppercase tracking-tighter group-hover:text-black transition-colors">{property.title}</h4>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {property.city}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-black font-black text-[15px] uppercase tracking-tighter">ETB {Number(property.pricePerMonth).toLocaleString()}</p>
                    <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-black mt-2 ${property.status === 'AVAILABLE' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                        {property.status}
                    </span>
                </div>
            </div>
            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>{property.bedrooms} Bed</span>
                <span>{property.bathrooms} Bath</span>
                {property.area && <span>{property.area} sqft</span>}
            </div>
        </Link>
    );
}

function Empty({ emoji, title, desc, link, linkLabel }) {
    return (
        <div className="text-center py-32 bg-gray-50 border border-black border-dashed">
            <div className="text-6xl mb-6">{emoji}</div>
            <h3 className="text-xl font-black text-black uppercase tracking-tighter">{title}</h3>
            {desc && <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-4 leading-relaxed max-w-sm mx-auto">{desc}</p>}
            {link && <Link href={link} className="btn-primary !py-3.5 !px-10 !text-[11px] !uppercase !tracking-[0.2em] inline-flex mt-10">{linkLabel} <ArrowRight className="w-4 h-4 ml-2" /></Link>}
        </div>
    );
}
