// seed/seedReviews.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';
import { connectDB, closeDB, getDB } from '../utils/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function safeReadJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}

function synthReviews(n = 150, completedBookings = []) {
  const comments = [
    'Great service!',
    'Very professional.',
    'Would book again.',
    'Decent experience.',
    'Exceeded expectations.',
  ];
  const out = [];
  for (let i = 0; i < n && i < completedBookings.length; i++) {
    const b = completedBookings[i];
    out.push({
      bookingId: b._id,
      serviceId: b.serviceId,
      customerId: b.customerId,
      providerId: b.providerId,
      rating: (i % 5) + 1,
      comment: comments[i % comments.length],
      providerResponse: null,
      createdAt: new Date(),
    });
  }
  return out;
}

export async function seedReviews({ limit = 0 } = {}) {
  await connectDB();
  const db = getDB();
  const bookings = db.collection('bookings');
  const reviews = db.collection('reviews');

  try {
    // Only from completed bookings to match business rules
    const completed = await bookings
      .find({ status: 'completed' })
      .project({ _id: 1, serviceId: 1, customerId: 1, providerId: 1 })
      .toArray();

    if (!completed.length) {
      console.log(
        '⚠️  No completed bookings found. Creating minimal synthetic ones.'
      );
      // In case there are none, pick any bookings (or you could skip entirely)
      const any = await bookings.find({}).limit(50).toArray();
      for (const b of any.slice(0, 20)) b.status = 'completed';
      if (any.length) {
        await Promise.all(
          any
            .slice(0, 20)
            .map((b) =>
              bookings.updateOne(
                { _id: new ObjectId(b._id) },
                { $set: { status: 'completed' } }
              )
            )
        );
      }
      // Refresh completed list
      const refreshed = await bookings
        .find({ status: 'completed' })
        .project({ _id: 1, serviceId: 1, customerId: 1, providerId: 1 })
        .toArray();
      completed.splice(0, completed.length, ...refreshed);
    }

    const dataPath = path.join(__dirname, 'data', 'reviews.json');
    let rows = safeReadJSON(dataPath);
    if (rows) {
      // Map incoming rows to completed booking IDs when possible
      rows = rows
        .slice(0, limit && Number(limit) > 0 ? Number(limit) : rows.length)
        .map((r, i) => {
          const b = completed[i % completed.length];
          return {
            bookingId: new ObjectId(r.bookingId || b._id),
            serviceId: new ObjectId(r.serviceId || b.serviceId),
            customerId: new ObjectId(r.customerId || b.customerId),
            providerId: new ObjectId(r.providerId || b.providerId),
            rating: Math.max(1, Math.min(5, Number(r.rating || (i % 5) + 1))),
            comment: String(r.comment || 'Great service!'),
            providerResponse: r.providerResponse ?? null,
            createdAt: new Date(r.createdAt || Date.now()),
          };
        });
    } else {
      // Synthetic
      const synth = synthReviews(
        limit && Number(limit) > 0 ? Number(limit) : 150,
        completed
      );
      rows = synth;
    }

    await reviews.deleteMany({});
    const result = await reviews.insertMany(rows, { ordered: false });
    const inserted = Object.keys(result.insertedIds || {}).length;
    console.log(`✅ Inserted ${inserted} reviews`);
    return { inserted };
  } catch (err) {
    console.error('❌ Error seeding reviews:', err.message);
    throw err;
  } finally {
    await closeDB();
  }
}
