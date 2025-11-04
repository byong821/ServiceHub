import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import {
  ensureServiceIndexes,
  createService,
  getService,
  updateService,
  deleteService,
  searchServices,
} from '../models/services.js';

const router = Router();

router.post('/', authRequired, async (req, res, next) => {
  try {
    await ensureServiceIndexes();
    const svc = await createService({
      ...req.body,
      providerId: req.session.userId,
    });
    res.status(201).json({ service: svc });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { q, category, min, max, page, limit } = req.query;
    const result = await searchServices({ q, category, min, max, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const svc = await getService(req.params.id);
    if (!svc || svc.status === 'deleted')
      return res.status(404).json({ error: 'Not found' });
    res.json({ service: svc });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authRequired, async (req, res, next) => {
  try {
    const updated = await updateService(
      req.params.id,
      req.session.userId,
      req.body || {}
    );
    if (!updated)
      return res.status(404).json({ error: 'Not found or not owner' });
    res.json({ service: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const removed = await deleteService(req.params.id, req.session.userId);
    if (!removed)
      return res.status(404).json({ error: 'Not found or not owner' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
