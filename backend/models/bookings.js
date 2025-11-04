const { ObjectId } = require('mongodb');
const { getDB } = require('../utils/db');

const COLLECTION_NAME = 'bookings';

const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const bookingsCollection = () => getDB().collection(COLLECTION_NAME);

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

module.exports = {
  bookingsCollection,
  BookingStatus,
  COLLECTION_NAME,
};
