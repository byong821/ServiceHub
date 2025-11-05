// backend/utils/availability.js
import { ObjectId } from 'mongodb';
import { bookingsCollection, BookingStatus } from '../models/bookings.js';

// Check if a booking conflicts with existing bookings
export async function checkBookingConflict(
  serviceId,
  date, // 'YYYY-MM-DD'
  time, // 'HH:mm'
  duration, // number (hours)
  excludeBookingId = null
) {
  const bookingDate = new Date(date); // date-only
  const [hours, minutes] = String(time).split(':').map(Number);

  const startTime = new Date(bookingDate);
  startTime.setHours(hours, minutes, 0, 0);

  const endTime = new Date(startTime);
  endTime.setHours(startTime.getHours() + Number(duration));

  const query = {
    serviceId: new ObjectId(String(serviceId)),
    date: bookingDate,
    status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
  };

  if (excludeBookingId) {
    query._id = { $ne: new ObjectId(String(excludeBookingId)) };
  }

  const existingBookings = await bookingsCollection().find(query).toArray();

  for (const booking of existingBookings) {
    const [existingHours, existingMinutes] = String(booking.time)
      .split(':')
      .map(Number);
    const existingStart = new Date(booking.date);
    existingStart.setHours(existingHours, existingMinutes, 0, 0);

    const existingEnd = new Date(existingStart);
    existingEnd.setHours(existingStart.getHours() + Number(booking.duration));

    if (startTime < existingEnd && endTime > existingStart) {
      return { hasConflict: true, conflictingBooking: booking };
    }
  }

  return { hasConflict: false };
}
