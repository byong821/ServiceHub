import { getDB } from './db.js';

export async function createIndexes() {
  const db = getDB();

  try {
    // Services indexes
    await db
      .collection('services')
      .createIndex({ title: 'text', description: 'text' });
    await db.collection('services').createIndex({ category: 1 });
    await db.collection('services').createIndex({ providerId: 1 });
    await db.collection('services').createIndex({ hourlyRate: 1 });
    await db.collection('services').createIndex({ createdAt: -1 });

    // Bookings indexes
    await db.collection('bookings').createIndex({ customerId: 1 });
    await db.collection('bookings').createIndex({ providerId: 1 });
    await db.collection('bookings').createIndex({ serviceId: 1 });
    await db.collection('bookings').createIndex({ status: 1 });
    await db.collection('bookings').createIndex({ date: 1 });
    await db.collection('bookings').createIndex({ createdAt: -1 });

    // Reviews indexes
    await db.collection('reviews').createIndex({ serviceId: 1 });
    await db.collection('reviews').createIndex({ providerId: 1 });
    await db.collection('reviews').createIndex({ customerId: 1 });
    await db.collection('reviews').createIndex({ createdAt: -1 });

    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 });

    console.log('✅ All indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}
