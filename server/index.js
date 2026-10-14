const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { db, initSchema } = require('./db');
const { runCron } = require('./cron');

initSchema();
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ---------- helpers ----------
const wrap = fn => (req, res) => { try { fn(req, res); } catch (e) { res.status(500).json({ error: e.message }); } };
function notify(userId, title, text, type = 'info', link = null) {
  db.prepare('INSERT INTO notifications (user_id,title,text,type,link) VALUES (?,?,?,?,?)').run(userId, title, text, type, link);
}
function parseTrip(t) {
  if (!t) return t;
  return { ...t, intermediate_stops: JSON.parse(t.intermediate_stops || '[]'), features: JSON.parse(t.features || '[]') };
}
function overlap(a, b, hours = 3) {
  return Math.abs(new Date(a) - new Date(b)) < hours * 3600 * 1000;
}

// ---------- AUTH ----------
app.post('/api/auth/login', wrap((req, res) => {
  const { email, password } = req.body;
  const u = db.prepare('SELECT * FROM users WHERE email=? AND password=?').get(email, password);
  if (!u) return res.status(401).json({ error: 'Неверный email или пароль' });
  if (u.is_blocked) return res.status(403).json({ error: 'Аккаунт заблокирован' });
  res.json(u);
}));
app.post('/api/auth/register', wrap((req, res) => {
  const { full_name, email, password, phone, role } = req.body;
  try {
    const id = db.prepare('INSERT INTO users (full_name,email,password,phone,role,balance) VALUES (?,?,?,?,?,20)')
      .run(full_name, email, password, phone || '', role === 'DRIVER' ? 'DRIVER' : 'CLIENT').lastInsertRowid;
    res.json(db.prepare('SELECT * FROM users WHERE id=?').get(id));
  } catch (e) { res.status(400).json({ error: 'Email уже занят' }); }
}));
app.get('/api/auth/quick-users', wrap((req, res) => {
  res.json(db.prepare("SELECT id,full_name,role,email,phone,rating,balance FROM users WHERE is_blocked=0 ORDER BY CASE role WHEN 'CLIENT' THEN 0 WHEN 'DRIVER' THEN 1 ELSE 2 END").all());
}));

// ---------- TRIPS ----------
app.get('/api/trips', wrap((req, res) => {
  const { origin, destination, date } = req.query;
  let q = `SELECT t.*, u.full_name AS driver_name, u.rating AS driver_rating FROM trips t JOIN users u ON u.id=t.driver_id WHERE t.status='ACTIVE'`;
  const args = [];
  if (origin) { q += ' AND t.origin LIKE ?'; args.push(`%${origin}%`); }
  if (destination) { q += ' AND t.destination LIKE ?'; args.push(`%${destination}%`); }
  if (date) { q += " AND date(t.departure_time)=date(?)"; args.push(date); }
  q += ' ORDER BY t.departure_time';
  res.json(db.prepare(q).all(...args).map(parseTrip));
}));
app.get('/api/trips/:id', wrap((req, res) => {
  const t = db.prepare(`SELECT t.*, u.full_name AS driver_name, u.rating AS driver_rating, v.make, v.model, v.color, v.plate_number
    FROM trips t JOIN users u ON u.id=t.driver_id LEFT JOIN vehicles v ON v.id=t.vehicle_id WHERE t.id=?`).get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Не найдено' });
  res.json(parseTrip(t));
}));
app.post('/api/trips', wrap((req, res) => {
  const { driver_id, vehicle_id, origin, destination, intermediate_stops, departure_time, price, seats_total, features } = req.body;
  const driver = db.prepare('SELECT * FROM users WHERE id=?').get(driver_id);
  if (!driver || driver.role !== 'DRIVER') return res.status(403).json({ error: 'Только водители создают поездки' });
  const actives = db.prepare(`SELECT * FROM trips WHERE driver_id=? AND status='ACTIVE'`).all(driver_id);
  // лимит: не более 3 активных поездок у водителя
  if (actives.length >= 3)
    return res.status(409).json({ error: 'У водителя уже 3 активные поездки — максимум' });
  // строго запрещаем две поездки на одно время
  if (actives.some(t => overlap(t.departure_time, departure_time)))
    return res.status(409).json({ error: 'У вас уже есть активная поездка на это время' });
  const id = db.prepare(`INSERT INTO trips (driver_id,vehicle_id,origin,destination,intermediate_stops,departure_time,price,seats_total,seats_available,features,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,'ACTIVE')`).run(driver_id, vehicle_id, origin, destination,
      JSON.stringify(intermediate_stops || []), departure_time, price, seats_total, seats_total, JSON.stringify(features || [])).lastInsertRowid;
  res.json(parseTrip(db.prepare('SELECT * FROM trips WHERE id=?').get(id)));
}));
app.put('/api/trips/:id', wrap((req, res) => {
  const { origin, destination, departure_time, price, seats_available, status, features } = req.body;
  db.prepare(`UPDATE trips SET origin=COALESCE(?,origin), destination=COALESCE(?,destination),
    departure_time=COALESCE(?,departure_time), price=COALESCE(?,price),
    seats_available=COALESCE(?,seats_available), status=COALESCE(?,status),
    features=COALESCE(?,features) WHERE id=?`).run(origin, destination, departure_time, price, seats_available, status,
      features ? JSON.stringify(features) : null, req.params.id);
  res.json(parseTrip(db.prepare('SELECT * FROM trips WHERE id=?').get(req.params.id)));
}));
app.delete('/api/trips/:id', wrap((req, res) => {
  db.prepare("UPDATE trips SET status='CANCELLED' WHERE id=?").run(req.params.id);
  db.prepare("UPDATE rentals SET status='CANCELLED' WHERE trip_id=? AND status='ACTIVE'").run(req.params.id);
  res.json({ ok: true });
}));

// Бронирование с атомарным уменьшением мест
app.post('/api/trips/:id/book', wrap((req, res) => {
  const { passenger_id, seats_booked } = req.body;
  const trip = db.prepare('SELECT * FROM trips WHERE id=?').get(req.params.id);
  if (!trip || trip.status !== 'ACTIVE') return res.status(400).json({ error: 'Поездка недоступна' });
  if (trip.driver_id === passenger_id) return res.status(400).json({ error: 'Нельзя бронировать свою поездку' });
  const seats = Number(seats_booked) || 1;
  // пассажиру нельзя иметь 2 АКТИВНЫЕ брони на одно время
  const actives = db.prepare(`SELECT t.departure_time, t.id FROM rentals r JOIN trips t ON t.id=r.trip_id
    WHERE r.passenger_id=? AND r.status='ACTIVE'`).all(passenger_id);
  if (actives.some(a => overlap(a.departure_time, trip.departure_time)))
    return res.status(409).json({ error: 'У вас уже есть активная бронь на это время' });
  const tx = db.transaction(() => {
    const upd = db.prepare('UPDATE trips SET seats_available=seats_available-? WHERE id=? AND seats_available>=?')
      .run(seats, trip.id, seats);
    if (upd.changes === 0) throw new Error('Недостаточно мест');
    const total = seats * trip.price;
    const id = db.prepare('INSERT INTO rentals (trip_id,passenger_id,seats_booked,total_price,status) VALUES (?,?,?,?,\'ACTIVE\')')
      .run(trip.id, passenger_id, seats, total).lastInsertRowid;
    // гарантированно создаём чат поездки
    let chat = db.prepare('SELECT id FROM chats WHERE trip_id=?').get(trip.id);
    if (!chat) {
      const chatId = db.prepare('INSERT INTO chats (trip_id) VALUES (?)').run(trip.id).lastInsertRowid;
      db.prepare('INSERT OR IGNORE INTO chat_participants (chat_id,user_id) VALUES (?,?)').run(chatId, trip.driver_id);
      chat = { id: chatId };
    }
    db.prepare('INSERT OR IGNORE INTO chat_participants (chat_id,user_id) VALUES (?,?)').run(chat.id, passenger_id);
    return id;
  });
  try {
    const id = tx();
    notify(passenger_id, 'Бронирование подтверждено', `${trip.origin} → ${trip.destination}`, 'booking', `/trip/${trip.id}`);
    notify(trip.driver_id, 'Новая бронь', `Пассажир забронировал ${seats} мест(а)`, 'booking', `/trip/${trip.id}`);
    res.json(db.prepare('SELECT * FROM rentals WHERE id=?').get(id));
  } catch (e) { res.status(409).json({ error: e.message }); }
}));
app.post('/api/rentals/:id/cancel', wrap((req, res) => {
  const r = db.prepare('SELECT * FROM rentals WHERE id=?').get(req.params.id);
  if (!r || r.status !== 'ACTIVE') return res.status(400).json({ error: 'Неактивная бронь' });
  db.transaction(() => {
    db.prepare("UPDATE rentals SET status='CANCELLED' WHERE id=?").run(r.id);
    db.prepare('UPDATE trips SET seats_available=seats_available+? WHERE id=?').run(r.seats_booked, r.trip_id);
  })();
  res.json({ ok: true });
}));

// ---------- PROFILE ----------
app.get('/api/users/:id', wrap((req, res) => {
  const u = db.prepare('SELECT id,full_name,email,phone,role,avatar_url,rating,balance,is_blocked FROM users WHERE id=?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'Не найден' });
  const vehicles = db.prepare('SELECT * FROM vehicles WHERE driver_id=?').all(u.id);
  const activeRentals = db.prepare(`SELECT r.*, t.origin, t.destination, t.departure_time, t.price, t.id AS trip_ref FROM rentals r
    JOIN trips t ON t.id=r.trip_id WHERE r.passenger_id=? AND r.status='ACTIVE' ORDER BY t.departure_time`).all(u.id);
  const tripHistory = db.prepare(`SELECT r.*, t.origin, t.destination, t.departure_time FROM rentals r JOIN trips t ON t.id=r.trip_id
    WHERE r.passenger_id=? ORDER BY r.created_at DESC LIMIT 20`).all(u.id);
  const drivenTrips = db.prepare('SELECT * FROM trips WHERE driver_id=? ORDER BY departure_time DESC LIMIT 20').all(u.id).map(parseTrip);
  const reviews = db.prepare(`SELECT r.*, u.full_name AS author_name FROM reviews r JOIN users u ON u.id=r.author_id
    WHERE r.target_user_id=? ORDER BY r.id DESC LIMIT 20`).all(u.id);
  res.json({ ...u, vehicles, activeRentals, tripHistory, drivenTrips, reviews: reviews.map(r => ({ ...r })) });
}));
app.put('/api/users/:id', wrap((req, res) => {
  const { full_name, phone, avatar_url } = req.body;
  db.prepare('UPDATE users SET full_name=COALESCE(?,full_name), phone=COALESCE(?,phone), avatar_url=COALESCE(?,avatar_url) WHERE id=?')
    .run(full_name, phone, avatar_url, req.params.id);
  res.json(db.prepare('SELECT id,full_name,email,phone,role,avatar_url,rating,balance FROM users WHERE id=?').get(req.params.id));
}));
app.post('/api/users/:id/balance', wrap((req, res) => {
  db.prepare('UPDATE users SET balance=MAX(0, balance + ?) WHERE id=?').run(Number(req.body.amount) || 0, req.params.id);
  res.json(db.prepare('SELECT balance FROM users WHERE id=?').get(req.params.id));
}));

// ---------- VEHICLES ----------
app.get('/api/vehicles/:driverId', wrap((req, res) => {
  res.json(db.prepare('SELECT * FROM vehicles WHERE driver_id=?').all(req.params.driverId));
}));
app.post('/api/vehicles', wrap((req, res) => {
  const { driver_id, make, model, color, plate_number, seats } = req.body;
  const id = db.prepare('INSERT INTO vehicles (driver_id,make,model,color,plate_number,seats) VALUES (?,?,?,?,?,?)')
    .run(driver_id, make, model, color, plate_number, seats).lastInsertRowid;
  res.json(db.prepare('SELECT * FROM vehicles WHERE id=?').get(id));
}));
app.put('/api/vehicles/:id', wrap((req, res) => {
  const { make, model, color, plate_number, seats } = req.body;
  db.prepare('UPDATE vehicles SET make=?,model=?,color=?,plate_number=?,seats=? WHERE id=?')
    .run(make, model, color, plate_number, seats, req.params.id);
  res.json(db.prepare('SELECT * FROM vehicles WHERE id=?').get(req.params.id));
}));
app.delete('/api/vehicles/:id', wrap((req, res) => {
  db.prepare('DELETE FROM vehicles WHERE id=?').run(req.params.id);
  res.json({ ok: true });
}));

// ---------- CHATS ----------
app.get('/api/chats', wrap((req, res) => {
  const userId = req.query.userId;
  const chats = db.prepare(`SELECT c.*, t.origin, t.destination FROM chats c
    JOIN chat_participants cp ON cp.chat_id=c.id
    JOIN trips t ON t.id=c.trip_id
    WHERE cp.user_id=? ORDER BY c.last_message_at DESC`).all(userId);
  const withUnread = chats.map(c => {
    const unread = db.prepare(`SELECT COUNT(*) c FROM messages WHERE chat_id=? AND is_read=0 AND sender_id!=?`).get(c.id, userId).c;
    return { ...c, unread };
  });
  res.json(withUnread);
}));
app.get('/api/chats/:id/messages', wrap((req, res) => {
  res.json(db.prepare(`SELECT m.*, u.full_name AS sender_name FROM messages m JOIN users u ON u.id=m.sender_id
    WHERE m.chat_id=? ORDER BY m.id`).all(req.params.id));
}));
app.post('/api/chats', wrap((req, res) => {
  const { trip_id, participant_ids } = req.body;
  let chat = db.prepare('SELECT * FROM chats WHERE trip_id=?').get(trip_id);
  if (!chat) chat = { id: db.prepare('INSERT INTO chats (trip_id) VALUES (?)').run(trip_id).lastInsertRowid };
  (participant_ids || []).forEach(uid =>
    db.prepare('INSERT OR IGNORE INTO chat_participants (chat_id,user_id) VALUES (?,?)').run(chat.id, uid));
  res.json(db.prepare('SELECT * FROM chats WHERE id=?').get(chat.id));
}));
app.delete('/api/chats/:id', wrap((req, res) => {
  db.prepare('DELETE FROM messages WHERE chat_id=?').run(req.params.id);
  db.prepare('DELETE FROM chat_participants WHERE chat_id=?').run(req.params.id);
  db.prepare('DELETE FROM chats WHERE id=?').run(req.params.id);
  res.json({ ok: true });
}));
app.get('/api/chats/all/admin', wrap((req, res) => {
  res.json(db.prepare(`SELECT c.*, t.origin, t.destination FROM chats c LEFT JOIN trips t ON t.id=c.trip_id ORDER BY c.id DESC`).all());
}));

// ---------- REVIEWS ----------
app.post('/api/reviews', wrap((req, res) => {
  const { trip_id, author_id, target_user_id, rating, comment, type } = req.body;
  const id = db.prepare('INSERT INTO reviews (trip_id,author_id,target_user_id,rating,comment,type) VALUES (?,?,?,?,?,?)')
    .run(trip_id || null, author_id, target_user_id || null, rating, comment, type || 'USER_REVIEW').lastInsertRowid;
  if (target_user_id) {
    const avg = db.prepare('SELECT AVG(rating) a FROM reviews WHERE target_user_id=? AND type=\'USER_REVIEW\'').get(target_user_id).a;
    db.prepare('UPDATE users SET rating=ROUND(?,1) WHERE id=?').run(avg, target_user_id);
  }
  res.json(db.prepare('SELECT * FROM reviews WHERE id=?').get(id));
}));
app.get('/api/reviews/app', wrap((req, res) => {
  res.json(db.prepare(`SELECT r.*, u.full_name AS author_name FROM reviews r JOIN users u ON u.id=r.author_id WHERE r.type='APP_REVIEW' ORDER BY r.id DESC`).all());
}));

// ---------- REPORTS ----------
app.post('/api/reports', wrap((req, res) => {
  const { reporter_id, target_trip_id, target_user_id, reason } = req.body;
  const id = db.prepare('INSERT INTO reports (reporter_id,target_trip_id,target_user_id,reason) VALUES (?,?,?,?)')
    .run(reporter_id, target_trip_id || null, target_user_id || null, reason).lastInsertRowid;
  res.json(db.prepare('SELECT * FROM reports WHERE id=?').get(id));
}));
app.get('/api/reports', wrap((req, res) => {
  res.json(db.prepare(`SELECT r.*, u.full_name AS reporter_name FROM reports r JOIN users u ON u.id=r.reporter_id ORDER BY r.id DESC`).all());
}));
app.post('/api/reports/:id/resolve', wrap((req, res) => {
  db.prepare("UPDATE reports SET status='RESOLVED' WHERE id=?").run(req.params.id);
  res.json({ ok: true });
}));
app.post('/api/reports/block-user', wrap((req, res) => {
  db.prepare('UPDATE users SET is_blocked=1 WHERE id=?').run(req.body.user_id);
  res.json({ ok: true });
}));

// ---------- NOTIFICATIONS ----------
app.get('/api/notifications/:userId', wrap((req, res) => {
  res.json(db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 50').all(req.params.userId));
}));
app.post('/api/notifications/:userId/read', wrap((req, res) => {
  db.prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(req.params.userId);
  res.json({ ok: true });
}));
app.post('/api/notifications/item/:id/read', wrap((req, res) => {
  db.prepare('UPDATE notifications SET is_read=1 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
}));

// ---------- ADMIN ----------
app.get('/api/admin/users', wrap((req, res) => {
  res.json(db.prepare('SELECT id,full_name,email,phone,role,rating,balance,is_blocked FROM users ORDER BY id').all());
}));
app.put('/api/admin/users/:id', wrap((req, res) => {
  const { full_name, email, phone, role, rating, balance, is_blocked } = req.body;
  db.prepare('UPDATE users SET full_name=?,email=?,phone=?,role=?,rating=?,balance=?,is_blocked=? WHERE id=?')
    .run(full_name, email, phone, role, rating, balance, is_blocked ? 1 : 0, req.params.id);
  res.json({ ok: true });
}));
app.delete('/api/admin/users/:id', wrap((req, res) => {
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ ok: true });
}));
app.post('/api/admin/users', wrap((req, res) => {
  const { full_name, email, password, phone, role } = req.body;
  const id = db.prepare('INSERT INTO users (full_name,email,password,phone,role) VALUES (?,?,?,?,?)')
    .run(full_name, email, password || '1234', phone || '', role || 'CLIENT').lastInsertRowid;
  res.json(db.prepare('SELECT * FROM users WHERE id=?').get(id));
}));
app.get('/api/admin/trips', wrap((req, res) => {
  res.json(db.prepare(`SELECT t.*, u.full_name AS driver_name FROM trips t JOIN users u ON u.id=t.driver_id ORDER BY t.id DESC`).all().map(parseTrip));
}));
app.get('/api/admin/stats', wrap((req, res) => {
  res.json({
    users: db.prepare('SELECT COUNT(*) c FROM users').get().c,
    trips: db.prepare('SELECT COUNT(*) c FROM trips').get().c,
    activeTrips: db.prepare("SELECT COUNT(*) c FROM trips WHERE status='ACTIVE'").get().c,
    rentals: db.prepare('SELECT COUNT(*) c FROM rentals').get().c,
    reports: db.prepare("SELECT COUNT(*) c FROM reports WHERE status='PENDING'").get().c,
  });
}));

// ---------- SOCKET.IO ----------
io.on('connection', socket => {
  socket.on('join_chat', ({ chatId, userId }) => {
    socket.join('chat_' + chatId);
    socket.join('user_' + userId);
  });
  socket.on('typing', ({ chatId, userId, name }) => {
    socket.to('chat_' + chatId).emit('typing', { userId, name });
  });
  socket.on('stop_typing', ({ chatId, userId }) => {
    socket.to('chat_' + chatId).emit('stop_typing', { userId });
  });
  socket.on('send_message', ({ chatId, senderId, text }) => {
    if (!text || !text.trim()) return;
    const id = db.prepare('INSERT INTO messages (chat_id,sender_id,text) VALUES (?,?,?)').run(chatId, senderId, text.trim()).lastInsertRowid;
    db.prepare('UPDATE chats SET last_message_at=datetime(\'now\') WHERE id=?').run(chatId);
    const msg = db.prepare(`SELECT m.*, u.full_name AS sender_name FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.id=?`).get(id);
    io.to('chat_' + chatId).emit('new_message', msg);
    // оповещения остальным участникам
    db.prepare('SELECT user_id FROM chat_participants WHERE chat_id=? AND user_id!=?').all(chatId, senderId)
      .forEach(p => {
        notify(p.user_id, 'Новое сообщение', text.slice(0, 60), 'chat', `/chat/${chatId}`);
        io.to('user_' + p.user_id).emit('chat_notification', { chatId, text });
      });
  });
  socket.on('message_read', ({ chatId, userId }) => {
    db.prepare('UPDATE messages SET is_read=1 WHERE chat_id=? AND sender_id!=?').run(chatId, userId);
    socket.to('chat_' + chatId).emit('messages_read', { chatId, userId });
  });
});

// cron каждые 3 минуты
setInterval(runCron, 3 * 60 * 1000);
runCron();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`SeatMate server on http://localhost:${PORT}`));
