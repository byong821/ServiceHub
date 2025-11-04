import { Router } from 'express';
import {
  ensureUserIndexes,
  createUser,
  findByEmail,
  verifyPassword,
} from '../models/users.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    await ensureUserIndexes();
    const { username, email, password, role, major, gradYear } = req.body || {};
    const user = await createUser({
      username,
      email,
      password,
      role,
      major,
      gradYear,
    });
    req.session.userId = String(user._id);
    res.status(201).json({ user });
  } catch (err) {
    if (err.code === 11000) {
      err.status = 400;
      err.message = 'Username or email already in use';
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const doc = await findByEmail(email);
    if (
      !doc ||
      !verifyPassword(password || '', doc.passwordSalt, doc.passwordHash)
    ) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    req.session.userId = String(doc._id);
    res.json({
      user: {
        _id: doc._id,
        username: doc.username,
        email: doc.email,
        role: doc.role,
        major: doc.major,
        gradYear: doc.gradYear,
        isVerified: doc.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', (req, res) => {
  res.json({ userId: req.session?.userId ?? null });
});

export default router;
