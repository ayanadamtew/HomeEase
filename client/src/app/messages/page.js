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

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-gray-400 text-[11px]"><Loader2 className="w-5 h-5 animate-spin mr-3" /> Loading messages...</div>;
    const getOther = (c) => c.participantOne?.id === user?.id ? c.participantTwo : c.participantOne;

    return (
        <div className="min-h-[calc(100vh-72px)] flex bg-white pt-1">
            {/* Sidebar */}
            <div className={`w-full md:w-96 border-r border-black flex-shrink-0 ${activeConv ? 'hidden md:block' : ''}`} style={{ background: '#FAFAFA' }}>
                <div className="p-8 border-b border-black"><h2 className="text-xl font-black text-black flex items-center gap-3 uppercase tracking-tighter"><MessageSquare className="w-6 h-6 text-black" /> Messages</h2></div>
                <div className="overflow-y-auto h-[calc(100vh-72px-85px)]">
                    {conversations.length === 0 ? (
                        <div className="text-center py-20 px-4"><div className="text-6xl mb-4">💬</div><p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No conversations yet</p></div>
                    ) : conversations.map(c => {
                        const other = getOther(c); const active = activeConv?.id === c.id;
                        return (
                            <button key={c.id} onClick={() => setActiveConv(c)} className={`w-full p-6 flex items-center gap-4 hover:bg-white transition-colors text-left border-b border-gray-100 ${active ? 'bg-white border-l-[4px] !border-l-black' : ''}`}>
                                <div className="w-12 h-12 bg-black flex items-center justify-center text-white font-black flex-shrink-0 text-lg">{other?.name?.[0]}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between"><p className={`font-black text-[13px] uppercase tracking-tighter ${active ? 'text-black' : 'text-gray-900'}`}>{other?.name}</p>
                                        {c.unreadCount > 0 && <span className="w-6 h-6 bg-black text-white text-[10px] flex items-center justify-center font-black tracking-widest">{c.unreadCount}</span>}</div>
                                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest line-clamp-1 mt-1.5">{c.messages?.[0]?.content || 'Start chatting...'}</p>
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
                        <div className="p-6 border-b border-black flex items-center gap-4 bg-white">
                            <button onClick={() => setActiveConv(null)} className="md:hidden p-2 text-black hover:bg-gray-50"><ArrowLeft className="w-5 h-5" /></button>
                            <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-black text-sm">{getOther(activeConv)?.name?.[0]}</div>
                            <div><p className="text-black font-black text-[15px] uppercase tracking-tighter">{getOther(activeConv)?.name}</p>{activeConv.property && <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Re: {activeConv.property.title}</p>}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ background: '#FAFAFA' }}>
                            {messages.map(m => {
                                const mine = m.sender?.id === user?.id || m.senderId === user?.id;
                                return (
                                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] px-6 py-4 border text-sm ${mine ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-100'}`}>
                                            <p className="leading-relaxed">{m.content}</p>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-3 ${mine ? 'text-gray-400' : 'text-gray-400'}`}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>
                        <form onSubmit={handleSend} className="p-6 border-t border-black flex gap-4 bg-white">
                            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="input !rounded-none !bg-gray-50 !border-gray-200 focus:!border-black flex-1" />
                            <button type="submit" disabled={sending || !newMessage.trim()} className="btn-primary !rounded-none !px-8 !py-4">{sending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}</button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 hidden md:flex items-center justify-center p-12" style={{ background: '#FAFAFA' }}>
                        <div className="text-center"><div className="text-8xl mb-8">💬</div><h3 className="text-2xl font-black text-black uppercase tracking-tighter">Select a conversation</h3><p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-4">Choose a chat to start transacting</p></div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-gray-400 text-[11px]"><Loader2 className="w-5 h-5 animate-spin mr-3" /> Loading messages...</div>}><MessagesContent /></Suspense>;
}
