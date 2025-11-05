// backend/routes/bookings.js
import express from 'express';
import { ObjectId } from 'mongodb';
import { bookingsCollection, BookingStatus } from '../models/bookings.js';
import { authRequired } from '../middleware/auth.js';
import { checkBookingConflict } from '../utils/availability.js';

const router = express.Router();

/**
 * POST /api/bookings
 * Create a new booking (customer = current session user)
 */
router.post('/', authRequired, async (req, res, next) => {
  try {
    const {
      serviceId,
      providerId,
      date,
      time,
      duration,
      message,
      totalPrice = 0,
    } = req.body;
    const customerId = req.session.userId;

    // Basic payload validation (minimal)
    if (!serviceId || !providerId || !date || !time || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for conflicts
    const conflict = await checkBookingConflict(
      serviceId,
      date,
      time,
      Number(duration)
    );
    if (conflict.hasConflict) {
      return res.status(409).json({ error: 'Time slot not available' });
    }

    const booking = {
      serviceId: new ObjectId(String(serviceId)),
      customerId: new ObjectId(String(customerId)),
      providerId: new ObjectId(String(providerId)),
      date: new Date(date),
      time,
      duration: Number(duration),
      status: BookingStatus.PENDING,
      totalPrice: Number(totalPrice) || 0,
      messages: message
        ? [
            {
              userId: new ObjectId(String(customerId)),
              text: message,
              timestamp: new Date(),
            },
          ]
        : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await bookingsCollection().insertOne(booking);
    res.status(201).json({ booking: { ...booking, _id: result.insertedId } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bookings
 * List bookings for the current user with optional role/status filters
 */
router.get('/', authRequired, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { status, role, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role === 'customer') {
      query.customerId = new ObjectId(String(userId));
    } else if (role === 'provider') {
      query.providerId = new ObjectId(String(userId));
    } else {
      query.$or = [
        { customerId: new ObjectId(String(userId)) },
        { providerId: new ObjectId(String(userId)) },
      ];
    }

    if (status) query.status = String(status);

    const skip = (Number(page) - 1) * Number(limit);

    const col = bookingsCollection();
    const [bookings, total] = await Promise.all([
      col
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .toArray(),
      col.countDocuments(query),
    ]);

    res.json({ bookings, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    next(error);
  }
});

/**
 * IMPORTANT: define literal routes BEFORE parameterized ones.
 * GET /api/bookings/stats
 */
router.get('/stats', authRequired, async (req, res, next) => {
  try {
    const userId = req.session.userId;

    const col = bookingsCollection();
    const [completed, pendingCount, confirmedCount] = await Promise.all([
      col
        .find({
          providerId: new ObjectId(String(userId)),
          status: BookingStatus.COMPLETED,
        })
        .toArray(),
      col.countDocuments({
        providerId: new ObjectId(String(userId)),
        status: BookingStatus.PENDING,
      }),
      col.countDocuments({
        providerId: new ObjectId(String(userId)),
        status: BookingStatus.CONFIRMED,
      }),
    ]);

    const totalEarnings = completed.reduce(
      (sum, b) => sum + (Number(b.totalPrice) || 0),
      0
    );

    res.json({
      stats: {
        totalEarnings,
        completedCount: completed.length,
        pendingCount,
        confirmedCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bookings/:id
 * Booking detail (only customer or provider can view)
 */
router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const booking = await bookingsCollection().findOne({
      _id: new ObjectId(String(req.params.id)),
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const userId = req.session.userId;
    const isParty =
      String(booking.customerId) === String(userId) ||
      String(booking.providerId) === String(userId);
    if (!isParty) return res.status(403).json({ error: 'Access denied' });

    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/bookings/:id/status
 * Update status (provider: confirm/complete; customer: cancel)
 */
router.put('/:id/status', authRequired, async (req, res, next) => {
  try {
    const { status } = req.body;
    const userId = req.session.userId;

    if (!status) return res.status(400).json({ error: 'Missing status' });
    if (!Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const col = bookingsCollection();
    const booking = await col.findOne({
      _id: new ObjectId(String(req.params.id)),
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Only provider can confirm/complete
    if (
      (status === BookingStatus.CONFIRMED ||
        status === BookingStatus.COMPLETED) &&
      String(booking.providerId) !== String(userId)
    ) {
      return res
        .status(403)
        .json({ error: 'Only provider can update this status' });
    }

    // Only customer can cancel
    if (
      status === BookingStatus.CANCELLED &&
      String(booking.customerId) !== String(userId)
    ) {
      return res.status(403).json({ error: 'Only customer can cancel' });
    }

    await col.updateOne(
      { _id: new ObjectId(String(req.params.id)) },
      { $set: { status, updatedAt: new Date() } }
    );

    res.json({ success: true, status });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/bookings/:id/messages
 * Append a message to the booking (only parties can post)
 */
router.post('/:id/messages', authRequired, async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.session.userId;

    if (!text) return res.status(400).json({ error: 'Missing text' });

    const col = bookingsCollection();
    const booking = await col.findOne({
      _id: new ObjectId(String(req.params.id)),
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const isParty =
      String(booking.customerId) === String(userId) ||
      String(booking.providerId) === String(userId);
    if (!isParty) return res.status(403).json({ error: 'Access denied' });

    const message = {
      userId: new ObjectId(String(userId)),
      text,
      timestamp: new Date(),
    };

    await col.updateOne(
      { _id: new ObjectId(String(req.params.id)) },
      { $push: { messages: message }, $set: { updatedAt: new Date() } }
    );

    res.json({ message });
  } catch (error) {
    next(error);
  }
});

export default router;
