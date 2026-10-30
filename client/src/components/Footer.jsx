import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)] w-full">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="dot text-lg mb-3">SEAT<span className="text-[var(--accent)]">MATE</span></div>
          <p className="text-[var(--text-muted)] leading-relaxed">Совместные поездки по Беларуси. Делитесь дорогой — экономьте топливо и время.</p>
        </div>
        <div>
          <h4 className="dot text-xs text-[var(--text-dim)] mb-3">НАВИГАЦИЯ</h4>
          <ul className="space-y-2 text-[var(--text-muted)]">
            <li><Link to="/" className="hover:text-[var(--accent)] transition-colors">Поездки</Link></li>
            <li><Link to="/create" className="hover:text-[var(--accent)] transition-colors">Создать поездку</Link></li>
            <li><Link to="/profile" className="hover:text-[var(--accent)] transition-colors">Профиль</Link></li>
            <li><Link to="/chats" className="hover:text-[var(--accent)] transition-colors">Чаты</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="dot text-xs text-[var(--text-dim)] mb-3">ПОПУЛЯРНЫЕ ГОРОДА</h4>
          <ul className="space-y-2 text-[var(--text-muted)]">
            {['Минск', 'Полоцк', 'Витебск', 'Гродно', 'Брест', 'Гомель'].map(c => <li key={c}><Link to="/#routes" className="hover:text-[var(--accent)] transition-colors">{c}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="dot text-xs text-[var(--text-dim)] mb-3">ПОДДЕРЖКА</h4>
          <ul className="space-y-2 text-[var(--text-muted)]">
            <li><Link to="/#safety" className="hover:text-[var(--accent)] transition-colors">Безопасность</Link></li>
            <li><Link to="/#faq" className="hover:text-[var(--accent)] transition-colors">Условия использования</Link></li>
            <li><Link to="/#faq" className="hover:text-[var(--accent)] transition-colors">Сообщить о проблеме</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-4 py-4 max-w-6xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--text-dim)]">
        <span>© 2026 SeatMate BY. All rights reserved.</span>
        <span className="flex items-center gap-2 dot"><span className="live-dot" /> [ SERVER: ONLINE // BYN-SYSTEM READY ]</span>
        <span className="ml-auto">+375 (29) 000-00-00 | support@seatmate.by</span>
      </div>
    </footer>
  );
}