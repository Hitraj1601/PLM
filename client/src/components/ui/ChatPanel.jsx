import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronLeft, Circle } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

let socket = null;

export default function ChatPanel() {
  const { token, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const selectedUserRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [view, setView] = useState('list'); // 'list' or 'chat'
  const messagesEndRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!token) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socket = io(socketUrl, {
      auth: { token },
    });

    socket.on('new_message', (msg) => {
      const currentUser = selectedUserRef.current;
      const currentUserId = currentUser ? (currentUser.id || currentUser.partner_id) : null;
      if (currentUserId && msg.sender_id === currentUserId) {
        setMessages((prev) => [...prev, msg]);
      }
      setUnreadCount((prev) => prev + 1);
      loadConversations();
    });

    socket.on('message_sent', (msg) => {
      const currentUser = selectedUserRef.current;
      const currentUserId = currentUser ? (currentUser.id || currentUser.partner_id) : null;
      if (currentUserId && msg.receiver_id === currentUserId) {
        setMessages((prev) => [...prev, msg]);
      }
      loadConversations();
    });

    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [token]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUsers = async () => {
    try {
      const res = await api.get('/chat/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const loadUnread = async () => {
    try {
      const res = await api.get('/chat/unread');
      setUnreadCount(res.data.count);
    } catch (err) { /* silent */ }
  };

  const openChat = (chatUser) => {
    setSelectedUser(chatUser);
    setView('chat');
    loadMessages(chatUser.id || chatUser.partner_id);
  };

  const loadMessages = async (userId) => {
    try {
      const res = await api.get(`/chat/messages/${userId}`);
      setMessages(res.data);
      loadUnread();
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;
    const receiverId = selectedUser.id || selectedUser.partner_id;
    socket.emit('send_message', { receiverId, message: newMessage.trim() });
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Load data when panel opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadConversations();
      loadUnread();
    }
  }, [isOpen]);

  // Poll for unread count
  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = (userId) => onlineUsers.includes(userId);

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-400',
      engineering: 'bg-blue-500/20 text-blue-400',
      approver: 'bg-yellow-500/20 text-yellow-400',
      operations: 'bg-green-500/20 text-green-400',
    };
    return colors[role] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="relative">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors flex items-center justify-center ${isOpen ? 'bg-navy-700 text-sienna-400' : 'text-gainsboro-400 hover:text-gainsboro-200 hover:bg-navy-700'}`}
      >
        <MessageCircle size={20} />
        {!isOpen && unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`absolute top-12 right-0 z-50 w-[380px] h-[520px] bg-navy-900 border border-navy-600 rounded-xl shadow-xl flex flex-col overflow-hidden transition-all duration-200 transform origin-top-right ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-navy-600 flex items-center gap-3 bg-navy-800/50">
          {view === 'chat' && (
            <button onClick={() => { setView('list'); setSelectedUser(null); }} className="text-gainsboro-400 hover:text-gainsboro-200">
              <ChevronLeft size={18} />
            </button>
          )}
          <h3 className="text-sm font-semibold text-gainsboro-100 flex-1">
            {view === 'chat' ? (selectedUser?.name || selectedUser?.partner_name) : 'Messages'}
          </h3>
          {view === 'chat' && selectedUser && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${getRoleBadgeColor(selectedUser.role || selectedUser.partner_role)}`}>
              {selectedUser.role || selectedUser.partner_role}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {view === 'list' ? (
            <div className="divide-y divide-navy-700/50">
              {/* Recent conversations */}
              {conversations.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-semibold text-gainsboro-500 uppercase tracking-wider mb-2">Recent</p>
                  {conversations.map((c) => (
                    <button
                      key={c.partner_id}
                      onClick={() => openChat(c)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-navy-700 transition-colors text-left"
                    >
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-sienna-600/30 flex items-center justify-center text-sienna-400 text-sm font-bold">
                          {c.partner_name?.[0]?.toUpperCase()}
                        </div>
                        {isOnline(c.partner_id) && (
                          <Circle size={8} className="absolute -bottom-0.5 -right-0.5 text-green-400 fill-green-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gainsboro-200 truncate">{c.partner_name}</span>
                          {parseInt(c.unread_count) > 0 && (
                            <span className="w-4 h-4 rounded-full bg-sienna-600 text-white text-[9px] flex items-center justify-center">
                              {c.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gainsboro-500 truncate">{c.last_message}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* All users */}
              <div className="p-3">
                <p className="text-[10px] font-semibold text-gainsboro-500 uppercase tracking-wider mb-2">All Users</p>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => openChat(u)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-navy-700 transition-colors text-left"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-xanadu-500/30 flex items-center justify-center text-xanadu-400 text-sm font-bold">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      {isOnline(u.id) && (
                        <Circle size={8} className="absolute -bottom-0.5 -right-0.5 text-green-400 fill-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gainsboro-200">{u.name}</span>
                      <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${getRoleBadgeColor(u.role)}`}>{u.role}</span>
                    </div>
                  </button>
                ))}
                {users.length === 0 && <p className="text-xs text-gainsboro-500 text-center py-4">No other users</p>}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="p-3 space-y-2">
              {messages.length === 0 && (
                <p className="text-xs text-gainsboro-500 text-center py-8">No messages yet. Say hello! 👋</p>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-sienna-600 text-white rounded-br-md'
                          : 'bg-navy-700 text-gainsboro-200 rounded-bl-md'
                      }`}
                    >
                      <p className="break-words">{msg.message}</p>
                      <p className={`text-[9px] mt-1 ${isMine ? 'text-sienna-200' : 'text-gainsboro-500'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input (only in chat view) */}
        {view === 'chat' && (
          <div className="px-3 py-3 border-t border-navy-600 bg-navy-800/50">
            <div className="flex items-center gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-navy-700 border border-navy-500 text-gainsboro-100 text-sm rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-sienna-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="w-9 h-9 rounded-full bg-sienna-600 hover:bg-sienna-500 text-white flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
