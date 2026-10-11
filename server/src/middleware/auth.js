export function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Please sign in to continue.' });
  next();
}

export function validateOrigin(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || !req.get('origin')) return next();
  const allowed = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((item) => item.trim());
  if (!allowed.includes(req.get('origin'))) return res.status(403).json({ error: 'Request origin is not allowed.' });
  next();
}
