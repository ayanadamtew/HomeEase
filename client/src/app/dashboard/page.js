'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { propertiesAPI, servicesAPI, bookingsAPI, messagesAPI, usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Building2, Wrench, MessageSquare, Calendar, Loader2, Plus, Clock, MapPin, CheckCircle2, ChevronRight, LayoutDashboard, Settings, ListPlus, Star } from 'lucide-react';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('overview');
    const [properties, setProperties] = useState([]);
    const [serviceProfile, setServiceProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) { router.push('/auth/login'); return; }
        if (!user) return;

        const fetchData = async () => {
            try {
                if (user.role === 'LANDLORD' || user.role === 'ADMIN') { const p = await propertiesAPI.getMyProperties(); setProperties(p.data.properties); }
                if (user.role === 'PROVIDER' || user.role === 'ADMIN') { try { const sp = await servicesAPI.getMyProfile(); setServiceProfile(sp.data.profile); } catch (e) { } }
                const [bRes, mRes] = await Promise.all([bookingsAPI.getMyBookings(), messagesAPI.getConversations()]);
                setBookings(bRes.data.bookings); setMessages(mRes.data.conversations);
            } catch (err) { }
            finally { setLoadingData(false); }
        };
        fetchData();
    }, [user, authLoading]);

    if (authLoading || loadingData) return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mr-4" /> <span className="font-medium text-lg">Loading dashboard...</span></div>;
    if (!user) return null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-4 h-4" /> },
        ...(user.role === 'LANDLORD' || user.role === 'ADMIN' ? [{ id: 'properties', label: 'My Properties', icon: <Building2 className="w-4 h-4" /> }] : []),
        ...(user.role === 'PROVIDER' || user.role === 'ADMIN' ? [{ id: 'service', label: 'Service Profile', icon: <Wrench className="w-4 h-4" /> }] : []),
        { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-slate-800 text-white pt-12 pb-24">
                <div className="max-w-7xl mx-auto px-5 sm:px-8">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold backdrop-blur-sm shadow-xl">
                            {user.name?.[0]}
                        </div>
                        <div>
                            <h1 className="text-3xl font-headings font-bold tracking-tight">Welcome back, {user.name?.split(' ')[0]}</h1>
                            <p className="text-indigo-200 font-medium mt-1 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/30 rounded text-xs font-bold uppercase tracking-wider">{user.role}</span>
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-8 -mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Nav */}
                    <div className="card p-4 border-none shadow-md shadow-gray-200/50 bg-white/90 backdrop-blur-xl h-fit sticky top-24">
                        <nav className="flex flex-col gap-1.5">
                            {tabs.map(t => (
                                <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === t.id ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                    <div className={activeTab === t.id ? 'text-indigo-600' : 'text-gray-400'}>{t.icon}</div>
                                    {t.label}
                                </button>
                            ))}
                        </nav>
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <Link href="/auth/login" className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
                                <Settings className="w-4 h-4 text-gray-400" /> Account Settings
                            </Link>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <MetricCard label="Active Bookings" value={bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length} icon={<Calendar className="text-indigo-600" />} color="indigo" />
                                    <MetricCard label="Unread Msgs" value={messages.length} icon={<MessageSquare className="text-blue-600" />} color="blue" />
                                    {user.role === 'LANDLORD' && <MetricCard label="Properties" value={properties.length} icon={<Building2 className="text-emerald-600" />} color="emerald" />}
                                    {user.role === 'PROVIDER' && <MetricCard label="Reviews" value={serviceProfile?._count?.reviews || 0} icon={<Star className="text-amber-600" />} color="amber" />}
                                </div>
                                <RoleQuickCards role={user.role} propertiesCount={properties.length} hasProfile={!!serviceProfile} />
                            </div>
                        )}

                        {activeTab === 'bookings' && (
                            <div className="card p-8 border-none shadow-sm animate-fade-in">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-500" /> Bookings & Appointments</h2>
                                {bookings.length === 0 ? (
                                    <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border shadow-sm"><Calendar className="w-6 h-6 text-gray-400" /></div>
                                        <p className="text-gray-900 font-bold text-lg">No active bookings</p>
                                        <p className="text-gray-500 text-sm mt-1">When you request a service, it will appear here.</p>
                                        <Link href="/services" className="btn-secondary mt-6">Find Services</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {bookings.map(b => (
                                            <div key={b.id} className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-indigo-100 hover:shadow-md transition-all">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100 shrink-0">
                                                    {b.serviceProfile?.user?.name?.[0] || 'S'}
                                                </div>
                                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                                    <h4 className="font-bold text-gray-900 truncate">{b.serviceProfile?.serviceType || 'Service Booking'}</h4>
                                                    <p className="text-sm font-medium text-gray-500 flex items-center justify-center sm:justify-start gap-1.5 mt-1"><Clock className="w-3.5 h-3.5" /> {new Date(b.startTime).toLocaleString()} - {new Date(b.endTime).toLocaleTimeString()}</p>
                                                </div>
                                                <div className="flex shrink-0">
                                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${b.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                        {b.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'properties' && (
                            <div className="card p-8 border-none shadow-sm animate-fade-in">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-indigo-500" /> Managed Properties</h2>
                                    <Link href="/dashboard/add-property" className="btn-primary !px-4 !py-2 !text-sm"><Plus className="w-4 h-4" /> Add Property</Link>
                                </div>
                                {properties.length === 0 ? (
                                    <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border shadow-sm"><Building2 className="w-6 h-6 text-gray-400" /></div>
                                        <p className="text-gray-900 font-bold text-lg">No properties listed</p>
                                        <p className="text-gray-500 text-sm mt-1">Start monetizing your real estate by listing a property.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {properties.map(p => (
                                            <div key={p.id} className="group border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-100 transition-all">
                                                <div className="h-32 bg-gray-100 relative overflow-hidden">
                                                    {p.images?.[0] ? <img src={p.images[0].imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex justify-center items-center text-gray-300">No Image</div>}
                                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                                                        ETB {Number(p.pricePerMonth).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-gray-900 truncate">{p.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5" /> {p.city}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'service' && (
                            <div className="card p-8 border-none shadow-sm animate-fade-in">
                                <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2"><Wrench className="w-5 h-5 text-indigo-500" /> Service Profile</h2>
                                {!serviceProfile ? (
                                    <div className="text-center py-16 px-4 bg-indigo-50/50 rounded-2xl border border-dashed border-indigo-200">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm"><ListPlus className="w-6 h-6 text-indigo-500" /></div>
                                        <p className="text-gray-900 font-bold text-lg">Set up your profile</p>
                                        <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto mb-6">Create a profile to showcase your skills, set your rates, and start receiving booking requests.</p>
                                        <Link href="/dashboard/provider-profile" className="btn-primary">Create Service Profile</Link>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-start justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-6 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                            <div className="relative">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900">{serviceProfile.serviceType}</h3>
                                                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${serviceProfile.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                        {serviceProfile.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 font-medium mb-4">{serviceProfile.headline}</p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="font-bold text-gray-900">ETB {Number(serviceProfile.hourlyRate).toFixed(0)}<span className="text-gray-400 font-medium">/hr</span></span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-gray-600 font-medium flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {serviceProfile.serviceArea}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pr-2">
                                            <Link href="/dashboard/provider-profile" className="btn-secondary !text-sm"><Settings className="w-4 h-4" /> Edit Profile</Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div className="card p-8 border-none shadow-sm animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-indigo-500" /> Recent Messages</h2>
                                    <Link href="/messages" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center">Open full inbox <ChevronRight className="w-4 h-4" /></Link>
                                </div>
                                {messages.length === 0 ? (
                                    <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border shadow-sm"><MessageSquare className="w-6 h-6 text-gray-400" /></div>
                                        <p className="text-gray-900 font-bold text-lg">Your inbox is empty</p>
                                        <p className="text-gray-500 text-sm mt-1">Messages from clients or landlords will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {messages.slice(0, 5).map(c => {
                                            const otherUser = c.participants.find(p => p.id !== user.id) || c.participants[0];
                                            const lastMsg = c.messages[0];
                                            return (
                                                <Link key={c.id} href={`/messages?conv=${c.id}`} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-colors group">
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">{otherUser.name?.[0]}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <h4 className="font-bold text-gray-900 truncate">{otherUser.name}</h4>
                                                            {lastMsg && <span className="text-xs font-semibold text-gray-400">{new Date(lastMsg.createdAt).toLocaleDateString()}</span>}
                                                        </div>
                                                        {lastMsg ? <p className="text-sm font-medium text-gray-500 truncate">{lastMsg.content}</p> : <p className="text-sm font-medium text-gray-400 italic">No messages yet</p>}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon, color }) {
    const bgs = { indigo: 'bg-indigo-50 border-indigo-100', blue: 'bg-blue-50 border-blue-100', emerald: 'bg-emerald-50 border-emerald-100', amber: 'bg-amber-50 border-amber-100' };
    return (
        <div className="card p-5 border-none shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${bgs[color]}`}>{icon}</div>
            <div className="text-3xl font-headings font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</div>
        </div>
    );
}

function RoleQuickCards({ role, propertiesCount, hasProfile }) {
    if (role === 'CLIENT') return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {role === 'LANDLORD' || role === 'ADMIN' ? (
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-indigo-900/20">
                    <div className="absolute -right-4 -top-4 text-white/10"><Building2 className="w-32 h-32" /></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Grow your portfolio</h3>
                        <p className="text-indigo-200 text-sm mb-6 max-w-sm line-clamp-2">List your properties and start receiving inquiries from verified renters on HomeEase.</p>
                        <Link href="/dashboard/add-property" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all"><Plus className="w-5 h-5" /> Add Property</Link>
                    </div>
                </div>
            ) : null}
            {role === 'PROVIDER' || role === 'ADMIN' ? (
                <div className="bg-gradient-to-br from-teal-600 to-emerald-700 p-8 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-teal-900/20">
                    <div className="absolute -right-4 -top-4 text-white/10"><Wrench className="w-32 h-32" /></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">{hasProfile ? 'Update your services' : 'Offer your services'}</h3>
                        <p className="text-teal-100 text-sm mb-6 max-w-sm line-clamp-2">{hasProfile ? 'Keep your availability and rates up to date to attract more clients.' : 'Create a profile to showcase your skills and start getting booked.'}</p>
                        <Link href="/dashboard/provider-profile" className="inline-flex items-center gap-2 bg-white text-teal-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all"><Plus className="w-5 h-5" /> {hasProfile ? 'Edit Profile' : 'Create Profile'}</Link>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
