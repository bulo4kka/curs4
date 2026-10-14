import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Section from '../components/Section';
import CityInput from '../components/CityInput';
import { ShieldCheck, Fuel, Zap, Coins, Star, Users, Clock, MapPin, ChevronDown } from 'lucide-react';

const FEATURE_LABELS = { animals: 'Животные', big_trunk: 'Большой багаж', quiet_driver: 'Тихий водитель' };

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [filters, setFilters] = useState({ origin: '', destination: '', date: '', passengers: 1, maxPrice: 100, time: 'any', feats: [] });
  const [tab, setTab] = useState('passenger');

  useEffect(() => { api('/trips').then(setTrips).catch(() => setTrips([])); }, []);

  const filtered = useMemo(() => trips.filter(t => {
    const norm = s => s.trim().toLowerCase().replace(/ё/g, 'е');
    if (filters.origin && norm(t.origin) !== norm(filters.origin)) return false;
    if (filters.destination && norm(t.destination) !== norm(filters.destination)) return false;
    if (filters.date && t.departure_time.slice(0, 10) !== filters.date) return false;
    if (t.seats_available < Number(filters.passengers || 1)) return false;
    if (t.price > Number(filters.maxPrice)) return false;
    const h = new Date(t.departure_time).getHours();
    if (filters.time === 'morning' && !(h >= 5 && h < 12)) return false;
    if (filters.time === 'day' && !(h >= 12 && h < 18)) return false;
    if (filters.time === 'evening' && !(h >= 18 || h < 5)) return false;
    if (filters.feats.every(f => (t.features || []).includes(f)) === false) return false;
    return true;
  }), [trips, filters]);

  const toggleFeat = f => setFilters(s => ({ ...s, feats: s.feats.includes(f) ? s.feats.filter(x => x !== f) : [...s.feats, f] }));

  return (
    <div>
      {/* 00 HERO */}
      <section className="w-full h-[calc(100dvh-64px)] relative overflow-hidden flex flex-col justify-between">
        <img src="/images/hero-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" onError={e => { e.target.style.display = 'none'; }} />
        <div className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 w-full">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-dot text-led text-sm mb-6 flex items-center gap-2"><span className="live-dot" /> [ 00 // TRAVEL TOGETHER ]</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="font-dot text-4xl md:text-7xl leading-tight">
          SEAT<span className="text-led">MATE</span><br />
          <span className="text-gray-500 text-2xl md:text-5xl">// СОВМЕСТНЫЕ ПОЕЗДКИ ПО БЕЛАРУСИ</span>
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mt-12 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="flex flex-col">
            <span className="font-dot text-[10px] text-gray-500 tracking-widest pl-1 mb-1.5">ОТКУДА</span>
            <CityInput key="o" value={filters.origin} onChange={v => setFilters({ ...filters, origin: v })} placeholder="Минск" />
          </div>
          <div className="flex flex-col">
            <span className="font-dot text-[10px] text-gray-500 tracking-widest pl-1 mb-1.5">КУДА</span>
            <CityInput key="d" value={filters.destination} onChange={v => setFilters({ ...filters, destination: v })} placeholder="Полоцк" />
          </div>
          <div className="flex flex-col">
            <span className="font-dot text-[10px] text-gray-500 tracking-widest pl-1 mb-1.5">ДАТА</span>
            <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} className="h-12 bg-black/40 border border-white/10 rounded-lg px-4 w-full outline-none focus:border-red-600/50 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-dot text-[10px] text-gray-500 tracking-widest pl-1 mb-1.5">МЕСТА</span>
            <input type="number" min="1" max="4" value={filters.passengers} onChange={e => setFilters({ ...filters, passengers: e.target.value })} className="h-12 bg-black/40 border border-white/10 rounded-lg px-4 w-full outline-none focus:border-red-600/50 text-white" />
          </div>
          <button onClick={() => document.getElementById('trips-feed')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-led hover:bg-led2 rounded-xl h-12 px-5 font-display tracking-wider font-medium text-sm">Найти поездку</button>
        </motion.div>

        <div className="flex flex-wrap gap-2 mt-6">
          {[['Минск', 'Витебск'], ['Полоцк', 'Минск'], ['Гродно', 'Брест'], ['Гомель', 'Минск']].map(([a, b]) => (
            <button key={a + b} onClick={() => setFilters({ ...filters, origin: a, destination: b })}
              className="border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 hover:border-led hover:text-led">
              {a} → {b}
            </button>
          ))}
        </div>
        </div>
        </div>
        <button onClick={() => document.getElementById('trips-feed')?.scrollIntoView({ behavior: 'smooth' })}
          className="relative z-10 pb-8 text-center font-dot text-xs text-gray-500 tracking-widest animate-pulse cursor-pointer hover:text-led transition">[ SCROLL TO EXPLORE ]</button>
      </section>

      {/* 01 FEED */}
      <Section id="trips-feed" index="01 // SEARCH" title="Лента поездок">
        <div className="glass rounded-xl p-4 mb-8 grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
          <label className="text-xs text-gray-400 col-span-2 md:col-span-1">До {filters.maxPrice} BYN
            <input type="range" min="10" max="100" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
          </label>
          <select value={filters.time} onChange={e => setFilters({ ...filters, time: e.target.value })}>
            <option value="any">Любое время</option><option value="morning">Утро</option><option value="day">День</option><option value="evening">Вечер</option>
          </select>
          {Object.keys(FEATURE_LABELS).map(f => (
            <label key={f} className="text-xs flex items-center gap-2">
              <input type="checkbox" checked={filters.feats.includes(f)} onChange={() => toggleFeat(f)} className="!w-4 accent-red-600" /> {FEATURE_LABELS[f]}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-led/20 border border-led/50 flex items-center justify-center font-dot text-led">{(t.driver_name || '?')[0]}</div>
                <div>
                  <div className="font-dot">{t.driver_name}</div>
                  <div className="text-xs text-gray-500"><Star size={10} className="inline" /> {t.driver_rating} · Водитель</div>
                </div>
                <div className="ml-auto font-dot text-2xl text-led">{t.price} <span className="text-xs text-gray-500">BYN</span></div>
              </div>
              <h3 className="font-dot text-xl flex items-center gap-2"><MapPin size={16} className="text-led" /> {t.origin} → {t.destination}</h3>
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(t.departure_time).toLocaleString('ru-RU')}</span>
                <span className="flex items-center gap-1"><Users size={12} /> {t.seats_available}/{t.seats_total} мест</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {(t.features || []).map(f => <span key={f} className="text-[10px] border border-white/10 rounded-full px-2 py-0.5 text-gray-400">{FEATURE_LABELS[f] || f}</span>)}
              </div>
              <Link to={`/trip/${t.id}`} className="block mt-4 text-center border border-led/60 text-led rounded-lg py-2 hover:bg-led/10">Подробнее</Link>
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-gray-500 font-dot">// НЕТ ПОДХОДЯЩИХ ПОЕЗДОК</p>}
        </div>
      </Section>

      {/* 02 ROUTES */}
      <Section id="routes" index="02 // ROUTES" title="Популярные маршруты">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Минск — Брест', time: '~4ч 30м', price: 'от 30 BYN', img: '/images/route-minsk.png' },
            { name: 'Гомель — Минск', time: '~5ч 00м', price: 'от 28 BYN', img: '/images/route-brest.png' },
            { name: 'Полоцк — Новополоцк — Минск', time: '~4ч 00м', price: 'от 25 BYN', img: '/images/route-polotsk.png' },
          ].map(r => (
            <div key={r.name} className="glass rounded-2xl overflow-hidden">
              <RouteImage src={r.img} name={r.name} />
              <div className="p-5">
                <h3 className="font-dot text-lg">{r.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{r.time}</p>
                <p className="font-dot text-led mt-3">{r.price}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 03 WHY */}
      <Section id="why" index="03 // WHY" title="Зачем это нужно">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <ShieldCheck />, t: 'Проверенные водители', d: 'Верификация документов и рейтинги после каждой поездки.' },
            { icon: <Fuel />, t: 'Экономия на топливе', d: 'Расходы делятся между всеми пассажирами.' },
            { icon: <Zap />, t: 'Чат в реальном времени', d: 'Мгновенная связь на Socket.io с индикаторами набора.' },
            { icon: <Coins />, t: 'Цены в BYN', d: 'Никаких скрытых конвертаций — только белорусские рубли.' },
          ].map(b => (
            <div key={b.t} className="glass rounded-2xl p-6">
              <div className="text-led mb-4">{b.icon}</div>
              <h3 className="font-dot">{b.t}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mt-2">{b.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 04 HOW */}
      <Section id="how" index="04 // HOW IT WORKS" title="Как это работает">
        <div className="flex gap-2 mb-8">
          {[['passenger', 'Пассажиру'], ['driver', 'Водителю']].map(([k, v]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-5 py-2 rounded-full border ${tab === k ? 'border-led text-led' : 'border-white/10 text-gray-400'}`}>{v}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(tab === 'passenger'
            ? [['01', 'Поиск', 'Выберите маршрут и проверьте рейтинг водителя.'], ['02', 'Бронь', 'Забронируйте место — оно сразу резервируется за вами.'], ['03', 'Поездка', 'Общайтесь в чате и добирайтесь до пункта назначения.']]
            : [['01', 'Создайте трек', 'Укажите маршрут, авто и цену в BYN.'], ['02', 'Набирайте пассажиров', 'Принимайте брони, чат поможет договориться.'], ['03', 'В путь', 'После поездки — отзывы и оплата на баланс.']]
          ).map(([n, t, d]) => (
            <div key={n} className="glass rounded-2xl p-8">
              <div className="font-dot text-5xl text-led">{n}.</div>
              <h3 className="font-dot text-xl mt-4">{t}</h3>
              <p className="text-gray-500 leading-relaxed mt-2">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 05 SAFETY */}
      <Section id="safety" index="05 // TRUST" title="Безопасность и доверие">
        <div className="glass rounded-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-dot text-xl mb-4">Рейтинги и отзывы</h3>
            <p className="text-gray-400 leading-relaxed">Каждый участник получает двустороннюю оценку после поездки. Средний рейтинг отображается в профиле и влияет на доверие.</p>
          </div>
          <div>
            <h3 className="font-dot text-xl mb-4">Модерация 24/7</h3>
            <p className="text-gray-400 leading-relaxed">Жалобы попадают в панель администратора (God Mode): нарушители блокируются, подозрительные поездки отменяются в один клик.</p>
          </div>
        </div>
      </Section>

      {/* 06 FAQ */}
      <Section id="faq" index="06 // FAQ" title="Вопросы и ответы">
        <Faq items={[
          ['Как отменить бронь?', 'Откройте «Профиль» → «Моя активная аренда» и нажмите «Отменить». Места вернутся водителю.'],
          ['Как рассчитывается стоимость в BYN?', 'Цена за место = доля от расходов на топливо по BYN-курсу за литр + небольшой сервисный сбор.'],
          ['Что делать, если водитель отменил поездку?', 'Вы получите уведомление, бронь отменится автоматически, а деньги на mock-кошельке вернутся.'],
          ['Можно ли с животными и большим багажом?', 'Да — фильтруйте поезда по параметрам на ленте или уточняйте в чате поездки.'],
          ['Есть ли ограничения по времени?', 'У водителя не более 3 активных поездок, а пассажир не может иметь две брони на одно время.'],
        ]} />
      </Section>
    </div>
  );
}

function RouteImage({ src, name }) {
  return (
    <div className="h-40 bg-gradient-to-br from-led/20 via-[#1C1C1E] to-black relative overflow-hidden">
      <img src={src} alt={name} className="absolute inset-0 w-full h-full object-cover"
        onError={e => { e.target.style.display = 'none'; }} />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(rgba(255,0,0,.4) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
    </div>
  );
}

function Faq({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-3">
      {items.map(([q, a], i) => (
        <div key={i} className="glass rounded-xl">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left font-dot">
            {q} <ChevronDown className={`transition ${open === i ? 'rotate-180 text-led' : ''}`} />
          </button>
          {open === i && <p className="px-5 pb-5 text-gray-400 leading-relaxed">{a}</p>}
        </div>
      ))}
    </div>
  );
}
