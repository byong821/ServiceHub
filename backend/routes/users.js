import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { findById, updateUser } from '../models/users.js';

const router = Router();

// Public endpoint to view any user's public profile
router.get('/public/:id', async (req, res, next) => {
  try {
    const user = await findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Return only public user info
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        major: user.major,
        gradYear: user.gradYear,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const user = await findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (req.session.userId !== String(user._id))
      return res.status(403).json({ error: 'Forbidden' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authRequired, async (req, res, next) => {
  try {
    if (req.session.userId !== String(req.params.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const updated = await updateUser(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ user: updated }); // <-- return it
  } catch (err) {
    if (err.code === 11000) {
      err.status = 400;
      err.message = 'Username already in use';
    }
    next(err);
  }
});

export default router;
