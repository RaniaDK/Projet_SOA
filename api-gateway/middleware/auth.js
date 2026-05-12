const { userClient, grpcCall } = require('../grpc/clients');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const result = await grpcCall(userClient, 'ValidateToken', { token });
    if (!result.valid) {
      return res.status(401).json({ error: result.error || 'Token invalide' });
    }
    req.userId = result.user_id;
    req.userEmail = result.email;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Erreur authentification' });
  }
}

module.exports = { authMiddleware };
