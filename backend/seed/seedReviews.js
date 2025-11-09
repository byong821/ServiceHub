import { getDB } from '../utils/db.js';
import { connectDB, closeDB } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedReviews() {
  try {
    await connectDB();
    const db = getDB();
    const reviewsCollection = db.collection('reviews');
    const bookingsCollection = db.collection('bookings');

    // Clear existing reviews
    await reviewsCollection.deleteMany({});

    // Get only COMPLETED bookings
    const completedBookings = await bookingsCollection
      .find({ status: 'completed' })
      .toArray();

    if (completedBookings.length === 0) {
      throw new Error('No completed bookings found. Run seedBookings.js first!');
    }

    // Read Mockaroo data
    const mockarooData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data', 'reviews.json'), 'utf-8')
    );

    // Transform and insert reviews (only for completed bookings)
    const reviews = mockarooData.slice(0, Math.min(mockarooData.length, completedBookings.length)).map((review, index) => {
      const booking = completedBookings[index];

      return {
        bookingId: booking._id,
        serviceId: booking.serviceId,
        customerId: booking.customerId,
        providerId: booking.providerId,
        rating: review.rating,
        comment: review.comment,
        providerResponse: review.hasResponse ? review.responseText : null,
        createdAt: new Date(review.createdAt),
      };
    });

    const result = await reviewsCollection.insertMany(reviews);
    console.log(`✅ Inserted ${result.insertedCount} reviews`);

    await closeDB();
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
}

seedReviews();
