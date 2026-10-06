const { db, initSchema } = require('./db');
const CITIES = require('./cities');

function seed() {
  initSchema();
  const count = db.prepare('SELECT COUNT(*) c FROM users').get().c;
  if (count > 0) {
    console.log('DB already seeded, skipping.');
    return;
  }

  const insUser = db.prepare(`INSERT INTO users (full_name,email,password,phone,role,avatar_url,rating,balance,is_blocked)
    VALUES (?,?,?,?,?,?,?,?,?)`);
  const admin = insUser.run('Админ Админов', 'admin@seatmate.by', 'admin123', '+375291112233', 'ADMIN', null, 5.0, 1000, 0).lastInsertRowid;
  const d1 = insUser.run('Иван Петров', 'driver1@seatmate.by', '1234', '+375291234567', 'DRIVER', null, 4.8, 320.5, 0).lastInsertRowid;
  const d2 = insUser.run('Сергей Козлов', 'driver2@seatmate.by', '1234', '+375331112244', 'DRIVER', null, 4.6, 150.0, 0).lastInsertRowid;
  const d3 = insUser.run('Ольга Сидорова', 'driver3@seatmate.by', '1234', '+375441239876', 'DRIVER', null, 4.9, 90.2, 0).lastInsertRowid;
  const c1 = insUser.run('Анна Иванова', 'client1@seatmate.by', '1234', '+375292221144', 'CLIENT', null, 4.7, 60.0, 0).lastInsertRowid;
  const c2 = insUser.run('Дмитрий Новик', 'client2@seatmate.by', '1234', '+375332211334', 'CLIENT', null, 4.5, 25.0, 0).lastInsertRowid;
  const c3 = insUser.run('Мария Климова', 'client3@seatmate.by', '1234', '+375442211556', 'CLIENT', null, 4.9, 10.0, 0).lastInsertRowid;

  const insVeh = db.prepare('INSERT INTO vehicles (driver_id,make,model,color,plate_number,seats) VALUES (?,?,?,?,?,?)');
  const v1 = insVeh.run(d1, 'Volkswagen', 'Passat', 'Белый', '1234 AB-7', 4).lastInsertRowid;
  const v2 = insVeh.run(d2, 'Skoda', 'Octavia', 'Серый', '5678 CD-7', 4).lastInsertRowid;
  const v3 = insVeh.run(d3, 'Toyota', 'Camry', 'Чёрный', '9012 EF-7', 3).lastInsertRowid;

  const today = new Date();
  const iso = (offsetDays, h) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(h, 0, 0, 0);
    return d.toISOString();
  };

  const insTrip = db.prepare(`INSERT INTO trips (driver_id,vehicle_id,origin,destination,intermediate_stops,departure_time,price,seats_total,seats_available,features,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const tripsData = [
    [d1, v1, 'Минск', 'Брест', '["Барановичи"]', iso(0, 18), 35, 4, 3, '["big_trunk","quiet_driver"]', 'ACTIVE'],
    [d2, v2, 'Минск', 'Гродно', '[]', iso(0, 20), 30, 4, 2, '["animals"]', 'ACTIVE'],
    [d3, v3, 'Минск', 'Витебск', '["Новополоцк"]', iso(1, 7), 28, 3, 3, '["quiet_driver"]', 'ACTIVE'],
    [d1, v1, 'Гомель', 'Минск', '["Могилев","Бобруйск"]', iso(1, 9), 40, 4, 4, '["big_trunk"]', 'ACTIVE'],
    [d2, v2, 'Витебск', 'Полоцк', '["Новополоцк"]', iso(1, 14), 12, 4, 3, '[]', 'ACTIVE'],
    [d3, v3, 'Брест', 'Минск', '[]', iso(2, 8), 38, 3, 2, '["animals","quiet_driver"]', 'ACTIVE'],
    [d1, v1, 'Барановичи', 'Гродно', '[]', iso(2, 11), 22, 4, 4, '[]', 'ACTIVE'],
    [d2, v2, 'Могилев', 'Минск', '[]', iso(2, 17), 25, 4, 1, '["big_trunk"]', 'ACTIVE'],
    [d3, v3, 'Новополоцк', 'Гродно', '["Полоцк"]', iso(3, 6), 45, 3, 3, '["quiet_driver"]', 'ACTIVE'],
    [d1, v1, 'Минск', 'Гомель', '["Бобруйск"]', iso(-1, 10), 42, 4, 0, '[]', 'COMPLETED'],
  ];
  const tripIds = tripsData.map(t => insTrip.run(...t).lastInsertRowid);

  const insRental = db.prepare('INSERT INTO rentals (trip_id,passenger_id,seats_booked,total_price,status,created_at) VALUES (?,?,?,?,?,datetime(\'now\'))');
  insRental.run(tripIds[0], c1, 1, 35, 'ACTIVE');
  insRental.run(tripIds[1], c2, 2, 60, 'ACTIVE');
  insRental.run(tripIds[9], c3, 1, 42, 'COMPLETED');

  const insChat = db.prepare('INSERT INTO chats (trip_id) VALUES (?)');
  const participants = db.prepare('INSERT INTO chat_participants (chat_id,user_id) VALUES (?,?)');
  const insMsg = db.prepare('INSERT INTO messages (chat_id,sender_id,text,is_read) VALUES (?,?,?,?)');
  const chat1 = insChat.run(tripIds[0]).lastInsertRowid;
  participants.run(chat1, d1); participants.run(chat1, c1);
  insMsg.run(chat1, d1, 'Добрый день! Выеду вовремя из Минска.', 1);
  insMsg.run(chat1, c1, 'Спасибо! Буду на вокзале.', 0);
  const chat2 = insChat.run(tripIds[1]).lastInsertRowid;
  participants.run(chat2, d2); participants.run(chat2, c2);
  insMsg.run(chat2, c2, 'Есть место для велосипеда?', 1);
  insMsg.run(chat2, d2, 'Да, в багажник поместится.', 0);

  const insReview = db.prepare('INSERT INTO reviews (trip_id,author_id,target_user_id,rating,comment,type) VALUES (?,?,?,?,?,?)');
  insReview.run(tripIds[9], c3, d1, 5, 'Отличная поездка, рекомендую!', 'USER_REVIEW');
  insReview.run(tripIds[9], d1, c3, 5, 'Приятный пассажир, вовремя.', 'USER_REVIEW');
  insReview.run(tripIds[0], c1, null, 4, 'Удобный сервис для поездок по Беларуси', 'APP_REVIEW');

  db.prepare('INSERT INTO reports (reporter_id,target_trip_id,target_user_id,reason,status) VALUES (?,?,?,?,?)')
    .run(c2, tripIds[7], d2, 'Водитель не вышел на связь', 'PENDING');

  const insNotif = db.prepare('INSERT INTO notifications (user_id,title,text,type) VALUES (?,?,?,?)');
  insNotif.run(c1, 'Бронирование подтверждено', 'Ваше место в поездке Минск → Брест забронировано', 'booking');
  insNotif.run(d1, 'Новое сообщение', 'Анна Иванова написала в чат', 'chat');

  console.log('Seeded OK');
}

seed();
