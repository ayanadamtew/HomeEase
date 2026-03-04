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
        try { setLoading(true); await login(email, password); toast.success('Welcome back!'); router.push('/'); }
        catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#F8FAFC' }}>
            <div className="w-full max-w-[420px]">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center"><Home className="w-5 h-5 text-white" /></div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">Home<span className="text-indigo-500">Ease</span></span>
                    </Link>
                    <h1 className="mt-8 text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
                    <p className="mt-1 text-slate-500 text-sm">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="card p-8 !rounded-3xl space-y-5">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="input !pl-11" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="input !pl-11" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full !rounded-xl !py-3.5">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="relative my-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div><div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400 font-medium">DEMO ACCOUNTS</span></div></div>

                    <div className="grid grid-cols-2 gap-2">
                        {[{ label: 'Client', email: 'client@demo.com', pw: 'demo123' }, { label: 'Landlord', email: 'landlord@demo.com', pw: 'demo123' }, { label: 'Provider', email: 'provider@demo.com', pw: 'demo123' }, { label: 'Admin', email: 'admin@homeease.com', pw: 'admin123' }].map((d) => (
                            <button type="button" key={d.label} onClick={() => { setEmail(d.email); setPassword(d.pw); }} className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all">
                                {d.label}
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-slate-500 text-sm pt-2">
                        Don&apos;t have an account? <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
