'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Home, Search, Menu, X, User, LogOut, Building2, Wrench, MessageSquare } from 'lucide-react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                            HomeEase
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink href="/properties" icon={<Building2 className="w-4 h-4" />}>Properties</NavLink>
                        <NavLink href="/services" icon={<Wrench className="w-4 h-4" />}>Services</NavLink>
                        {user && (
                            <NavLink href="/messages" icon={<MessageSquare className="w-4 h-4" />}>Messages</NavLink>
                        )}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-white">
                                    <User className="w-4 h-4" />
                                    <span className="text-sm font-medium">{user.name}</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/auth/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                                    Log In
                                </Link>
                                <Link href="/auth/register" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-gray-950/95 backdrop-blur-xl border-b border-white/10 pb-4">
                    <div className="px-4 pt-2 space-y-1">
                        <MobileLink href="/properties" onClick={() => setMobileOpen(false)}>🏠 Properties</MobileLink>
                        <MobileLink href="/services" onClick={() => setMobileOpen(false)}>🔧 Services</MobileLink>
                        {user && <MobileLink href="/messages" onClick={() => setMobileOpen(false)}>💬 Messages</MobileLink>}
                        {user ? (
                            <>
                                <MobileLink href="/dashboard" onClick={() => setMobileOpen(false)}>👤 Dashboard</MobileLink>
                                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors">
                                    🚪 Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <MobileLink href="/auth/login" onClick={() => setMobileOpen(false)}>Log In</MobileLink>
                                <MobileLink href="/auth/register" onClick={() => setMobileOpen(false)}>Sign Up</MobileLink>
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
        <Link href={href} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            {icon}
            {children}
        </Link>
    );
}

function MobileLink({ href, children, onClick }) {
    return (
        <Link href={href} onClick={onClick} className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            {children}
        </Link>
    );
}
