const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'seatmate.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK(role IN ('CLIENT','DRIVER','ADMIN')) DEFAULT 'CLIENT',
    avatar_url TEXT,
    rating REAL DEFAULT 5.0,
    balance REAL DEFAULT 0,
    is_blocked INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    make TEXT, model TEXT, color TEXT, plate_number TEXT, seats INTEGER
  );
  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER REFERENCES users(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    origin TEXT, destination TEXT,
    intermediate_stops TEXT DEFAULT '[]',
    departure_time TEXT,
    price REAL,
    seats_total INTEGER,
    seats_available INTEGER,
    features TEXT DEFAULT '[]',
    status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','IN_PROGRESS','COMPLETED','CANCELLED'))
  );
  CREATE TABLE IF NOT EXISTS rentals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER REFERENCES trips(id),
    passenger_id INTEGER REFERENCES users(id),
    seats_booked INTEGER,
    total_price REAL,
    status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','COMPLETED','CANCELLED')),
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER REFERENCES trips(id),
    created_at TEXT DEFAULT (datetime('now')),
    last_message_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS chat_participants (
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (chat_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER REFERENCES chats(id),
    sender_id INTEGER REFERENCES users(id),
    text TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    is_read INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER REFERENCES trips(id),
    author_id INTEGER REFERENCES users(id),
    target_user_id INTEGER REFERENCES users(id),
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    type TEXT CHECK(type IN ('USER_REVIEW','APP_REVIEW'))
  );
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER REFERENCES users(id),
    target_trip_id INTEGER,
    target_user_id INTEGER,
    reason TEXT,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','RESOLVED'))
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    title TEXT, text TEXT, type TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  `);
}

module.exports = { db, initSchema, DB_PATH };
