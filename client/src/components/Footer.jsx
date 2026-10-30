import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer w-full">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-16 grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 md:gap-12 text-sm">
        <div>
          <div className="brand-mark footer-brand"><span className="brand-symbol"><span>↗</span></span><span>seat<span>mate</span></span></div>
          <p className="text-[var(--text-muted)] leading-relaxed max-w-xs mt-4">Совместные поездки по Беларуси. Делитесь дорогой — экономьте топливо и время.</p>
        </div>
        <div>
          <h4 className="footer-heading">НАВИГАЦИЯ</h4>
          <ul className="space-y-2 text-[var(--text-muted)]">
            <li><Link to="/" className="hover:text-[var(--accent)] transition-colors">Поездки</Link></li>
            <li><Link to="/create" className="hover:text-[var(--accent)] transition-colors">Создать поездку</Link></li>
            <li><Link to="/profile" className="hover:text-[var(--accent)] transition-colors">Профиль</Link></li>
            <li><Link to="/chats" className="hover:text-[var(--accent)] transition-colors">Чаты</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="footer-heading">ПОПУЛЯРНЫЕ ГОРОДА</h4>
          <ul className="space-y-2 text-[var(--text-muted)]">
            {['Минск', 'Полоцк', 'Витебск', 'Гродно', 'Брест', 'Гомель'].map(c => <li key={c}><Link to="/#routes" className="hover:text-[var(--accent)] transition-colors">{c}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="footer-heading">ПОДДЕРЖКА</h4>
          <ul className="space-y-2 text-[var(--text-muted)]">
            <li><Link to="/#safety" className="hover:text-[var(--accent)] transition-colors">Безопасность</Link></li>
            <li><Link to="/#faq" className="hover:text-[var(--accent)] transition-colors">Условия использования</Link></li>
            <li><Link to="/#faq" className="hover:text-[var(--accent)] transition-colors">Сообщить о проблеме</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom max-w-7xl mx-auto px-5 md:px-10 py-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--text-dim)]">
        <span>© 2026 SeatMate BY. All rights reserved.</span>
        <span className="ml-auto">+375 (29) 000-00-00 <span aria-hidden="true">·</span> support@seatmate.by</span>
      </div>
    </footer>
  );
}
