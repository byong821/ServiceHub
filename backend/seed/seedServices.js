import 'dotenv/config';
import { getDB } from '../utils/db.js';
import { connectDB, closeDB } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedServices() {
  try {
    await connectDB();
    const db = getDB();
    const servicesCollection = db.collection('services');
    const usersCollection = db.collection('users');

    // Clear existing services
    await servicesCollection.deleteMany({});

    // Get all user IDs to assign as providers
    const users = await usersCollection.find({}).toArray();
    if (users.length === 0) {
      throw new Error('No users found. Run seedUsers.js first!');
    }

    // Read Mockaroo data
    const mockarooData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data', 'services.json'), 'utf-8')
    );

    // Transform and insert services
    const services = mockarooData.map((service) => ({
      title: service.title,
      description: service.description,
      category: service.category,
      hourlyRate: service.hourlyRate,
      providerId: users[Math.floor(Math.random() * users.length)]._id,
      images: [],
      availability: service.availability,
      status: service.status,
      isEmergency: service.isEmergency,
      location: service.location,
      createdAt: new Date(service.createdAt),
    }));

    const result = await servicesCollection.insertMany(services);
    console.log(`✅ Inserted ${result.insertedCount} services`);

    await closeDB();
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
}

seedServices();
