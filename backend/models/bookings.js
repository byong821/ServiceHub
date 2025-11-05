// backend/models/bookings.js (ESM)
import { ObjectId } from 'mongodb';
import { getDB } from '../utils/db.js';

export const COLLECTION_NAME = 'bookings';

export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export function bookingsCollection() {
  return getDB().collection(COLLECTION_NAME);
}

// Schema structure (for reference, MongoDB is schemaless)
// {
//   _id: ObjectId,
//   serviceId: ObjectId,
//   customerId: ObjectId,
//   providerId: ObjectId,
//   date: Date,
//   time: String (e.g., "14:00"),
//   duration: Number (hours),
//   status: String (pending|confirmed|completed|cancelled),
//   totalPrice: Number,
//   messages: [{ userId: ObjectId, text: String, timestamp: Date }],
//   createdAt: Date,
//   updatedAt: Date
// }
