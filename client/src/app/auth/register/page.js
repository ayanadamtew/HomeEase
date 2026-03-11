'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { User, Mail, Lock, Loader2, ArrowRight, Building, Wrench, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CLIENT');
    const { register, loading } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password, role);
            toast.success('Account created successfully!');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-gradient flex items-center justify-center p-5 min-h-[calc(100vh-72px)] py-12">
            <div className="w-full max-w-md animate-fade-up">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 mb-4">
                        <span className="text-white text-xl font-bold font-headings">H</span>
                    </div>
                    <h1 className="text-3xl font-headings font-bold text-gray-900 tracking-tight">Create an account</h1>
                    <p className="text-gray-500 mt-2">Join HomeEase to find homes and services</p>
                </div>

                <div className="card p-8 sm:p-10 shadow-xl shadow-indigo-900/5">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 block">I want to...</label>
                            <div className="grid grid-cols-3 gap-3">
                                <RoleCard
                                    icon={<User className="w-5 h-5" />}
                                    label="Rent / Hire"
                                    active={role === 'CLIENT'}
                                    onClick={() => setRole('CLIENT')}
                                />
                                <RoleCard
                                    icon={<Building className="w-5 h-5" />}
                                    label="List Property"
                                    active={role === 'LANDLORD'}
                                    onClick={() => setRole('LANDLORD')}
                                />
                                <RoleCard
                                    icon={<Wrench className="w-5 h-5" />}
                                    label="Offer Service"
                                    active={role === 'PROVIDER'}
                                    onClick={() => setRole('PROVIDER')}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text" required
                                    value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="input !pl-11"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email" required
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input !pl-11"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password" required minLength="6"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input !pl-11"
                                />
                            </div>
                            <p className="text-[11px] text-gray-400 mt-2 font-medium">Must be at least 6 characters long.</p>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 mt-4 text-base shadow-md">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                <>Create Account <ArrowRight className="w-4 h-4 ml-1" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-gray-500 text-sm">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RoleCard({ icon, label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${active
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:bg-gray-50'
                }`}
        >
            <div className={active ? 'text-indigo-600' : 'text-gray-400'}>{icon}</div>
            <span className={`text-[11px] font-bold mt-2 uppercase tracking-wide ${active ? 'text-indigo-700' : 'text-gray-500'}`}>{label}</span>
        </button>
    );
}
