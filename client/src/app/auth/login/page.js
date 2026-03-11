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
        <div className="min-h-screen flex items-center justify-center px-5 bg-white">
            <div className="w-full max-w-[420px]">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-black flex items-center justify-center border border-black transition-transform group-hover:scale-105"><Home className="w-6 h-6 text-white" /></div>
                        <span className="text-2xl font-headings text-black tracking-widest uppercase">Home<span className="text-gray-400">Ease</span></span>
                    </Link>
                    <h1 className="mt-10 text-[40px] sm:text-[56px] font-headings text-black tracking-tight uppercase leading-none">Welcome back</h1>
                    <p className="mt-3 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-black p-10 sm:p-14 space-y-8">
                    <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-3 block">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" strokeWidth={3} />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="input !pl-12 !py-5 !bg-gray-50 !border-gray-200 focus:!border-black" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-3 block">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" strokeWidth={3} />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="input !pl-12 !py-5 !bg-gray-50 !border-gray-200 focus:!border-black" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full !py-5 uppercase tracking-[0.2em] text-[11px] mt-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In To Account'}
                    </button>

                    <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest pt-4">
                        Don&apos;t have an account? <Link href="/auth/register" className="text-black hover:underline">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
