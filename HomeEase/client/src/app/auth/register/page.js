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
        <div className="min-h-screen flex items-center justify-center px-5 py-12" style={{ background: '#F8FAFC' }}>
            <div className="w-full max-w-[420px]">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center"><Home className="w-5 h-5 text-white" /></div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">Home<span className="text-indigo-500">Ease</span></span>
                    </Link>
                    <h1 className="mt-8 text-2xl font-bold text-slate-900 tracking-tight">Create your account</h1>
                    <p className="mt-1 text-slate-500 text-sm">Get started with HomeEase today</p>
                </div>

                <form onSubmit={handleSubmit} className="card p-8 !rounded-3xl space-y-4">
                    <Field icon={<User className="w-4 h-4" />} label="Full Name" type="text" value={form.name} onChange={update('name')} placeholder="John Doe" required />
                    <Field icon={<Mail className="w-4 h-4" />} label="Email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
                    <Field icon={<Lock className="w-4 h-4" />} label="Password" type="password" value={form.password} onChange={update('password')} placeholder="Min 6 characters" required />
                    <Field icon={<Phone className="w-4 h-4" />} label="Phone (optional)" type="tel" value={form.phone} onChange={update('phone')} placeholder="+1 234 567 8900" />

                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">I want to</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[{ value: 'CLIENT', label: '🏠 Rent / Book', desc: 'Find homes & services' }, { value: 'LANDLORD', label: '🏗️ List Property', desc: 'Rent out your property' }, { value: 'PROVIDER', label: '🔧 Offer Service', desc: 'Provide services' }].map((r) => (
                                <button type="button" key={r.value} onClick={() => setForm({ ...form, role: r.value })} className={`p-3 rounded-2xl text-xs font-medium border transition-all text-center ${form.role === r.value ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                                    <div className="text-base mb-0.5">{r.label.split(' ')[0]}</div>
                                    {r.label.split(' ').slice(1).join(' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full !rounded-xl !py-3.5">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>

                    <p className="text-center text-slate-500 text-sm pt-2">
                        Already have an account? <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

function Field({ icon, label, ...props }) {
    return (
        <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">{label}</label>
            <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
                <input {...props} className="input !pl-11" />
            </div>
        </div>
    );
}
