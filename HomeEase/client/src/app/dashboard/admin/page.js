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

    if (loading) return <div className="p-8 text-center text-slate-500">Loading admin dashboard...</div>;

    if (user?.role !== 'ADMIN') {
        return (
            <div className="p-12 text-center text-slate-600 bg-red-50 mt-10 rounded-2xl">
                <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-900 mb-2">Access Restricted</h2>
                <p>You do not have administrative privileges to view this page.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-5 sm:p-8 pt-28">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-indigo-600" />
                    Admin Control Panel
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Review and approve enterprise Trust & Safety metrics.</p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    Pending KYC Verifications
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold ml-2">
                        {pendingRequests.length}
                    </span>
                </h3>

                {pendingRequests.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">All caught up! No pending KYC requests.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingRequests.map(reqUser => (
                            <div key={reqUser.id} className="border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow bg-slate-50/50">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg mb-1">{reqUser.name} <span className="text-sm font-medium text-slate-400 ml-2">({reqUser.role})</span></h4>
                                    <p className="text-slate-500 mb-3">{reqUser.email}</p>

                                    <div className="flex items-center gap-2">
                                        <a
                                            href={reqUser.identityDocumentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View Submitted Document
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => handleKycAction(reqUser.id, 'APPROVED')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
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
