import express from 'express';
import { ObjectId } from 'mongodb';
import { bookingsCollection, BookingStatus } from '../models/bookings.js';
import { requireAuth } from '../middleware/auth.js';
import { checkBookingConflict } from '../utils/availability.js';

const router = express.Router();

// POST /api/bookings - Create new booking
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { serviceId, providerId, date, time, duration, message } = req.body;
    const customerId = req.session.userId;

    // Check for conflicts
    const conflict = await checkBookingConflict(serviceId, date, time, duration);
    if (conflict.hasConflict) {
      return res.status(409).json({ error: 'Time slot not available' });
    }

    const booking = {
      serviceId: new ObjectId(serviceId),
      customerId: new ObjectId(customerId),
      providerId: new ObjectId(providerId),
      date: new Date(date),
      time,
      duration: Number(duration),
      status: BookingStatus.PENDING,
      totalPrice: req.body.totalPrice || 0,
      messages: message ? [{ userId: new ObjectId(customerId), text: message, timestamp: new Date() }] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await bookingsCollection().insertOne(booking);
    res.status(201).json({ booking: { ...booking, _id: result.insertedId } });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings - List bookings with filters
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { status, role, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role === 'customer') {
      query.customerId = new ObjectId(userId);
    } else if (role === 'provider') {
      query.providerId = new ObjectId(userId);
    } else {
      query.$or = [
        { customerId: new ObjectId(userId) },
        { providerId: new ObjectId(userId) },
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const bookings = await bookingsCollection()
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .toArray();

    const total = await bookingsCollection().countDocuments(query);

    res.json({ bookings, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/:id - Get booking detail
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const booking = await bookingsCollection().findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const userId = req.session.userId;
    if (
      booking.customerId.toString() !== userId &&
      booking.providerId.toString() !== userId
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id/status - Update booking status
router.put('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const userId = req.session.userId;

    const booking = await bookingsCollection().findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Only provider can accept/decline, only customer can cancel
    if (
      (status === BookingStatus.CONFIRMED || status === BookingStatus.COMPLETED) &&
      booking.providerId.toString() !== userId
    ) {
      return res.status(403).json({ error: 'Only provider can update this status' });
    }

    if (status === BookingStatus.CANCELLED && booking.customerId.toString() !== userId) {
      return res.status(403).json({ error: 'Only customer can cancel' });
    }

    const result = await bookingsCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );

    res.json({ success: true, status });
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings/:id/messages - Add message to booking
router.post('/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.session.userId;

    const booking = await bookingsCollection().findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (
      booking.customerId.toString() !== userId &&
      booking.providerId.toString() !== userId
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = {
      userId: new ObjectId(userId),
      text,
      timestamp: new Date(),
    };

    await bookingsCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { messages: message }, $set: { updatedAt: new Date() } }
    );

    res.json({ message });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/stats - Get earnings and stats
router.get('/stats', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;

    const completedBookings = await bookingsCollection()
      .find({
        providerId: new ObjectId(userId),
        status: BookingStatus.COMPLETED,
      })
      .toArray();

    const totalEarnings = completedBookings.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0
    );

    const stats = {
      totalEarnings,
      completedCount: completedBookings.length,
      pendingCount: await bookingsCollection().countDocuments({
        providerId: new ObjectId(userId),
        status: BookingStatus.PENDING,
      }),
      confirmedCount: await bookingsCollection().countDocuments({
        providerId: new ObjectId(userId),
        status: BookingStatus.CONFIRMED,
      }),
    };

    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

export default router;
