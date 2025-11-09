import { getDB } from '../utils/db.js';
import { connectDB, closeDB } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedBookings() {
  try {
    await connectDB();
    const db = getDB();
    const bookingsCollection = db.collection('bookings');
    const servicesCollection = db.collection('services');
    const usersCollection = db.collection('users');

    // Clear existing bookings
    await bookingsCollection.deleteMany({});

    // Get all services and users
    const services = await servicesCollection.find({}).toArray();
    const users = await usersCollection.find({}).toArray();

    if (services.length === 0 || users.length === 0) {
      throw new Error('No services or users found. Run seedUsers.js and seedServices.js first!');
    }

    // Read Mockaroo data
    const mockarooData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data', 'bookings.json'), 'utf-8')
    );

    // Transform and insert bookings
    const bookings = mockarooData.map((booking) => {
      const service = services[Math.floor(Math.random() * services.length)];
      const customer = users[Math.floor(Math.random() * users.length)];
      const totalPrice = service.hourlyRate * booking.duration;

      return {
        serviceId: service._id,
        customerId: customer._id,
        providerId: service.providerId,
        date: new Date(booking.date),
        time: booking.time,
        duration: booking.duration,
        status: booking.status,
        totalPrice,
        messages: [],
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.createdAt),
      };
    });

    const result = await bookingsCollection.insertMany(bookings);
    console.log(`✅ Inserted ${result.insertedCount} bookings`);

    await closeDB();
  } catch (error) {
    console.error('Error seeding bookings:', error);
    process.exit(1);
  }
}

seedBookings();
