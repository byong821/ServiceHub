import 'dotenv/config';
import { getDB } from '../utils/db.js';
import { connectDB, closeDB } from '../utils/db.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedUsers() {
  try {
    await connectDB();
    const db = getDB();
    const usersCollection = db.collection('users');

    // Clear existing users
    await usersCollection.deleteMany({});

    // Read Mockaroo data
    const mockarooData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf-8')
    );

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Transform and insert users
    const users = mockarooData.map((user) => ({
      username: user.username,
      email: user.email.endsWith('.edu') ? user.email : `${user.email.split('@')[0]}@university.edu`,
      passwordHash: hashedPassword,
      role: 'student',
      major: user.major,
      gradYear: user.gradYear,
      isVerified: user.isVerified,
      createdAt: new Date(user.createdAt),
    }));

    const result = await usersCollection.insertMany(users);
    console.log(`✅ Inserted ${result.insertedCount} users`);

    await closeDB();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
