const { ObjectId } = require('mongodb');
const { bookingsCollection, BookingStatus } = require('../models/bookings');

// Check if a booking conflicts with existing bookings
const checkBookingConflict = async (serviceId, date, time, duration, excludeBookingId = null) => {
  const bookingDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  
  const startTime = new Date(bookingDate);
  startTime.setHours(hours, minutes, 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setHours(startTime.getHours() + duration);

  const query = {
    serviceId: new ObjectId(serviceId),
    date: bookingDate,
    status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
  };

  if (excludeBookingId) {
    query._id = { $ne: new ObjectId(excludeBookingId) };
  }

  const existingBookings = await bookingsCollection().find(query).toArray();

  for (const booking of existingBookings) {
    const [existingHours, existingMinutes] = booking.time.split(':').map(Number);
    const existingStart = new Date(booking.date);
    existingStart.setHours(existingHours, existingMinutes, 0, 0);
    
    const existingEnd = new Date(existingStart);
    existingEnd.setHours(existingStart.getHours() + booking.duration);

    // Check for overlap
    if (startTime < existingEnd && endTime > existingStart) {
      return {
        hasConflict: true,
        conflictingBooking: booking,
      };
    }
  }

  return { hasConflict: false };
};

module.exports = {
  checkBookingConflict,
};
