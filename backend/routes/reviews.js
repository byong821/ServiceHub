import express from 'express';
import { ObjectId } from 'mongodb';
import { reviewsCollection } from '../models/reviews.js';
import { bookingsCollection, BookingStatus } from '../models/bookings.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/reviews - Create review (requires completed booking)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { bookingId, serviceId, providerId, rating, comment } = req.body;
    const customerId = req.session.userId;

    // Verify booking exists and is completed
    const booking = await bookingsCollection().findOne({
      _id: new ObjectId(bookingId),
      customerId: new ObjectId(customerId),
      status: BookingStatus.COMPLETED,
    });

    if (!booking) {
      return res.status(403).json({ error: 'Can only review completed bookings' });
    }

    // Check if review already exists
    const existing = await reviewsCollection().findOne({ bookingId: new ObjectId(bookingId) });
    if (existing) {
      return res.status(409).json({ error: 'Review already exists for this booking' });
    }

    const review = {
      bookingId: new ObjectId(bookingId),
      serviceId: new ObjectId(serviceId),
      customerId: new ObjectId(customerId),
      providerId: new ObjectId(providerId),
      rating: Number(rating),
      comment,
      providerResponse: null,
      createdAt: new Date(),
    };

    const result = await reviewsCollection().insertOne(review);
    res.status(201).json({ review: { ...review, _id: result.insertedId } });
  } catch (error) {
    next(error);
  }
});

// GET /api/reviews/service/:serviceId - Get reviews for a service
router.get('/service/:serviceId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await reviewsCollection()
      .find({ serviceId: new ObjectId(req.params.serviceId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .toArray();

    const total = await reviewsCollection().countDocuments({
      serviceId: new ObjectId(req.params.serviceId),
    });

    // Calculate average rating
    const allReviews = await reviewsCollection()
      .find({ serviceId: new ObjectId(req.params.serviceId) })
      .toArray();
    const averageRating = allReviews.length
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    res.json({ reviews, total, averageRating, page: Number(page), limit: Number(limit) });
  } catch (error) {
    next(error);
  }
});

// GET /api/reviews/provider/:providerId - Get reviews for a provider
router.get('/provider/:providerId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await reviewsCollection()
      .find({ providerId: new ObjectId(req.params.providerId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .toArray();

    const total = await reviewsCollection().countDocuments({
      providerId: new ObjectId(req.params.providerId),
    });

    res.json({ reviews, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    next(error);
  }
});

// PUT /api/reviews/:id - Update own review
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.session.userId;

    const review = await reviewsCollection().findOne({ _id: new ObjectId(req.params.id) });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.customerId.toString() !== userId) {
      return res.status(403).json({ error: 'Can only edit your own review' });
    }

    await reviewsCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { rating: Number(rating), comment } }
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/reviews/:id/response - Provider response
router.post('/:id/response', requireAuth, async (req, res, next) => {
  try {
    const { response } = req.body;
    const userId = req.session.userId;

    const review = await reviewsCollection().findOne({ _id: new ObjectId(req.params.id) });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.providerId.toString() !== userId) {
      return res.status(403).json({ error: 'Only provider can respond' });
    }

    await reviewsCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { providerResponse: response } }
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
