import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Section from '../components/Section';
import CityInput from '../components/CityInput';
import DatePicker from '../components/DatePicker';
import Stepper from '../components/Stepper';
import { ShieldCheck, Fuel, Zap, Coins, Star, Users, Clock, MapPin, ChevronDown, Car, Package, PawPrint, VolumeX } from 'lucide-react';

const FEATURE_LABELS = { animals: 'Животные', big_trunk: 'Большой багаж', quiet_driver: 'Тихий водитель' };
const FEATURE_ICONS = { animals: <PawPrint size={12} />, big_trunk: <Package size={12} />, quiet_driver: <VolumeX size={12} /> };

const popularRoutes = [
  { name: 'Минск — Брест', origin: 'Минск', destination: 'Брест', time: '~4ч 30м', price: 'ОТ 30 BYN', img: '/images/route-minsk.png' },
  { name: 'Гомель — Минск', origin: 'Гомель', destination: 'Минск', time: '~5ч 00м', price: 'ОТ 28 BYN', img: '/images/route-brest.png' },
  { name: 'Полоцк — Новополоцк — Минск', origin: 'Полоцк', destination: 'Минск', time: '~4ч 00м', price: 'ОТ 25 BYN', img: '/images/route-polotsk.png' },
];

const quickRoutes = [
  ['Минск', 'Витебск'],
  ['Полоцк', 'Минск'],
  ['Гродно', 'Брест'],
  ['Гомель', 'Минск'],
];

const whyItems = [
  {
    title: 'Проверенные водители',
    description: 'Верификация документов, рейтинг после каждой поездки, история без нарушений.',
    icon: ShieldCheck,
  },
  {
    title: 'Экономия на топливе',
    description: 'Расходы делятся между всеми пассажирами — до 60% дешевле такси.',
    icon: Fuel,
  },
  {
    title: 'Чат в реальном времени',
    description: 'Мгновенная связь на Socket.io с индикаторами набора и прочитанных.',
    icon: Zap,
  },
  {
    title: 'Прозрачные цены в BYN',
    description: 'Никаких скрытых конвертаций — только белорусские рубли, честный расчёт.',
    icon: Coins,
  },
];

const howPassenger = [
  { step: '01', title: 'Поиск', desc: 'Выберите маршрут, дату и проверьте рейтинг водителя.' },
  { step: '02', title: 'Бронь', desc: 'Забронируйте место — оно сразу резервируется за вами.' },
  { step: '03', title: 'Поездка', desc: 'Общайтесь в чате и добирайтесь до пункта назначения.' },
];

const howDriver = [
  { step: '01', title: 'Создайте трек', desc: 'Укажите маршрут, авто и цену в BYN.' },
  { step: '02', title: 'Набирайте пассажиров', desc: 'Принимайте брони, чат поможет договориться о деталях.' },
  { step: '03', title: 'В путь', desc: 'После поездки — отзывы и оплата на баланс.' },
];

const faqItems = [
  ['Как отменить бронь?', 'Откройте «Профиль» → «Моя активная аренда» и нажмите «Отменить». Места вернутся водителю.'],
  ['Как рассчитывается стоимость в BYN?', 'Цена за место = доля от расходов на топливо по BYN-курсу за литр + небольшой сервисный сбор.'],
  ['Что делать, если водитель отменил поездку?', 'Вы получите уведомление, бронь отменится автоматически, а деньги на mock-кошельке вернутся.'],
  ['Можно ли с животными и большим багажом?', 'Да — фильтруйте поезда по параметрам на ленте или уточняйте в чате поездки.'],
  ['Есть ли ограничения по времени?', 'У водителя не более 3 активных поездок, а пассажир не может иметь две брони на одно время.'],
];

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [filters, setFilters] = useState({ origin: '', destination: '', date: '', passengers: 1, maxPrice: 100, time: 'any', feats: [] });
  const [tab, setTab] = useState('passenger');
  const [faqOpen, setFaqOpen] = useState(null);

  const scrollToTripsFeed = () => {
    const feed = document.getElementById('trips-feed');
    if (!feed) return;
    if (window.lenis) window.lenis.scrollTo(feed, { offset: -80 });
    else feed.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
      {/* HERO — Persuade Mode */}
      <section className="w-full h-[calc(100dvh-64px)] relative overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--accent-muted)_0%,_transparent_70%)] opacity-20 pointer-events-none" />
        <div className="flex-1 flex items-center">
          <div className="max-w-6xl mx-auto px-4 w-full">
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="dot text-[var(--accent)] text-sm mb-6 flex items-center gap-2"
            >
              [ 00 // TRAVEL TOGETHER ]
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="dot text-4xl md:text-7xl leading-tight"
            >
              SEAT<span className="text-[var(--accent)]">MATE</span><br />
              <span className="text-[var(--text-muted)] text-2xl md:text-5xl font-body font-normal">// СОВМЕСТНЫЕ ПОЕЗДКИ ПО БЕЛАРУСИ</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="surface mt-12 rounded-2xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
            >
              <div className="flex flex-col">
                <label className="label">ОТКУДА</label>
                <CityInput key="o" value={filters.origin} onChange={v => setFilters({ ...filters, origin: v })} placeholder="Минск" />
              </div>
              <div className="flex flex-col">
                <label className="label">КУДА</label>
                <CityInput key="d" value={filters.destination} onChange={v => setFilters({ ...filters, destination: v })} placeholder="Полоцк" />
              </div>
              <div className="flex flex-col">
                <label className="label">ДАТА</label>
                <DatePicker
                  value={filters.date}
                  onChange={v => setFilters({ ...filters, date: v })}
                  placeholder="Дата"
                />
              </div>
              <div className="flex flex-col">
                <label className="label">МЕСТА</label>
                <Stepper
                  value={filters.passengers}
                  onChange={v => setFilters({ ...filters, passengers: v })}
                  min={1}
                  max={4}
                  aria-label="Количество пассажиров"
                />
              </div>
              <button
                onClick={scrollToTripsFeed}
                className="btn btn-primary h-12 px-6 tracking-wider"
              >
                Найти поездку
              </button>
            </motion.div>

            <div className="flex flex-wrap gap-2 mt-6">
              {quickRoutes.map(([a, b]) => (
                <button
                  key={a + b}
                  onClick={() => setFilters({ ...filters, origin: a, destination: b })}
                  className="chip chip-inactive"
                >
                  {a} → {b}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={scrollToTripsFeed}
          className="relative z-10 pb-8 text-center dot text-xs text-[var(--text-muted)] tracking-widest cursor-pointer hover:text-[var(--accent)] transition-colors"
          aria-label="Scroll to trips"
        >
          [ SCROLL TO EXPLORE ]
        </button>
      </section>

      {/* TRIPS FEED — Operate Mode */}
      <Section id="trips-feed" index="01 // SEARCH" title="Лента поездок">
        {/* FILTER PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="surface rounded-2xl p-5 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Price Slider */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">МАКС. ЦЕНА</label>
                <span className="ndot text-sm text-[var(--accent)]">{filters.maxPrice} <span className="text-xs text-[var(--text-muted)]">BYN</span></span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={filters.maxPrice}
                onChange={e => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-full h-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
            </div>

            {/* Time Select */}
            <div>
              <label className="label">ВРЕМЯ ВЫЕЗДА</label>
              <select
                value={filters.time}
                onChange={e => setFilters({ ...filters, time: e.target.value })}
                className="input h-12 appearance-none"
              >
                <option value="any">Любое время</option>
                <option value="morning">Утро (5–12)</option>
                <option value="day">День (12–18)</option>
                <option value="evening">Вечер (18–5)</option>
              </select>
            </div>

            {/* Feature Chips */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(FEATURE_LABELS).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFeat(f)}
                  className={`chip ${filters.feats.includes(f) ? 'chip-active' : 'chip-inactive'}`}
                >
                  {filters.feats.includes(f) && <span className="live-dot-sm" />}
                  <span>{FEATURE_LABELS[f]}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* TRIP CARDS */}
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              role="list"
              aria-label="Доступные поездки"
            >
              {filtered.map((t, index) => (
                <motion.article
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="relative group surface rounded-2xl p-5 transition-colors duration-200 hover:border-[var(--border-hover)]"
                >
                  {/* Driver Block */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="avatar avatar-md shrink-0">
                      {(t.driver_name || '?')[0]}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--success)] border-2 border-[var(--bg)] rounded-full" />
                    </div>
                    <div className="min-w-0">
                      <div className="display text-sm truncate">{t.driver_name}</div>
                      <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                        <Star size={10} className="text-[var(--accent)]" /> {t.driver_rating} <span className="text-[var(--text-dim)]">·</span> Водитель
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="ndot text-2xl text-[var(--accent)]">{t.price}</div>
                      <div className="ndot text-[10px] text-[var(--text-muted)]">BYN</div>
                    </div>
                  </div>

                  {/* Route Timeline */}
                  <div className="relative pl-6 mb-4">
                    <div className="absolute left-[5px] top-0 bottom-0 w-0.5 bg-[var(--border)]" />
                    <div className="flex items-start gap-4">
                      <div className="relative z-10 flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] border-2 border-[var(--bg)]" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="display text-sm text-[var(--text)] truncate">{t.origin}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          {new Date(t.departure_time).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' })} · {new Date(t.departure_time).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 mt-3">
                      <div className="relative z-10 flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--accent)] bg-[var(--bg)]" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="display text-sm text-[var(--text)] truncate">{t.destination}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Прибытие</div>
                      </div>
                    </div>
                  </div>

                  {/* Seats & Features */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-[var(--text-muted)]" />
                      <span className="display text-sm text-[var(--text)]">{t.seats_available}</span>
                      <span className="ndot text-[10px] text-[var(--text-muted)]">/ {t.seats_total} мест</span>
                      {t.seats_available <= 1 && <span className="ndot text-[10px] text-[var(--accent)] ml-1" aria-label="Осталось мало мест">●</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(t.features || []).map(f => (
                        <span key={f} className="flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full">
                          {FEATURE_ICONS[f]}
                          <span className="text-[10px] text-[var(--text-muted)]">{FEATURE_LABELS[f]}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/trip/${t.id}`}
                    className="block mt-4 w-full text-center py-2.5 rounded-xl bg-transparent border border-[var(--border)] text-[var(--text-muted)] font-medium text-sm transition-all duration-200 hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent-muted)]/20"
                  >
                    Подробнее
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="md:col-span-2 text-center py-16"
              role="status"
            >
              <p className="dot text-[var(--text-muted)]">// НЕТ ПОДХОДЯЩИХ ПОЕЗДОК</p>
              <p className="text-sm text-[var(--text-dim)] mt-2">Попробуйте изменить фильтры или дату</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      {/* POPULAR ROUTES — Persuade Mode */}
      <Section id="routes" index="02 // ROUTES" title="Популярные маршруты">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularRoutes.map((r, index) => (
            <motion.button
              key={r.name}
              onClick={() => {
                setFilters(s => ({ ...s, origin: r.origin, destination: r.destination }));
                scrollToTripsFeed();
              }}
              type="button"
              aria-label={`Показать поездки по маршруту ${r.name}`}
              layout
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group surface rounded-2xl overflow-hidden cursor-pointer transition-colors duration-200 hover:border-[var(--accent)]/30"
              whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
            >
              <div className="h-48 relative overflow-hidden">
                <RouteImage src={r.img} name={r.name} />
              </div>
              <div className="bg-[var(--bg-elevated)] p-5">
                <h3 className="display text-lg text-[var(--text)] truncate">{r.name}</h3>
                <p className="ndot text-[10px] text-[var(--text-muted)] mt-1">[ TIME // {r.time} ]</p>
                <p className="ndot text-sm text-[var(--accent)] mt-2">{r.price}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </Section>

      {/* WHY — Clean Persuade/Read Hybrid */}
      <Section id="why" index="03 // WHY" title="Почему SeatMate">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="surface rounded-2xl p-6 transition-colors hover:border-[var(--border-hover)]"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] border border-[var(--accent)]/30 flex items-center justify-center mb-4 text-[var(--accent)]">
                <item.icon size={20} />
              </div>
              <h3 className="dot text-base font-medium text-[var(--text)]">{item.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-2">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS — Read Mode */}
      <Section id="how" index="04 // HOW" title="Как это работает">
        <div className="flex gap-2 mb-10 flex-wrap">
          {['passenger', 'driver'].map(k => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-5 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                tab === k
                  ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-muted)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text)]'
              }`}
            >
              {k === 'passenger' ? 'Пассажиру' : 'Водителю'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(tab === 'passenger' ? howPassenger : howDriver).map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="surface rounded-2xl p-8"
            >
              <div className="dot text-4xl text-[var(--accent)]">{item.step}.</div>
              <h3 className="dot text-lg mt-4">{item.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* SAFETY — Read Mode */}
      <Section id="safety" index="05 // TRUST" title="Безопасность и доверие" variant="subtle">
        <div className="surface rounded-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="dot text-lg mb-4">Рейтинги и отзывы</h3>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Каждый участник получает двустороннюю оценку после поездки. Средний рейтинг отображается в профиле и влияет на доверие.
            </p>
          </div>
          <div>
            <h3 className="dot text-lg mb-4">Модерация 24/7</h3>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Жалобы попадают в панель администратора (God Mode): нарушители блокируются, подозрительные поездки отменяются в один клик.
            </p>
          </div>
        </div>
      </Section>

      {/* FAQ — Read Mode */}
      <Section id="faq" index="06 // FAQ" title="Вопросы и ответы" variant="subtle">
        <Faq items={faqItems} open={faqOpen} onOpen={setFaqOpen} />
      </Section>
    </div>
  );
}

function RouteImage({ src, name }) {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[var(--accent-muted)]/30 via-[var(--bg-elevated)] to-[var(--bg)]">
      <img
        src={src}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={e => { e.target.style.display = 'none'; }}
      />
    </div>
  );
}

function Faq({ items, open, onOpen }) {
  return (
    <div className="space-y-3">
      {items.map(([q, a], i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="surface rounded-xl overflow-hidden"
        >
          <button
            onClick={() => onOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left dot"
            aria-expanded={open === i}
          >
            {q}
            <ChevronDown
              className={`transition-transform duration-200 text-[var(--text-muted)] ${
                open === i ? 'rotate-180 text-[var(--accent)]' : ''
              }`}
              size={18}
            />
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-5 pb-5 text-[var(--text-muted)] leading-relaxed"
              >
                {a}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
