// Authentication middleware
// To be implemented by Eric

export function authRequired(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'Authentication required' });
}
