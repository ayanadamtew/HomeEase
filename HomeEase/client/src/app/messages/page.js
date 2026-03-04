'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { messagesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Send, Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { Suspense } from 'react';

function MessagesContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const convId = searchParams.get('conv');
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!authLoading && !user) { router.push('/auth/login'); return; }
        if (!user) return;
        messagesAPI.getConversations().then(r => { setConversations(r.data.conversations); if (convId) { const f = r.data.conversations.find(c => c.id === convId); if (f) setActiveConv(f); } }).finally(() => setLoading(false));
    }, [user, authLoading]);

    useEffect(() => {
        if (!activeConv) return;
        messagesAPI.getMessages(activeConv.id).then(r => { setMessages(r.data.messages); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); });
    }, [activeConv]);

    const handleSend = async (e) => {
        e.preventDefault(); if (!newMessage.trim()) return;
        try { setSending(true); const r = await messagesAPI.sendMessage(activeConv.id, newMessage.trim()); setMessages(p => [...p, r.data.message]); setNewMessage(''); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }
        catch { toast.error('Failed'); } finally { setSending(false); }
    };

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 text-indigo-500 animate-spin" /></div>;
    const getOther = (c) => c.participantOne?.id === user?.id ? c.participantTwo : c.participantOne;

    return (
        <div className="min-h-[calc(100vh-72px)] flex bg-white">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r border-slate-100 flex-shrink-0 ${activeConv ? 'hidden md:block' : ''}`} style={{ background: '#FAFAFA' }}>
                <div className="p-5 border-b border-slate-100"><h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-indigo-500" /> Messages</h2></div>
                <div className="overflow-y-auto h-[calc(100vh-72px-65px)]">
                    {conversations.length === 0 ? (
                        <div className="text-center py-20 px-4"><div className="text-4xl mb-2">💬</div><p className="text-slate-400 text-sm">No conversations yet</p></div>
                    ) : conversations.map(c => {
                        const other = getOther(c); const active = activeConv?.id === c.id;
                        return (
                            <button key={c.id} onClick={() => setActiveConv(c)} className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-colors text-left border-b border-slate-50 ${active ? 'bg-white border-l-2 !border-l-indigo-500' : ''}`}>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">{other?.name?.[0]}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between"><p className={`font-medium text-sm ${active ? 'text-indigo-600' : 'text-slate-900'}`}>{other?.name}</p>
                                        {c.unreadCount > 0 && <span className="w-5 h-5 bg-indigo-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{c.unreadCount}</span>}</div>
                                    <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{c.messages?.[0]?.content || 'Start chatting...'}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col">
                {activeConv ? (
                    <>
                        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                            <button onClick={() => setActiveConv(null)} className="md:hidden p-1 text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></button>
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">{getOther(activeConv)?.name?.[0]}</div>
                            <div><p className="text-slate-900 font-medium text-sm">{getOther(activeConv)?.name}</p>{activeConv.property && <p className="text-slate-400 text-xs">Re: {activeConv.property.title}</p>}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ background: '#FAFAFA' }}>
                            {messages.map(m => {
                                const mine = m.sender?.id === user?.id || m.senderId === user?.id;
                                return (
                                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${mine ? 'bg-indigo-500 text-white rounded-br-md' : 'bg-white text-slate-700 rounded-bl-md shadow-sm border border-slate-100'}`}>
                                            <p>{m.content}</p>
                                            <p className={`text-[11px] mt-1 ${mine ? 'text-indigo-200' : 'text-slate-400'}`}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>
                        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-3 bg-white">
                            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="input !rounded-2xl !bg-slate-50 flex-1" />
                            <button type="submit" disabled={sending || !newMessage.trim()} className="btn-primary !rounded-2xl !px-4 !py-3">{sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}</button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 hidden md:flex items-center justify-center" style={{ background: '#FAFAFA' }}>
                        <div className="text-center"><div className="text-5xl mb-3">💬</div><h3 className="text-lg font-semibold text-slate-900">Select a conversation</h3><p className="text-slate-400 text-sm mt-1">Choose from your existing conversations</p></div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 text-indigo-500 animate-spin" /></div>}><MessagesContent /></Suspense>;
}
