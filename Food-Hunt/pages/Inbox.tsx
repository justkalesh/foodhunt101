import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/mockDatabase';
import { Message } from '../types';
import { Send, Search, MoreVertical, ArrowLeft, Trash2, X, CheckSquare, Square } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

interface Conversation {
    userId: string;
    userName: string;
    displayId: string; // Now mapping to email or 'admin'
    lastMessage: Message;
    unreadCount: number;
}

const Inbox: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [fetchedUsers, setFetchedUsers] = useState<Record<string, { name: string, email: string }>>({});
    const [showSidebarMenu, setShowSidebarMenu] = useState(false);

    // Selection Mode State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: () => void;
        isDestructive?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        action: () => { },
        isDestructive: false
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const sidebarMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMessages();
        // Poll for new messages every 5 seconds (simple real-time simulation)
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [user, navigate]);

    useEffect(() => {
        if (messages.length > 0 && user) {
            processConversations();
        }
    }, [messages, user, fetchedUsers]);

    useEffect(() => {
        scrollToBottom();
        if (activeChatId) {
            markAsRead(activeChatId);
            if (!fetchedUsers[activeChatId]) {
                fetchUserName(activeChatId);
            }
        }
    }, [activeChatId, messages]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(event.target as Node)) {
                setShowSidebarMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        if (!user) return;
        const res = await api.messages.get(user.id);
        if (res.success && res.data) {
            setMessages(res.data);
            setLoading(false);
        } else if (res.success && !res.data) {
            setMessages([]);
            setLoading(false);
        }
    };

    const fetchUserName = async (userId: string) => {
        if (userId === 'admin') return; // Already handled
        const res = await api.users.getMe(userId);
        if (res.success && res.data) {
            setFetchedUsers(prev => ({ ...prev, [userId]: { name: res.data.name, email: res.data.email } }));
        }
    };

    const markAsRead = async (chatId: string) => {
        if (!user) return;
        const unreadMsgs = messages.filter(m =>
            m.sender_id === chatId &&
            m.receiver_id === user.id &&
            !m.is_read
        );

        if (unreadMsgs.length > 0) {
            // Optimistically update local state
            setMessages(prev => prev.map(m =>
                (m.sender_id === chatId && m.receiver_id === user.id)
                    ? { ...m, is_read: true }
                    : m
            ));

            // Call API for each (mock implementation limitation)
            for (const msg of unreadMsgs) {
                await api.messages.markAsRead(msg.id);
            }
        }
    };

    const processConversations = () => {
        if (!user) return;
        const convMap = new Map<string, Conversation>();

        messages.forEach(msg => {
            const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
            let otherName = msg.sender_id === user.id ? (msg.receiver_id === 'admin' ? 'Food-Hunt Team' : `User ${msg.receiver_id}`) : msg.sender_name;
            let displayId = otherId;

            // Use fetched name if available
            if (fetchedUsers[otherId]) {
                otherName = fetchedUsers[otherId].name;
                displayId = fetchedUsers[otherId].email;
            } else if (otherId === 'admin') {
                otherName = 'Food-Hunt Team';
                displayId = 'admin';
            } else if (otherName.startsWith('User ') || otherName === 'Unknown') {
                // Try to use the name from the message if it's not generic, otherwise keep generic
                if (msg.sender_id === otherId && msg.sender_name && msg.sender_name !== 'Unknown') {
                    otherName = msg.sender_name;
                }
            }

            const existing = convMap.get(otherId);

            if (!existing || new Date(msg.created_at) > new Date(existing.lastMessage.created_at)) {
                convMap.set(otherId, {
                    userId: otherId,
                    userName: otherName,
                    displayId: displayId,
                    lastMessage: msg,
                    unreadCount: (existing?.unreadCount || 0) + (!msg.is_read && msg.receiver_id === user.id ? 1 : 0)
                });
            } else if (!msg.is_read && msg.receiver_id === user.id) {
                // Update unread count even if not last message
                if (existing) {
                    existing.unreadCount += 1;
                }
            }
        });

        const sortedConvs = Array.from(convMap.values()).sort((a, b) =>
            new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
        );
        setConversations(sortedConvs);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !activeChatId || !inputText.trim()) return;

        const res = await api.messages.send(user.id, activeChatId, inputText.trim());
        if (res.success) {
            setInputText('');
            fetchMessages();
        }
    };

    const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            e.preventDefault();
            const query = searchQuery.trim();

            // @ts-ignore
            const res = await api.users.search(query);

            if (res.success && res.data) {
                const targetUser = res.data;
                setActiveChatId(targetUser.id);
                setFetchedUsers(prev => ({ ...prev, [targetUser.id]: { name: targetUser.name, email: targetUser.email } }));
                setSearchQuery('');
            } else {
                setActiveChatId(query);
                setSearchQuery('');
            }
        }
    };

    // --- Selection Mode Logic ---

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedChats(new Set());
        setShowSidebarMenu(false);
    };

    const toggleChatSelection = (chatId: string) => {
        const newSelected = new Set(selectedChats);
        if (newSelected.has(chatId)) {
            newSelected.delete(chatId);
        } else {
            newSelected.add(chatId);
        }
        setSelectedChats(newSelected);
    };

    const confirmDeleteSelected = () => {
        if (!user || selectedChats.size === 0) return;
        setConfirmModal({
            isOpen: true,
            title: 'Delete Conversations',
            message: `Are you sure you want to delete ${selectedChats.size} conversation(s)?`,
            action: performDeleteSelected,
            isDestructive: true
        });
    };

    const performDeleteSelected = async () => {
        if (!user) return;

        for (const chatId of selectedChats) {
            const res = await api.messages.deleteConversation(user.id, chatId);
            if (!res.success) {
                console.error(`Failed to delete conversation with ${chatId}:`, res.message);
                // Continue trying others but maybe alert at end? For now just log.
            }
        }

        // Optimistically update local state to remove deleted conversations immediately
        setMessages(prev => prev.filter(m =>
            !((selectedChats.has(m.sender_id) && m.receiver_id === user.id) ||
                (selectedChats.has(m.receiver_id) && m.sender_id === user.id))
        ));

        // Also filter conversations directly to avoid flicker
        setConversations(prev => prev.filter(c => !selectedChats.has(c.userId)));

        setIsSelectionMode(false);
        setSelectedChats(new Set());
        if (activeChatId && selectedChats.has(activeChatId)) {
            setActiveChatId(null);
        }

        // Fetch fresh data to ensure sync
        fetchMessages();
    };

    const confirmClearInbox = () => {
        if (!user) return;
        setConfirmModal({
            isOpen: true,
            title: 'Clear Inbox',
            message: "Are you sure you want to delete ALL conversations? This cannot be undone.",
            action: performClearInbox,
            isDestructive: true
        });
        // Removed setShowSidebarMenu(false) to prevent state update conflict/race condition
    };

    const performClearInbox = async () => {
        if (!user) return;

        // @ts-ignore
        await api.messages.clearAll(user.id);

        setMessages([]);
        setConversations([]);
        setActiveChatId(null);
    };


    const activeConversation = conversations.find(c => c.userId === activeChatId);
    const activeMessages = messages.filter(m =>
        (m.sender_id === user?.id && m.receiver_id === activeChatId) ||
        (m.sender_id === activeChatId && m.receiver_id === user?.id)
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const displayUserName = activeConversation?.userName || fetchedUsers[activeChatId || '']?.name || `User ${activeChatId}`;
    const displayUserId = activeConversation?.displayId || fetchedUsers[activeChatId || '']?.email || activeChatId;
    const displayInitial = (displayUserName || '?')[0];

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Sidebar / Chat List */}
            <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-[400px] flex-col border-r border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-orange-50/30 dark:bg-none dark:bg-gray-900`}>
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-orange-50/30 dark:bg-none dark:bg-gray-800 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 relative h-[72px]">
                    {isSelectionMode ? (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsSelectionMode(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                    <X size={20} />
                                </button>
                                <span className="font-bold">{selectedChats.size} Selected</span>
                            </div>
                            {selectedChats.size > 0 && (
                                <button onClick={confirmDeleteSelected} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Foodies</h1>
                            <div className="relative" ref={sidebarMenuRef}>
                                <button
                                    onClick={() => setShowSidebarMenu(!showSidebarMenu)}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <MoreVertical size={20} className="text-gray-500 dark:text-gray-400" />
                                </button>

                                {showSidebarMenu && (
                                    <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1">
                                        <button
                                            onClick={toggleSelectionMode}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Select Chat
                                        </button>
                                        <button
                                            onClick={confirmClearInbox}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Clear Inbox
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Search */}
                <div className="p-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search or start a new chat"
                            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            disabled={isSelectionMode}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400" size={16} />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.map(conv => (
                        <div
                            key={conv.userId}
                            onClick={() => {
                                if (isSelectionMode) {
                                    toggleChatSelection(conv.userId);
                                } else {
                                    setActiveChatId(conv.userId);
                                }
                            }}
                            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${activeChatId === conv.userId && !isSelectionMode ? 'bg-primary-50 dark:bg-gray-800' : ''}`}
                        >
                            {isSelectionMode && (
                                <div className="text-primary-600">
                                    {selectedChats.has(conv.userId) ? <CheckSquare size={20} /> : <Square size={20} />}
                                </div>
                            )}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-orange-200 dark:from-primary-900 dark:to-orange-900 flex items-center justify-center text-lg font-bold text-primary-700 dark:text-primary-300 flex-shrink-0">
                                {conv.userName[0]}
                            </div>
                            <div className="flex-1 min-w-0 border-b border-gray-100 dark:border-gray-800 pb-3">
                                <div className="flex justify-between items-baseline mb-1">
                                    <div className="flex items-baseline gap-1 min-w-0 pr-2">
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{conv.userName}</h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 opacity-75 flex-shrink-0">#{conv.displayId}</span>
                                    </div>
                                    <span className={`text-xs flex-shrink-0 ${conv.unreadCount > 0 ? 'text-primary-600 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {formatTime(conv.lastMessage.created_at)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate pr-2">
                                        {conv.lastMessage.content}
                                    </p>
                                    {conv.unreadCount > 0 && activeChatId !== conv.userId && (
                                        <span className="bg-primary-600 rounded-full w-2.5 h-2.5 block"></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No chats yet. Start a conversation!
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {activeChatId ? (
                <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-orange-50/20 dark:bg-none dark:bg-[#0b141a] relative">
                    {/* Chat Header */}
                    <div className="p-3 bg-white dark:bg-gray-800 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shadow-sm z-20">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setActiveChatId(null)} className="md:hidden text-gray-500 dark:text-gray-400 mr-1">
                                <ArrowLeft size={24} />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-orange-200 dark:from-primary-900 dark:to-orange-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold">
                                {displayInitial}
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="font-bold text-gray-900 dark:text-gray-100">{displayUserName}</h2>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 opacity-75">#{displayUserId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages Background */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none dark:opacity-5 opacity-[0.02]" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10 custom-scrollbar">
                        {activeMessages.map((msg, idx) => {
                            const isMe = msg.sender_id === user?.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm text-sm ${isMe
                                            ? 'bg-primary-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                            }`}
                                    >
                                        <div className="break-words">
                                            {msg.content}
                                        </div>
                                        <div className={`flex justify-end items-center gap-1 text-[10px] mt-1 ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                                            <span>
                                                {formatTime(msg.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white dark:bg-gray-800 flex items-center gap-2 z-10 border-t border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                placeholder="Type a message"
                                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className={`p-3 rounded-full flex items-center justify-center transition-all transform active:scale-95 ${inputText.trim() ? 'bg-primary-600 text-white shadow-lg hover:bg-primary-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 border-b-[6px] border-primary-600 text-center p-10">
                    <div className="w-24 h-24 bg-primary-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-primary-600 animate-bounce-slow">
                        <MoreVertical size={48} className="rotate-90" />
                    </div>
                    <h2 className="text-3xl font-light text-gray-800 dark:text-gray-200 mb-4">Food-Hunt Messenger</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">Send and receive messages to coordinate your meal splits.<br />Connect with other foodies instantly.</p>
                </div>
            )}
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.action}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
            />
        </div>
    );
};

export default Inbox;
