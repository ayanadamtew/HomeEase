'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, Loader2, Home } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'CLIENT' });
    const [loading, setLoading] = useState(false);
    const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        try { setLoading(true); await register(form); toast.success('Welcome to HomeEase!'); router.push('/'); }
        catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-5 py-20 bg-white">
            <div className="w-full max-w-[420px]">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-black flex items-center justify-center border border-black transition-transform group-hover:scale-105"><Home className="w-6 h-6 text-white" /></div>
                        <span className="text-2xl font-headings text-black tracking-widest uppercase">Home<span className="text-gray-400">Ease</span></span>
                    </Link>
                    <h1 className="mt-10 text-[40px] sm:text-[56px] font-headings text-black tracking-tight uppercase leading-none">Create your account</h1>
                    <p className="mt-3 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Get started with HomeEase today</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-black p-10 sm:p-14 space-y-6">
                    <Field icon={<User className="w-4 h-4 text-black" />} label="Full Name" type="text" value={form.name} onChange={update('name')} placeholder="John Doe" required />
                    <Field icon={<Mail className="w-4 h-4 text-black" />} label="Email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
                    <Field icon={<Lock className="w-4 h-4 text-black" />} label="Password" type="password" value={form.password} onChange={update('password')} placeholder="Min 6 characters" required />
                    <Field icon={<Phone className="w-4 h-4 text-black" />} label="Phone (optional)" type="tel" value={form.phone} onChange={update('phone')} placeholder="+1 234 567 8900" />

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">I want to</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[{ value: 'CLIENT', label: '🏠 Rent / Book' }, { value: 'LANDLORD', label: '🏗️ List Property' }, { value: 'PROVIDER', label: '🔧 Offer Service' }].map((r) => (
                                <button type="button" key={r.value} onClick={() => setForm({ ...form, role: r.value })} className={`p-6 text-[11px] font-headings uppercase tracking-widest border transition-all text-center ${form.role === r.value ? 'bg-black border-black text-white' : 'bg-white border-black text-black hover:bg-gray-50'}`}>
                                    <div className="text-2xl mb-2">{r.label.split(' ')[0]}</div>
                                    {r.label.split(' ').slice(1).join(' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full !py-5 uppercase tracking-[0.2em] text-[11px] mt-6">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}
                    </button>

                    <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest pt-4">
                        Already have an account? <Link href="/auth/login" className="text-black hover:underline">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

function Field({ icon, label, ...props }) {
    return (
        <div>
            <label className="text-[10px] font-headings text-black uppercase tracking-[0.3em] mb-3 block">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">{icon}</div>
                <input {...props} className="input !pl-12 !py-5 !bg-gray-50 !border-gray-200 focus:!border-black" />
            </div>
        </div>
    );
}
