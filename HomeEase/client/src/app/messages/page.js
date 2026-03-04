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

        messagesAPI.getConversations()
            .then(res => {
                setConversations(res.data.conversations);
                if (convId) {
                    const found = res.data.conversations.find(c => c.id === convId);
                    if (found) setActiveConv(found);
                }
            })
            .finally(() => setLoading(false));
    }, [user, authLoading]);

    useEffect(() => {
        if (!activeConv) return;
        messagesAPI.getMessages(activeConv.id).then(res => {
            setMessages(res.data.messages);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
    }, [activeConv]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            setSending(true);
            const res = await messagesAPI.sendMessage(activeConv.id, newMessage.trim());
            setMessages(prev => [...prev, res.data.message]);
            setNewMessage('');
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            toast.error('Failed to send');
        } finally {
            setSending(false);
        }
    };

    if (authLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
    }

    const getOther = (conv) => conv.participantOne?.id === user?.id ? conv.participantTwo : conv.participantOne;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r border-white/5 bg-gray-950/50 flex-shrink-0 ${activeConv ? 'hidden md:block' : ''}`}>
                <div className="p-4 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-400" /> Messages
                    </h2>
                </div>
                <div className="overflow-y-auto h-[calc(100vh-8rem)]">
                    {conversations.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="text-4xl mb-2">💬</div>
                            <p className="text-gray-400 text-sm">No conversations yet</p>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const other = getOther(conv);
                            const isActive = activeConv?.id === conv.id;
                            return (
                                <button key={conv.id} onClick={() => setActiveConv(conv)} className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left ${isActive ? 'bg-white/5 border-l-2 border-emerald-400' : ''}`}>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {other?.name?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={`font-medium text-sm ${isActive ? 'text-emerald-400' : 'text-white'}`}>{other?.name}</p>
                                            {conv.unreadCount > 0 && <span className="w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">{conv.unreadCount}</span>}
                                        </div>
                                        <p className="text-gray-500 text-xs line-clamp-1">{conv.messages?.[0]?.content || 'Start chatting...'}</p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {activeConv ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-gray-950/50">
                            <button onClick={() => setActiveConv(null)} className="md:hidden p-1 text-gray-400 hover:text-white">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                                {getOther(activeConv)?.name?.[0]}
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">{getOther(activeConv)?.name}</p>
                                {activeConv.property && <p className="text-gray-500 text-xs">Re: {activeConv.property.title}</p>}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map(msg => {
                                const isMine = msg.sender?.id === user?.id || msg.senderId === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-emerald-600 text-white rounded-br-md' : 'bg-gray-800 text-gray-200 rounded-bl-md'}`}>
                                            <p>{msg.content}</p>
                                            <p className={`text-xs mt-1 ${isMine ? 'text-emerald-200/60' : 'text-gray-500'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 bg-gray-900 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                            />
                            <button type="submit" disabled={sending || !newMessage.trim()} className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors disabled:opacity-50">
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 hidden md:flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-5xl mb-3">💬</div>
                            <h3 className="text-lg font-semibold text-white">Select a conversation</h3>
                            <p className="text-gray-400 text-sm mt-1">Choose from your existing conversations</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>}>
            <MessagesContent />
        </Suspense>
    );
}
