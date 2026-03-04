'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { bookingsAPI, propertiesAPI, messagesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
    User, Calendar, Building2, MessageSquare, Star,
    Clock, CheckCircle, XCircle, Loader2, ArrowRight,
    MapPin, DollarSign, AlertCircle,
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
                const [clientBookings, providerBookings, convos] = await Promise.all([
                    bookingsAPI.getAll({ role: 'client', limit: 50 }).catch(() => ({ data: { bookings: [] } })),
                    bookingsAPI.getAll({ role: 'provider', limit: 50 }).catch(() => ({ data: { bookings: [] } })),
                    messagesAPI.getConversations().catch(() => ({ data: { conversations: [] } })),
                ]);

                const allBookings = [...clientBookings.data.bookings, ...providerBookings.data.bookings];
                // Remove duplicates
                const unique = allBookings.filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i);
                setBookings(unique);
                setConversations(convos.data.conversations);

                if (user.role === 'LANDLORD' || user.role === 'ADMIN') {
                    const props = await propertiesAPI.getMyListings().catch(() => ({ data: { properties: [] } }));
                    setProperties(props.data.properties);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, authLoading]);

    const updateBookingStatus = async (bookingId, status) => {
        try {
            await bookingsAPI.updateStatus(bookingId, status);
            toast.success(`Booking ${status.toLowerCase()}`);
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        }
    };

    if (authLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
    }

    if (!user) return null;

    const pendingBookings = bookings.filter(b => b.status === 'PENDING');
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
    const unreadMessages = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
        { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-4 h-4" /> },
        ...(user.role === 'LANDLORD' || user.role === 'ADMIN' ? [{ id: 'properties', label: 'My Properties', icon: <Building2 className="w-4 h-4" /> }] : []),
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen">
            <div className="bg-gradient-to-b from-emerald-900/20 to-transparent pt-12 pb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                            {user.name?.[0]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                            <p className="text-gray-400 text-sm">{user.email} · <span className="text-emerald-400 capitalize">{user.role.toLowerCase()}</span></p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-6 overflow-x-auto pb-1">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <DashCard title="Pending" value={pendingBookings.length} icon={<Clock className="w-5 h-5" />} color="amber" />
                            <DashCard title="Confirmed" value={confirmedBookings.length} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
                            <DashCard title="Total Bookings" value={bookings.length} icon={<Calendar className="w-5 h-5" />} color="teal" />
                            <DashCard title="Unread Messages" value={unreadMessages} icon={<MessageSquare className="w-5 h-5" />} color="cyan" />
                        </div>

                        {pendingBookings.length > 0 && (
                            <div className="glass rounded-2xl p-6">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-400" /> Pending Actions
                                </h3>
                                <div className="space-y-3">
                                    {pendingBookings.slice(0, 3).map(booking => (
                                        <BookingRow key={booking.id} booking={booking} user={user} onUpdateStatus={updateBookingStatus} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div className="space-y-3 animate-fade-in">
                        {bookings.length === 0 ? (
                            <EmptyState emoji="📅" title="No bookings yet" desc="Your bookings will appear here" />
                        ) : (
                            bookings.map(booking => <BookingRow key={booking.id} booking={booking} user={user} onUpdateStatus={updateBookingStatus} />)
                        )}
                    </div>
                )}

                {/* Properties Tab */}
                {activeTab === 'properties' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-semibold">{properties.length} Properties</h3>
                            <Link href="/dashboard/add-property" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all">
                                + Add Property
                            </Link>
                        </div>
                        {properties.length === 0 ? (
                            <EmptyState emoji="🏠" title="No properties listed" desc="Start listing your properties" />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {properties.map(prop => (
                                    <Link key={prop.id} href={`/properties/${prop.id}`} className="glass rounded-2xl p-4 hover:border-emerald-500/30 transition-all group">
                                        <h4 className="text-white font-medium group-hover:text-emerald-400 transition-colors">{prop.title}</h4>
                                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {prop.city}</span>
                                            <span className="text-emerald-400 font-medium">${Number(prop.pricePerMonth).toLocaleString()}/mo</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${prop.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{prop.status}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                    <div className="space-y-3 animate-fade-in">
                        {conversations.length === 0 ? (
                            <EmptyState emoji="💬" title="No conversations" desc="Start chatting with landlords or providers" />
                        ) : (
                            conversations.map(conv => {
                                const other = conv.participantOne?.id === user.id ? conv.participantTwo : conv.participantOne;
                                const lastMsg = conv.messages?.[0];
                                return (
                                    <Link key={conv.id} href={`/messages?conv=${conv.id}`} className="glass rounded-2xl p-4 hover:border-emerald-500/30 transition-all flex items-center gap-4 group block">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {other?.name?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">{other?.name}</p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{conv.unreadCount}</span>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-sm line-clamp-1">{lastMsg?.content || 'No messages yet'}</p>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function DashCard({ title, value, icon, color }) {
    const colors = {
        amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
        emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
        teal: 'from-teal-500/10 to-teal-500/5 border-teal-500/20 text-teal-400',
        cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
    };
    return (
        <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-2">{icon}<span className="text-2xl font-bold text-white">{value}</span></div>
            <div className="text-sm">{title}</div>
        </div>
    );
}

function BookingRow({ booking, user, onUpdateStatus }) {
    const isProvider = booking.serviceProfile?.user?.id === user.id;
    const otherName = isProvider ? booking.client?.name : booking.serviceProfile?.user?.name;
    const statusColors = {
        PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        COMPLETED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                        {otherName?.[0]}
                    </div>
                    <div>
                        <p className="text-white font-medium">{otherName}</p>
                        <p className="text-gray-400 text-xs">{booking.serviceProfile?.category?.icon} {booking.serviceProfile?.category?.name} · {new Date(booking.startTime).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold text-sm">${Number(booking.totalPrice).toFixed(0)}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[booking.status]}`}>
                        {booking.status}
                    </span>
                </div>
            </div>
            {booking.status === 'PENDING' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                    {isProvider && (
                        <button onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')} className="flex-1 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Confirm
                        </button>
                    )}
                    <button onClick={() => onUpdateStatus(booking.id, 'CANCELLED')} className="flex-1 py-2 bg-red-500/10 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                    {isProvider && booking.status === 'CONFIRMED' && (
                        <button onClick={() => onUpdateStatus(booking.id, 'COMPLETED')} className="flex-1 py-2 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Complete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function EmptyState({ emoji, title, desc }) {
    return (
        <div className="text-center py-16">
            <div className="text-5xl mb-3">{emoji}</div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{desc}</p>
        </div>
    );
}
