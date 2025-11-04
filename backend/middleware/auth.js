// Authentication middleware
// To be implemented by Eric

const requireAuth = (req, res, next) => {
  // TODO: Check if user is authenticated via session
  // if (!req.session.userId) {
  //   return res.status(401).json({ error: 'Authentication required' });
  // }
  // next();
  
  next(); // Placeholder - remove when implementing
};

module.exports = { requireAuth };
