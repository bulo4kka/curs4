import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../socket';

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

  useEffect(() => { if (user) api(`/chats?userId=${user.id}`).then(cs => { setChats(cs); if (chatId) setActive(cs.find(c => c.id === Number(chatId)) || null); }); }, [user, chatId]);

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

  if (!user) return <div className="p-8">Войдите, чтобы видеть чаты.</div>;

  const send = () => {
    if (!text.trim() || !active) return;
    socket.emit('send_message', { chatId: active.id, senderId: user.id, text });
    socket.emit('stop_typing', { chatId: active.id, userId: user.id });
    setText('');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="glass rounded-xl p-2 max-h-[70vh] overflow-auto">
        {chats.map(c => (
          <button key={c.id} onClick={() => setActive(c)} className={`w-full text-left p-3 rounded-lg mb-1 ${active?.id === c.id ? 'bg-white/10' : ''}`}>
            <div className="font-dot text-sm">{c.origin} → {c.destination}</div>
            <div className="text-xs text-gray-500">{new Date(c.last_message_at).toLocaleString('ru-RU')}</div>
            {c.unread > 0 && <span className="inline-block mt-1 bg-led text-white text-[10px] rounded-full px-2 font-dot">{c.unread}</span>}
          </button>
        ))}
        {chats.length === 0 && <p className="text-gray-500 text-sm p-3">Чатов пока нет.</p>}
      </div>
      <div className="md:col-span-2 glass rounded-xl p-4 flex flex-col h-[70vh]">
        {!active && <p className="text-gray-500 m-auto">Выберите чат</p>}
        {active && (
          <>
            <div className="flex-1 overflow-auto space-y-2">
              {messages.map(m => (
                <div key={m.id} className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.sender_id === user.id ? 'bg-led/80 ml-auto' : 'bg-white/10'}`}>
                  <div className="text-[10px] text-gray-300">{m.sender_name}</div>
                  {m.text}
                  <div className="text-[9px] text-gray-400 text-right">{m.is_read ? '✓✓' : '✓'}</div>
                </div>
              ))}
              {typingName && <div className="text-xs text-gray-500 italic">{typingName} печатает…</div>}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2 mt-3">
              <input value={text} placeholder="Сообщение…"
                onChange={e => { setText(e.target.value); socket.emit('typing', { chatId: active.id, userId: user.id, name: user.full_name }); }}
                onKeyDown={e => e.key === 'Enter' && send()} />
              <button onClick={send} className="bg-led rounded-lg px-4 font-dot">ОК</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
