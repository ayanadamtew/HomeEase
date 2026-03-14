'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Menu, X, LogOut, Building2, Wrench, MessageSquare, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navBg = scrolled ? 'bg-white/90 backdrop-blur-2xl border-b border-gray-100/50 shadow-lg' : 'bg-transparent border-b border-transparent';
    const logoColor = scrolled ? 'text-gray-900' : 'text-gray-900'; // Keep consistent for now or shift vs dark bg

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
                <div className="flex items-center justify-between h-[72px]">

                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br flex items-center justify-center rounded-xl transition-transform group-hover:scale-105 shadow-md shadow-blue-200 overflow-hidden">
                            <img src="/favicon.png" alt="HomeEase Logo" className="w-6 h-6 object-contain" />
                        </div>
                        <span className="text-xl font-headings font-bold text-gray-900 tracking-tight">Home<span className="text-blue-600">Ease</span></span>
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
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-semibold">
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
                                <Link href="/auth/register" className="btn-accent !px-5 !py-2.5 !text-sm">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-700 hover:bg-white/10'}`}
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-gray-900/20 backdrop-blur-md z-[-1]"
                        />
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="md:hidden bg-white border-b border-gray-100 overflow-hidden shadow-2xl"
                        >
                            <div className="px-5 pt-4 pb-8 space-y-2">
                                <MobileLink delay={0.1} href="/properties" onClick={() => setMobileOpen(false)}>Properties</MobileLink>
                                <MobileLink delay={0.2} href="/services" onClick={() => setMobileOpen(false)}>Services</MobileLink>
                                {user && <MobileLink delay={0.3} href="/messages" onClick={() => setMobileOpen(false)}>Messages</MobileLink>}
                                {user ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="pt-4 mt-4 border-t border-gray-50"
                                    >
                                        <MobileLink href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
                                        {user.role === 'ADMIN' && <MobileLink href="/dashboard/admin" onClick={() => setMobileOpen(false)}>Admin Panel</MobileLink>}
                                        <button
                                            onClick={() => { logout(); setMobileOpen(false); }}
                                            className="w-full text-left px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-all text-[15px] font-semibold mt-2"
                                        >
                                            Sign out
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50"
                                    >
                                        <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center px-4 py-3 text-[15px] font-semibold text-gray-700 bg-gray-50 rounded-xl">
                                            Log in
                                        </Link>
                                        <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn-accent !py-3 rounded-xl shadow-lg shadow-amber-900/10">
                                            Register
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}

function NavLink({ href, children, icon, active }) {
    return (
        <Link href={href} className={`relative flex items-center gap-1.5 px-4 py-2 text-[14px] font-semibold transition-colors duration-300 ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
            {active && (
                <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-blue-50 rounded-xl z-[-1]"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                />
            )}
            {icon}
            {children}
        </Link>
    );
}

function MobileLink({ href, children, onClick, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
        >
            <Link
                href={href}
                onClick={onClick}
                className="flex items-center gap-3 px-4 py-3.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all text-[15px] font-semibold"
            >
                {children}
            </Link>
        </motion.div>
    );
}
