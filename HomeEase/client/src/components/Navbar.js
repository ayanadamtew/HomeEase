'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Home, Menu, X, LogOut, Building2, Wrench, MessageSquare, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black">
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
                <div className="flex items-center justify-between h-[72px]">

                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-black flex items-center justify-center transition-colors">
                            <Home className="w-[18px] h-[18px] text-white" />
                        </div>
                        <span className="text-[20px] font-black text-black tracking-tighter uppercase">
                            HomeEase
                        </span>
                    </Link>


                    <div className="hidden md:flex items-center gap-1">
                        <NavLink href="/properties" icon={<Building2 className="w-4 h-4" />}>Properties</NavLink>
                        <NavLink href="/services" icon={<Wrench className="w-4 h-4" />}>Services</NavLink>
                        {user && <NavLink href="/messages" icon={<MessageSquare className="w-4 h-4" />}>Messages</NavLink>}
                        {user && <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>Dashboard</NavLink>}
                        {user?.role === 'ADMIN' && <NavLink href="/dashboard/admin" icon={<LayoutDashboard className="w-4 h-4 text-black" />}>Admin Panel</NavLink>}
                    </div>


                    <div className="hidden md:flex items-center gap-3">
                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center text-black text-sm font-bold uppercase">
                                    {user.name?.[0]}
                                </div>
                                <button onClick={logout} className="p-2 hover:bg-gray-100 text-gray-500 hover:text-black transition-colors" title="Logout">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/auth/login" className="px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-black transition-colors uppercase tracking-wider">
                                    Log in
                                </Link>
                                <Link href="/auth/register" className="btn-primary !px-6 !py-2.5 !text-sm !uppercase !tracking-wider">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>


                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-black">
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>


            {mobileOpen && (
                <div className="md:hidden bg-white border-b border-black pb-4 animate-slide-down">
                    <div className="px-5 pt-2 space-y-1">
                        <MobileLink href="/properties" onClick={() => setMobileOpen(false)}>🏠 Properties</MobileLink>
                        <MobileLink href="/services" onClick={() => setMobileOpen(false)}>🔧 Services</MobileLink>
                        {user && <MobileLink href="/messages" onClick={() => setMobileOpen(false)}>💬 Messages</MobileLink>}
                        {user ? (
                            <>
                                <MobileLink href="/dashboard" onClick={() => setMobileOpen(false)}>📊 Dashboard</MobileLink>
                                {user.role === 'ADMIN' && <MobileLink href="/dashboard/admin" onClick={() => setMobileOpen(false)}>🛡️ Admin Panel</MobileLink>}
                                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <MobileLink href="/auth/login" onClick={() => setMobileOpen(false)}>Log in</MobileLink>
                                <MobileLink href="/auth/register" onClick={() => setMobileOpen(false)}>Get Started</MobileLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

function NavLink({ href, children, icon }) {
    return (
        <Link href={href} className="flex items-center gap-1.5 px-4 py-2 text-[14px] font-bold text-gray-500 hover:text-black hover:bg-gray-50 transition-all duration-150 uppercase tracking-widest">
            {icon}{children}
        </Link>
    );
}

function MobileLink({ href, children, onClick }) {
    return (
        <Link href={href} onClick={onClick} className="block px-4 py-2.5 text-black hover:bg-gray-100 transition-colors text-sm font-bold uppercase tracking-wider">
            {children}
        </Link>
    );
}
