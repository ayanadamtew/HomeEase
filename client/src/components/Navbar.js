'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Home, Menu, X, LogOut, Building2, Wrench, MessageSquare, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
                <div className="flex items-center justify-between h-[72px]">

                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center rounded-xl transition-transform group-hover:scale-105 shadow-md shadow-indigo-200">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-headings font-bold text-gray-900 tracking-tight">Home<span className="text-indigo-600">Ease</span></span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        <NavLink href="/properties" active={pathname === '/properties'}>Properties</NavLink>
                        <NavLink href="/services" active={pathname === '/services'}>Services</NavLink>
                        {user && <NavLink href="/messages" active={pathname === '/messages'} icon={<MessageSquare className="w-4 h-4" />}>Messages</NavLink>}
                        {user && <NavLink href="/dashboard" active={pathname === '/dashboard'} icon={<LayoutDashboard className="w-4 h-4" />}>Dashboard</NavLink>}
                        {user?.role === 'ADMIN' && <NavLink href="/dashboard/admin" active={pathname === '/dashboard/admin'} icon={<LayoutDashboard className="w-4 h-4" />}>Admin</NavLink>}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {loading ? (
                            <div className="w-8 h-8 bg-gray-100 animate-pulse rounded-full" />
                        ) : user ? (
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-semibold">
                                    {user.name?.[0]}
                                </div>
                                <button onClick={logout} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all rounded-lg" title="Logout">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50">
                                    Log in
                                </Link>
                                <Link href="/auth/register" className="btn-primary !px-5 !py-2.5 !text-sm">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 pb-4 animate-slide-down shadow-lg">
                    <div className="px-5 pt-2 space-y-1">
                        <MobileLink href="/properties" onClick={() => setMobileOpen(false)}>🏠 Properties</MobileLink>
                        <MobileLink href="/services" onClick={() => setMobileOpen(false)}>🔧 Services</MobileLink>
                        {user && <MobileLink href="/messages" onClick={() => setMobileOpen(false)}>💬 Messages</MobileLink>}
                        {user ? (
                            <>
                                <MobileLink href="/dashboard" onClick={() => setMobileOpen(false)}>📊 Dashboard</MobileLink>
                                {user.role === 'ADMIN' && <MobileLink href="/dashboard/admin" onClick={() => setMobileOpen(false)}>🛡️ Admin Panel</MobileLink>}
                                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all text-sm font-medium mt-3">
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

function NavLink({ href, children, icon, active }) {
    return (
        <Link href={href} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${active ? 'text-indigo-700 bg-indigo-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
            {icon}{children}
        </Link>
    );
}

function MobileLink({ href, children, onClick }) {
    return (
        <Link href={href} onClick={onClick} className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-sm font-medium">
            {children}
        </Link>
    );
}
