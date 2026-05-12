const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/init');
const { publishUserRegistered } = require('../kafka/producer');

const JWT_SECRET = process.env.JWT_SECRET || 'hotelsync_secret_key';

async function registerUser(call, callback) {
  const { name, email, password, phone } = call.request;
  try {
    if (!name || !email || !password) {
      return callback(null, { success: false, error: 'MISSING_FIELDS' });
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return callback(null, { success: false, error: 'EMAIL_ALREADY_EXISTS' });
    }
    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);
    const created_at = new Date().toISOString();
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, name, email, password_hash, phone || '', created_at);

    const user = { id, name, email, phone: phone || '', created_at };
    await publishUserRegistered(user);

    const token = jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: '7d' });
    callback(null, { success: true, token, user });
  } catch (err) {
    console.error('[registerUser]', err.message);
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

async function loginUser(call, callback) {
  const { email, password } = call.request;
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return callback(null, { success: false, error: 'USER_NOT_FOUND' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return callback(null, { success: false, error: 'INVALID_PASSWORD' });
    }
    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
    callback(null, {
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, created_at: user.created_at },
    });
  } catch (err) {
    console.error('[loginUser]', err.message);
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

function getUserProfile(call, callback) {
  const { user_id } = call.request;
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, phone, created_at FROM users WHERE id = ?').get(user_id);
    if (!user) {
      return callback(null, { success: false, error: 'USER_NOT_FOUND' });
    }
    callback(null, { success: true, user });
  } catch (err) {
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

function updateProfile(call, callback) {
  const { user_id, name, phone } = call.request;
  try {
    const db = getDb();
    db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(name, phone, user_id);
    const user = db.prepare('SELECT id, name, email, phone, created_at FROM users WHERE id = ?').get(user_id);
    if (!user) return callback(null, { success: false, error: 'USER_NOT_FOUND' });
    callback(null, { success: true, user });
  } catch (err) {
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

function validateToken(call, callback) {
  const { token } = call.request;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    callback(null, { valid: true, user_id: decoded.userId, email: decoded.email });
  } catch (err) {
    callback(null, { valid: false, error: 'INVALID_TOKEN' });
  }
}

module.exports = { registerUser, loginUser, getUserProfile, updateProfile, validateToken };
