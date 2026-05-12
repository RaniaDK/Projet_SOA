const express = require('express');
const router = express.Router();
const { bookingClient, grpcCall } = require('../../grpc/clients');
const { authMiddleware } = require('../../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
  const { room_id, check_in, check_out } = req.body;
  try {
    const result = await grpcCall(bookingClient, 'CreateBooking', {
      user_id: req.userId, room_id, check_in, check_out,
    });
    if (!result.success) return res.status(400).json({ error: result.error });
    res.status(201).json({ booking: result.booking });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const result = await grpcCall(bookingClient, 'ListUserBookings', { user_id: req.userId });
    if (!result.success) return res.status(500).json({ error: result.error });
    res.json({ bookings: result.bookings });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await grpcCall(bookingClient, 'GetBooking', { booking_id: req.params.id, user_id: req.userId });
    if (!result.success) return res.status(404).json({ error: result.error });
    res.json({ booking: result.booking });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await grpcCall(bookingClient, 'CancelBooking', { booking_id: req.params.id, user_id: req.userId });
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json({ booking: result.booking });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

module.exports = router;
