'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { messagesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Send, Loader2, ArrowLeft, MoreVertical, MessageSquare } from 'lucide-react';

function MessagesContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const convIdParam = searchParams.get('conv');

    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(convIdParam || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);
    const [mobileViewList, setMobileViewList] = useState(!convIdParam);

    const bottomRef = useRef(null);
    const pollInterval = useRef(null);

    // Initial load of conversations
    useEffect(() => {
        if (!authLoading && !user) { router.push('/auth/login'); return; }
        if (!user) return;

        const fetchConvs = async () => {
            try {
                const res = await messagesAPI.getConversations();
                setConversations(res.data.conversations);
                if (!activeConvId && res.data.conversations.length > 0) {
                    // setActiveConvId(res.data.conversations[0].id); // Optional auto-open
                }
            } catch (err) { toast.error('Failed to load inbox'); }
            finally { setLoadingConvs(false); }
        };
        fetchConvs();
    }, [user, authLoading]);

    // Load messages for active conversation and setup polling
    useEffect(() => {
        if (!activeConvId) return;

        const loadMsgs = async () => {
            setLoadingMsgs(true);
            try {
                const res = await messagesAPI.getMessages(activeConvId);
                setMessages(res.data.messages.reverse());
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            } catch (err) { toast.error('Failed to load chat'); }
            finally { setLoadingMsgs(false); }
        };

        const pollMsgs = async () => {
            try {
                const res = await messagesAPI.getMessages(activeConvId);
                setMessages(res.data.messages.reverse());
            } catch (err) { }
        };

        loadMsgs();
        clearInterval(pollInterval.current);
        pollInterval.current = setInterval(pollMsgs, 5000); // 5s poll

        return () => clearInterval(pollInterval.current);
    }, [activeConvId]);

    // Scroll to bottom when messages update
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConvId) return;
        const msgText = newMessage.trim();
        setNewMessage('');
        try {
            setSending(true);
            const res = await messagesAPI.sendMessage(activeConvId, msgText);
            setMessages(prev => [...prev, res.data.message]);
        } catch (err) {
            toast.error('Failed to send message');
            setNewMessage(msgText); // Restore input on fail
        } finally {
            setSending(false);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            // Refresh conversation list to bump recent to top
            messagesAPI.getConversations().then(r => setConversations(r.data.conversations)).catch(() => { });
        }
    };

    if (authLoading || loadingConvs) return <div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" /> <span className="font-semibold text-lg">Loading inbox...</span></div>;
    if (!user) return null;

    const activeConv = conversations.find(c => c.id === activeConvId);
    let otherUser = null;
    let relatedItem = null;
    if (activeConv) {
        otherUser = activeConv.participants.find(p => p.id !== user.id) || activeConv.participants[0];
        if (activeConv.property) relatedItem = { type: 'Property', title: activeConv.property.title };
        if (activeConv.serviceProfile) relatedItem = { type: 'Service Request', title: activeConv.serviceProfile.serviceType };
    }

    return (
        <div className="h-[calc(100vh-72px)] bg-gray-50 p-0 sm:p-5">
            <div className="max-w-6xl mx-auto h-full card border-x-0 sm:border !rounded-none sm:!rounded-2xl flex overflow-hidden shadow-sm shadow-blue-500/5 bg-white">

                {/* ── Sidebar (Conversation List) ── */}
                <div className={`${mobileViewList ? 'flex' : 'hidden'} sm:flex flex-col w-full sm:w-[340px] border-r border-gray-100 flex-shrink-0 bg-white`}>
                    <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                        <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2 text-gray-400 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors xl:hidden"><ArrowLeft className="w-5 h-5" /></button>
                        <h2 className="text-xl font-bold text-gray-900">Inbox</h2>
                        <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-bold">{conversations.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p className="font-medium text-sm">No messages yet</p>
                            </div>
                        ) : (
                            conversations.map(c => {
                                const ou = c.participants.find(p => p.id !== user.id) || c.participants[0];
                                const last = c.messages[0];
                                const isActive = activeConvId === c.id;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => { setActiveConvId(c.id); setMobileViewList(false); }}
                                        className={`w-full text-left flex items-start gap-4 p-4 border-b border-gray-50 transition-all ${isActive ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 border ${isActive ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>{ou.name?.[0]}</div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className={`font-bold text-sm truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>{ou.name}</h4>
                                                {last && <span className="text-xs font-semibold text-gray-400">{new Date(last.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                                            </div>
                                            <p className={`text-[13px] line-clamp-1 font-medium ${isActive ? 'text-blue-700/80' : 'text-gray-500'}`}>{last ? last.content : <span className="italic opacity-60">Empty conversation</span>}</p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── Chat Area ── */}
                <div className={`${!mobileViewList ? 'flex' : 'hidden'} sm:flex flex-col flex-1 bg-white relative`}>
                    {!activeConvId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                            <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
                            <p className="font-semibold text-gray-500">Select a conversation to start chatting</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/90 backdrop-blur-md z-10 sticky top-0 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setMobileViewList(true)} className="p-2 -ml-2 text-gray-400 hover:bg-gray-100 rounded-lg sm:hidden"><ArrowLeft className="w-5 h-5" /></button>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">{otherUser?.name?.[0]}</div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 leading-none mb-1">{otherUser?.name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{otherUser?.role}</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><MoreVertical className="w-5 h-5" /></button>
                            </div>

                            {/* Context Banner */}
                            {relatedItem && (
                                <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm">
                                    <span className="font-semibold text-gray-500 uppercase tracking-wider text-xs">{relatedItem.type}</span>
                                    <span className="font-medium text-gray-900 truncate max-w-[60%]">{relatedItem.title}</span>
                                </div>
                            )}

                            {/* Messages Scroll Area */}
                            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6" style={{ backgroundImage: 'radial-gradient(circle at center, #F8FAFC 0%, #FFFFFF 100%)' }}>
                                {loadingMsgs ? (
                                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400"><p className="text-sm font-medium">No messages yet. Say hello!</p></div>
                                ) : (
                                    messages.map((m, idx) => {
                                        const mine = m.senderId === user.id;
                                        const showAvatar = idx === 0 || messages[idx - 1].senderId !== m.senderId;

                                        return (
                                            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'} max-w-full animate-fade-in`}>
                                                <div className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    {!mine && (
                                                        <div className="w-8 h-8 shrink-0 mt-auto">
                                                            {showAvatar && <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 border border-gray-200 flex items-center justify-center text-xs font-bold">{otherUser?.name?.[0]}</div>}
                                                        </div>
                                                    )}
                                                    <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                                                        <div className={`px-5 py-3.5 rounded-2xl ${mine ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20' : 'bg-gray-100 text-gray-900 border border-gray-200/50 rounded-tl-none'}`}>
                                                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                                        </div>
                                                        <span className="text-[11px] font-semibold text-gray-400 mt-1.5 px-1">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input Form */}
                            <form onSubmit={handleSend} className="p-4 sm:p-5 border-t border-gray-100 bg-white">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="input !rounded-full !px-6 shadow-sm flex-1 bg-gray-50 focus:!bg-white"
                                    />
                                    <button type="submit" disabled={!newMessage.trim() || sending} className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed">
                                        <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
            <MessagesContent />
        </Suspense>
    );
}
