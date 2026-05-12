const express = require('express');
const router = express.Router();
const { userClient, grpcCall } = require('../../grpc/clients');

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const result = await grpcCall(userClient, 'RegisterUser', { name, email, password, phone: phone || '' });
    if (!result.success) return res.status(400).json({ error: result.error });
    res.status(201).json({ token: result.token, user: result.user });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await grpcCall(userClient, 'LoginUser', { email, password });
    if (!result.success) return res.status(401).json({ error: result.error });
    res.json({ token: result.token, user: result.user });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

module.exports = router;
