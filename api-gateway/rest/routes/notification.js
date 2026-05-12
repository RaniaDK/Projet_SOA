const express = require('express');
const router = express.Router();
const { notifClient, grpcCall } = require('../../grpc/clients');
const { authMiddleware } = require('../../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await grpcCall(notifClient, 'GetUserNotifs', { user_id: req.userId });
    if (!result.success) return res.status(500).json({ error: result.error });
    res.json({ notifications: result.notifs });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const result = await grpcCall(notifClient, 'MarkAsRead', { notif_id: req.params.id });
    if (!result.success) return res.status(404).json({ error: result.error });
    res.json({ notification: result.notif });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

module.exports = router;