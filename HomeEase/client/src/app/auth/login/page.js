'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Loader2, Home } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await login(email, password);
            toast.success('Welcome back!');
            router.push('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">HomeEase</span>
                    </Link>
                    <h1 className="mt-6 text-2xl font-bold text-white">Welcome Back</h1>
                    <p className="mt-1 text-gray-400 text-sm">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
                    <div>
                        <label className="text-sm font-medium text-gray-300 block mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-300 block mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {/* Demo accounts */}
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-gray-500 text-xs text-center mb-3">Quick demo login:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'Client', email: 'client@demo.com' },
                                { label: 'Landlord', email: 'landlord@demo.com' },
                                { label: 'Provider', email: 'provider@demo.com' },
                                { label: 'Admin', email: 'admin@homeease.com' },
                            ].map((demo) => (
                                <button
                                    type="button"
                                    key={demo.label}
                                    onClick={() => { setEmail(demo.email); setPassword(demo.label === 'Admin' ? 'admin123' : 'demo123'); }}
                                    className="px-3 py-1.5 bg-gray-800/50 border border-white/5 rounded-lg text-xs text-gray-400 hover:text-emerald-400 hover:border-emerald-500/20 transition-colors"
                                >
                                    {demo.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-gray-400 text-sm">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
