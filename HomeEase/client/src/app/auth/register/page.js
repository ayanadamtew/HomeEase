'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Home } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'CLIENT' });
    const [loading, setLoading] = useState(false);

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        try {
            setLoading(true);
            await register(form);
            toast.success('Account created! Welcome to HomeEase.');
            router.push('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">HomeEase</span>
                    </Link>
                    <h1 className="mt-6 text-2xl font-bold text-white">Create Account</h1>
                    <p className="mt-1 text-gray-400 text-sm">Join HomeEase today</p>
                </div>

                <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-4">
                    <FormField icon={<User />} label="Full Name" type="text" value={form.name} onChange={update('name')} placeholder="John Doe" required />
                    <FormField icon={<Mail />} label="Email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
                    <FormField icon={<Lock />} label="Password" type="password" value={form.password} onChange={update('password')} placeholder="Min 6 characters" required />
                    <FormField icon={<Phone />} label="Phone (optional)" type="tel" value={form.phone} onChange={update('phone')} placeholder="+1 234 567 8900" />

                    <div>
                        <label className="text-sm font-medium text-gray-300 block mb-1.5">I want to</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'CLIENT', label: 'Rent / Book' },
                                { value: 'LANDLORD', label: 'List Property' },
                                { value: 'PROVIDER', label: 'Offer Services' },
                            ].map((r) => (
                                <button
                                    type="button"
                                    key={r.value}
                                    onClick={() => setForm({ ...form, role: r.value })}
                                    className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${form.role === r.value
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                            : 'bg-gray-800 border-white/5 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>

                    <p className="text-center text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

function FormField({ icon, label, ...inputProps }) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">{label}</label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500">
                    {icon}
                </div>
                <input
                    {...inputProps}
                    className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                />
            </div>
        </div>
    );
}
