const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/init');
const { publishBookingCreated, publishBookingCancelled } = require('../kafka/producer');

function checkAvailability(call, callback) {
  const { room_id, check_in, check_out } = call.request;
  try {
    const db = getDb();
    const conflict = db.prepare(`
      SELECT id FROM bookings
      WHERE room_id = ? AND status = 'confirmed'
        AND check_in  < ? AND check_out > ?
    `).get(room_id, check_out, check_in);
    callback(null, { available: !conflict });
  } catch (err) {
    callback(null, { available: false, error: 'SERVER_ERROR' });
  }
}

async function createBooking(call, callback) {
  const { user_id, room_id, check_in, check_out } = call.request;
  try {
    const db = getDb();
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(room_id);
    if (!room) return callback(null, { success: false, error: 'ROOM_NOT_FOUND' });

    const conflict = db.prepare(`
      SELECT id FROM bookings
      WHERE room_id = ? AND status = 'confirmed'
        AND check_in < ? AND check_out > ?
    `).get(room_id, check_out, check_in);
    if (conflict) return callback(null, { success: false, error: 'ROOM_NOT_AVAILABLE' });

    const id = uuidv4();
    const created_at = new Date().toISOString();
    db.prepare(
      'INSERT INTO bookings (id, user_id, room_id, check_in, check_out, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, user_id, room_id, check_in, check_out, 'confirmed', created_at);

    const booking = { id, user_id, room_id, check_in, check_out, status: 'confirmed', created_at,
      room: { id: room.id, name: room.name, type: room.type, price: room.price, description: room.description } };

    await publishBookingCreated({ ...booking, room_name: room.name, price: room.price });
    callback(null, { success: true, booking });
  } catch (err) {
    console.error('[createBooking]', err.message);
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

async function cancelBooking(call, callback) {
  const { booking_id, user_id } = call.request;
  try {
    const db = getDb();
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(booking_id, user_id);
    if (!booking) return callback(null, { success: false, error: 'BOOKING_NOT_FOUND' });
    if (booking.status === 'cancelled') return callback(null, { success: false, error: 'ALREADY_CANCELLED' });

    db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(booking_id);
    await publishBookingCancelled(booking);
    callback(null, { success: true, booking: { ...booking, status: 'cancelled' } });
  } catch (err) {
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

function getBooking(call, callback) {
  const { booking_id } = call.request;
  try {
    const db = getDb();
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
    if (!booking) return callback(null, { success: false, error: 'BOOKING_NOT_FOUND' });
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(booking.room_id);
    callback(null, { success: true, booking: { ...booking, room } });
  } catch (err) {
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

function listUserBookings(call, callback) {
  const { user_id } = call.request;
  try {
    const db = getDb();
    const bookings = db.prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC').all(user_id);
    const result = bookings.map(b => {
      const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(b.room_id);
      return { ...b, room };
    });
    callback(null, { success: true, bookings: result });
  } catch (err) {
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

function updateBooking(call, callback) {
  const { booking_id, check_in, check_out } = call.request;
  try {
    const db = getDb();
    db.prepare('UPDATE bookings SET check_in = ?, check_out = ? WHERE id = ?').run(check_in, check_out, booking_id);
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
    if (!booking) return callback(null, { success: false, error: 'BOOKING_NOT_FOUND' });
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(booking.room_id);
    callback(null, { success: true, booking: { ...booking, room } });
  } catch (err) {
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

function listRooms(call, callback) {
  try {
    const db = getDb();
    const rooms = db.prepare('SELECT * FROM rooms').all();
    callback(null, { success: true, rooms });
  } catch (err) {
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

module.exports = { checkAvailability, createBooking, cancelBooking, getBooking, listUserBookings, updateBooking, listRooms };
