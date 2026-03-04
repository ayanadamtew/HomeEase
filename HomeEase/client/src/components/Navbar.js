'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Home, Search, Menu, X, User, LogOut, Building2, Wrench, MessageSquare, ChevronDown } from 'lucide-react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
                <div className="flex items-center justify-between h-[72px]">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:bg-indigo-600 transition-all duration-200">
                            <Home className="w-[18px] h-[18px] text-white" />
                        </div>
                        <span className="text-[20px] font-bold text-slate-900 tracking-tight">
                            Home<span className="text-indigo-500">Ease</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink href="/properties" icon={<Building2 className="w-4 h-4" />}>Properties</NavLink>
                        <NavLink href="/services" icon={<Wrench className="w-4 h-4" />}>Services</NavLink>
                        {user && <NavLink href="/messages" icon={<MessageSquare className="w-4 h-4" />}>Messages</NavLink>}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-2">
                                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-700">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-sm font-semibold">
                                        {user.name?.[0]}
                                    </div>
                                    <span className="text-sm font-medium">{user.name?.split(' ')[0]}</span>
                                </Link>
                                <button onClick={logout} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/auth/login" className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                                    Log in
                                </Link>
                                <Link href="/auth/register" className="btn-primary !py-2.5 !px-5 !text-sm !rounded-xl">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-slate-50 text-slate-600">
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-b border-slate-100 pb-4 animate-slide-down">
                    <div className="px-5 pt-2 space-y-1">
                        <MobileLink href="/properties" onClick={() => setMobileOpen(false)}>🏠 Properties</MobileLink>
                        <MobileLink href="/services" onClick={() => setMobileOpen(false)}>🔧 Services</MobileLink>
                        {user && <MobileLink href="/messages" onClick={() => setMobileOpen(false)}>💬 Messages</MobileLink>}
                        {user ? (
                            <>
                                <MobileLink href="/dashboard" onClick={() => setMobileOpen(false)}>📊 Dashboard</MobileLink>
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
        <Link href={href} className="flex items-center gap-1.5 px-4 py-2 text-[14px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-150">
            {icon}{children}
        </Link>
    );
}

function MobileLink({ href, children, onClick }) {
    return (
        <Link href={href} onClick={onClick} className="block px-4 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-sm font-medium">
            {children}
        </Link>
    );
}
