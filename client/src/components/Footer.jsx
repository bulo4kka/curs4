import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0E0E0E] w-full">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-dot text-lg mb-3">SEAT<span className="text-led">MATE</span></div>
          <p className="text-gray-500 leading-relaxed">Совместные поездки по Беларуси. Делитесь дорогой — экономьте топливо и время.</p>
        </div>
        <div>
          <h4 className="font-dot text-xs text-gray-400 mb-3">НАВИГАЦИЯ</h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link to="/" className="hover:text-led">Поездки</Link></li>
            <li><Link to="/create" className="hover:text-led">Создать поездку</Link></li>
            <li><Link to="/profile" className="hover:text-led">Профиль</Link></li>
            <li><Link to="/chats" className="hover:text-led">Чаты</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-dot text-xs text-gray-400 mb-3">ПОПУЛЯРНЫЕ ГОРОДА</h4>
          <ul className="space-y-2 text-gray-300">
            {['Минск', 'Полоцк', 'Витебск', 'Гродно', 'Брест', 'Гомель'].map(c => <li key={c}><a href="/#routes" className="hover:text-led">{c}</a></li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-dot text-xs text-gray-400 mb-3">ПОДДЕРЖКА</h4>
          <ul className="space-y-2 text-gray-300">
            <li><a href="/#safety" className="hover:text-led">Безопасность</a></li>
            <li><a href="/#faq" className="hover:text-led">Условия использования</a></li>
            <li><a href="/#faq" className="hover:text-led">Сообщить о проблеме</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 max-w-6xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
        <span>© 2026 SeatMate BY. All rights reserved.</span>
        <span className="flex items-center gap-2 font-dot"><span className="live-dot" /> [ SERVER: ONLINE // BYN-SYSTEM READY ]</span>
        <span className="ml-auto">+375 (29) 000-00-00 | support@seatmate.by</span>
      </div>
    </footer>
  );
}
