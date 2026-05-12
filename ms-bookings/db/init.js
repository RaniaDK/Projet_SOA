const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'bookings.db');
let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS rooms (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        type        TEXT NOT NULL,
        price       REAL NOT NULL,
        description TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id         TEXT PRIMARY KEY,
        user_id    TEXT NOT NULL,
        room_id    TEXT NOT NULL,
        check_in   TEXT NOT NULL,
        check_out  TEXT NOT NULL,
        status     TEXT NOT NULL DEFAULT 'confirmed',
        created_at TEXT NOT NULL
      );
    `);

    const count = db.prepare('SELECT COUNT(*) as c FROM rooms').get();
    if (count.c === 0) {
      const insert = db.prepare(
        'INSERT INTO rooms (id, name, type, price, description) VALUES (?, ?, ?, ?, ?)'
      );
      insert.run('room-1', 'Chambre Standard 101', 'standard',  80.0,  'Chambre simple avec vue sur jardin');
      insert.run('room-2', 'Chambre Deluxe 201',   'deluxe',    150.0, 'Grande chambre avec balcon et vue mer');
      insert.run('room-3', 'Suite Présidentielle', 'suite',     350.0, 'Suite luxueuse avec salon et jacuzzi');
      insert.run('room-4', 'Chambre Standard 102', 'standard',  80.0,  'Chambre double vue sur cour');
      insert.run('room-5', 'Chambre Deluxe 202',   'deluxe',    160.0, 'Chambre deluxe avec vue montagne');
      console.log('[ms-bookings] Chambres de test insérées');
    }
  }
  return db;
}

module.exports = { getDb };