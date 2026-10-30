import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../socket';
import { Send, MessageSquare, X, Loader2, CheckCheck } from 'lucide-react';

export default function Chats() {
  const { user } = useAuth();
  const { chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingName, setTypingName] = useState('');
  const bottomRef = useRef();
  const socket = getSocket();

  useEffect(() => {
    if (user) api(`/chats?userId=${user.id}`).then(cs => {
      setChats(cs);
      if (chatId) setActive(cs.find(c => c.id === Number(chatId)) || null);
    });
  }, [user, chatId]);

  useEffect(() => {
    if (!active || !user) return;
    api(`/chats/${active.id}/messages`).then(setMessages);
    socket.emit('join_chat', { chatId: active.id, userId: user.id });
    socket.emit('message_read', { chatId: active.id, userId: user.id });
    const onMsg = m => { if (m.chat_id === active.id) setMessages(ms => [...ms, m]); };
    const onTyping = ({ userId, name }) => { if (userId !== user.id) setTypingName(name); };
    const onStop = ({ userId }) => { if (userId !== user.id) setTypingName(''); };
    socket.on('new_message', onMsg);
    socket.on('typing', onTyping);
    socket.on('stop_typing', onStop);
    return () => { socket.off('new_message', onMsg); socket.off('typing', onTyping); socket.off('stop_typing', onStop); };
  }, [active, user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typingName]);

  if (!user) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto p-8 text-center">
      <div className="surface rounded-xl p-12">
        <MessageSquare size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
        <h1 className="dot text-2xl mb-2">Войдите, чтобы видеть чаты</h1>
        <p className="text-[var(--text-muted)]">Авторизуйтесь в шапке сайта.</p>
      </div>
    </motion.div>
  );

  const send = () => {
    if (!text.trim() || !active) return;
    socket.emit('send_message', { chatId: active.id, senderId: user.id, text });
    socket.emit('stop_typing', { chatId: active.id, userId: user.id });
    setText('');
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit('typing', { chatId: active.id, userId: user.id, name: user.full_name });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-140px)] min-h-[600px]">
      {/* Chat List */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="surface rounded-xl p-2 max-h-full overflow-auto scrollbar-thin"
      >
        <h2 className="dot text-sm px-3 py-2 text-[var(--text-dim)]">ЧАТЫ</h2>
        {chats.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm p-3 text-center">Чатов пока нет</p>
        ) : (
          <AnimatePresence>
            {chats.map(c => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => setActive(c)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                  active?.id === c.id
                    ? 'bg-[var(--accent-muted)] border border-[var(--accent)]/30'
                    : 'hover:bg-[var(--bg)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="dot text-sm truncate">{c.origin} → {c.destination}</div>
                    <div className="text-[10px] text-[var(--text-dim)] mt-0.5">{new Date(c.last_message_at).toLocaleString('ru-RU')}</div>
                  </div>
                  {c.unread > 0 && (
                    <span className="ndot text-[10px] bg-[var(--accent)] text-white rounded-full px-2 shrink-0">{c.unread > 9 ? '9+' : c.unread}</span>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </motion.aside>

      {/* Chat Area */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="md:col-span-2 surface rounded-xl flex flex-col h-full"
      >
        {!active ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[var(--text-muted)]">Выберите чат слева</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
                  <MessageSquare size={20} />
                </div>
                <div className="min-w-0">
                  <div className="dot text-lg truncate">{active.origin} → {active.destination}</div>
                  <div className="text-[10px] text-[var(--text-dim)]">ID чата: #{active.id}</div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto space-y-3 p-4 scrollbar-thin" role="log" aria-live="polite">
              <AnimatePresence>
                {messages.map(m => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.sender_id === user.id
                        ? 'bg-[var(--accent)] text-white ml-auto rounded-tr-md'
                        : 'bg-[var(--bg-elevated)] text-[var(--text)] mr-auto rounded-tl-md'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium {m.sender_id === user.id ? 'text-white/80' : 'text-[var(--text-muted)]'}">{m.sender_name}</span>
                      <span className="text-[9px] {m.sender_id === user.id ? 'text-white/50' : 'text-[var(--text-dim)]'}">{new Date(m.created_at).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>{m.text}</div>
                    {m.sender_id === user.id && (
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[9px] {m.is_read ? 'text-green-400' : 'text-white/50'}">{m.is_read ? '✓✓' : '✓'}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {typingName && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-[var(--text-dim)] italic text-center py-2"
                >
                  {typingName} печатает…
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--border)]">
              <div className="flex gap-2">
                <input
                  value={text}
                  placeholder="Сообщение…"
                  onChange={handleTyping}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                  className="input flex-1"
                  disabled={!active}
                />
                <button
                  onClick={send}
                  disabled={!text.trim() || !active}
                  className="btn btn-primary px-4 disabled:opacity-50"
                  aria-label="Отправить сообщение"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}