const express = require('express');
const router = express.Router();
const { bookingClient, grpcCall } = require('../../grpc/clients');
const { authMiddleware } = require('../../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await grpcCall(bookingClient, 'ListRooms', {});
    if (!result.success) return res.status(500).json({ error: result.error });
    res.json({ rooms: result.rooms });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

router.get('/:id/availability', authMiddleware, async (req, res) => {
  const { check_in, check_out } = req.query;
  try {
    const result = await grpcCall(bookingClient, 'CheckAvailability', {
      room_id: req.params.id, check_in, check_out,
    });
    res.json({ available: result.available });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

module.exports = router;