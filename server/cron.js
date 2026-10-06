const { db } = require('./db');
const CITIES = require('./cities');

const cityNames = Object.keys(CITIES);
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

function runCron() {
  try {
    // 1. Авто-очистка: УДАЛЕНИЕ просроченных поездок и связанных записей
    const past = db.prepare(`SELECT id FROM trips WHERE datetime(departure_time) < datetime('now')`).all();
    const delTx = db.transaction(() => {
      past.forEach(({ id }) => {
        const chats = db.prepare('SELECT id FROM chats WHERE trip_id=?').all(id);
        chats.forEach(c => {
          db.prepare('DELETE FROM messages WHERE chat_id=?').run(c.id);
          db.prepare('DELETE FROM chat_participants WHERE chat_id=?').run(c.id);
        });
        db.prepare('DELETE FROM chats WHERE trip_id=?').run(id);
        db.prepare('DELETE FROM rentals WHERE trip_id=?').run(id);
        db.prepare('DELETE FROM reviews WHERE trip_id=?').run(id);
        db.prepare('DELETE FROM trips WHERE id=?').run(id);
      });
    });
    delTx();
    if (past.length > 0) console.log(`[cron] deleted ${past.length} past trips`);

    // 2. Генерация 2-3 новых поездок на сегодня/завтра
    const drivers = db.prepare(`SELECT u.id as uid, v.id as vid FROM users u
      JOIN vehicles v ON v.driver_id = u.id WHERE u.role='DRIVER' AND u.is_blocked=0
      AND (SELECT COUNT(*) FROM trips t WHERE t.driver_id=u.id AND t.status='ACTIVE') < 3`).all();
    const genCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < genCount && drivers.length > 0; i++) {
      const d = pick(drivers);
      let origin = pick(cityNames), destination = pick(cityNames);
      while (destination === origin) destination = pick(cityNames);
      const dep = new Date();
      dep.setDate(dep.getDate() + Math.floor(Math.random() * 2));
      dep.setHours(6 + Math.floor(Math.random() * 16), 0, 0, 0);
      if (dep < new Date()) dep.setDate(dep.getDate() + 1);
      const price = 15 + Math.floor(Math.random() * 40);
      // не создаём вторую поездку на то же время
      const clash = db.prepare(`SELECT departure_time FROM trips WHERE driver_id=? AND status='ACTIVE'`).all(d.uid)
        .some(t => Math.abs(new Date(t.departure_time) - dep) < 3 * 3600 * 1000);
      if (clash) continue;
      db.prepare(`INSERT INTO trips (driver_id,vehicle_id,origin,destination,intermediate_stops,departure_time,price,seats_total,seats_available,features,status)
        VALUES (?,?,?,?,?,?,?,?,?,?,'ACTIVE')`).run(d.uid, d.vid, origin, destination, '[]', dep.toISOString(), price, 4, 4, '[]');
    }
    console.log(`[cron] generated ${genCount} trips`);

    // 3. Очистка устаревших CANCELLED / старых завершённых записей (>30 дней)
    db.prepare(`DELETE FROM rentals WHERE status='CANCELLED' AND datetime(created_at) < datetime('now','-30 days')`).run();
    db.prepare(`DELETE FROM notifications WHERE is_read=1 AND datetime(created_at) < datetime('now','-14 days')`).run();
  } catch (e) {
    console.error('[cron] error', e.message);
  }
}

module.exports = { runCron };
if (require.main === module) { runCron(); }
