const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/init');

async function sendNotification(call, callback) {
  const { user_id, type, message } = call.request;
  try {
    const db = await getDb();
    const doc = {
      id:         uuidv4(),
      user_id,
      type,
      message,
      read:       false,
      created_at: new Date().toISOString(),
    };
    await db.notifications.insert(doc);
    callback(null, { success: true, notif: doc });
  } catch (err) {
    console.error('[sendNotification]', err.message);
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

async function getUserNotifs(call, callback) {
  const { user_id } = call.request;
  try {
    const db = await getDb();
    const docs = await db.notifications.find({
      selector: { user_id },
      sort: [{ created_at: 'desc' }],
    }).exec();
    callback(null, { success: true, notifs: docs.map(d => d.toJSON()) });
  } catch (err) {
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

async function markAsRead(call, callback) {
  const { notif_id } = call.request;
  try {
    const db = await getDb();
    const doc = await db.notifications.findOne(notif_id).exec();
    if (!doc) return callback(null, { success: false, error: 'NOTIF_NOT_FOUND' });
    await doc.patch({ read: true });
    callback(null, { success: true, notif: doc.toJSON() });
  } catch (err) {
    callback(null, { success: false, error: 'SERVER_ERROR' });
  }
}

module.exports = { sendNotification, getUserNotifs, markAsRead };