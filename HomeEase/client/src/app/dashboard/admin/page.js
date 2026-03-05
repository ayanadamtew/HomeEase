'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ShieldCheck, ShieldAlert, XCircle, CheckCircle, ExternalLink } from 'lucide-react';

export default function AdminKycDashboard() {
    const { user } = useAuth();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchKycRequests = async () => {
        try {
            const res = await api.get('/admin/kyc');
            setPendingRequests(res.data.users);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch KYC requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchKycRequests();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleKycAction = async (userId, action) => {
        try {
            await api.put(`/admin/kyc/${userId}`, { status: action });
            toast.success(`User KYC has been ${action.toLowerCase()}`);
            setPendingRequests(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${action} user`);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Loading admin dashboard...</div>;

    if (user?.role !== 'ADMIN') {
        return (
            <div className="p-16 text-center bg-black text-white mt-20 border border-black">
                <ShieldAlert className="w-16 h-16 text-white mx-auto mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-3">Access Restricted</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">You do not have administrative privileges to view this page.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-5 sm:p-8 pt-32">
            <div className="mb-12">
                <h1 className="text-[40px] sm:text-[56px] font-black text-black tracking-tighter uppercase leading-none flex items-center gap-4">
                    <ShieldCheck className="w-12 h-12 text-black" />
                    Admin Panel
                </h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-4">Review and approve enterprise Trust & Safety metrics.</p>
            </div>

            <div className="bg-white p-8 sm:p-12 border border-black">
                <h3 className="text-xl font-black text-black uppercase tracking-tighter mb-10 flex items-center gap-3">
                    Pending KYC Verifications
                    <span className="bg-black text-white px-4 py-1.5 text-xs font-black tracking-widest ml-4">
                        {pendingRequests.length}
                    </span>
                </h3>

                {pendingRequests.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 border border-black">
                        <CheckCircle className="w-12 h-12 text-black mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">All caught up! No pending KYC requests.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pendingRequests.map(reqUser => (
                            <div key={reqUser.id} className="border border-black p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-gray-50/30">
                                <div>
                                    <h4 className="font-black text-black text-xl uppercase tracking-tighter mb-2">{reqUser.name} <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">({reqUser.role})</span></h4>
                                    <p className="text-gray-500 text-sm font-medium mb-6">{reqUser.email}</p>
                                    <h4 className="font-black text-black text-xl uppercase tracking-tighter mb-2">{reqUser.name} <span className="text-[10px] font-black uppercase tracking-widest text-black ml-4">({reqUser.role})</span></h4>
                                    <p className="text-black text-sm font-medium mb-6">{reqUser.email}</p>

                                    <div className="flex items-center gap-2">
                                        <a
                                            href={reqUser.identityDocumentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-black bg-white border border-black px-5 py-2.5 hover:bg-black hover:text-white transition-all"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View Submitted Document
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => handleKycAction(reqUser.id, 'APPROVED')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleKycAction(reqUser.id, 'REJECTED')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 px-5 py-2.5 rounded-xl font-medium transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
