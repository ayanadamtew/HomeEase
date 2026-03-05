'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Home, Menu, X, LogOut, Building2, Wrench, MessageSquare, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname(); // Added this line to get the current pathname

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black">
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
                <div className="flex items-center justify-between h-[72px]">

                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-black flex items-center justify-center border border-black transition-transform group-hover:scale-105"><Home className="w-5 h-5 text-white" /></div>
                        <span className="text-3xl font-headings text-black tracking-tighter">Home<span className="text-gray-400">Ease</span></span>
                    </Link>


                    <div className="hidden md:flex items-center gap-10">
                        <NavLink href="/properties" active={pathname === '/properties'}>Properties</NavLink>
                        <NavLink href="/services" active={pathname === '/services'}>Services</NavLink>
                        {user && <NavLink href="/messages" icon={<MessageSquare className="w-4 h-4" />}>Messages</NavLink>}
                        {user && <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>Dashboard</NavLink>}
                        {user?.role === 'ADMIN' && <NavLink href="/dashboard/admin" icon={<LayoutDashboard className="w-4 h-4 text-black" />}>Admin Panel</NavLink>}
                    </div>


                    <div className="hidden md:flex items-center gap-3">
                        {loading ? (
                            <div className="w-8 h-8 bg-gray-50 animate-pulse border border-gray-100" />
                        ) : user ? (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-50 border border-gray-200 flex items-center justify-center text-black text-sm font-bold uppercase">
                                    {user.name?.[0]}
                                </div>
                                <button onClick={logout} className="p-2 hover:bg-gray-50 text-gray-400 hover:text-black transition-colors" title="Logout">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/auth/login" className="px-4 py-2.5 text-[11px] font-accent text-gray-400 hover:text-black transition-colors tracking-[0.2em]">
                                    Log in
                                </Link>
                                <Link href="/auth/register" className="btn-primary !px-8 !py-2.5 !text-[11px] !tracking-[0.2em] font-accent">
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
                                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-4 py-2.5 text-black hover:bg-gray-50 border border-black transition-all text-xs font-black uppercase tracking-widest mt-4">
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
        <Link href={href} className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-accent tracking-[0.05em] transition-all duration-150 ${active ? 'text-black border-b border-black' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}>
            {icon}{children}
        </Link>
    );
}

function MobileLink({ href, children, onClick }) {
    return (
        <Link href={href} onClick={onClick} className="block px-4 py-3 text-black hover:bg-gray-50 border-l border-transparent hover:border-black transition-all text-sm font-accent tracking-[0.1em]">
            {children}
        </Link>
    );
}
