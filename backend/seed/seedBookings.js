// seed/seedBookings.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';
import { connectDB, closeDB, getDB } from '../utils/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_STATUS = new Set([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]);

function safeReadJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}

function synthBookings(n = 100, services = [], users = []) {
  const times = ['10:00', '12:00', '14:00', '16:00'];
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  const out = [];
  for (let i = 0; i < n; i++) {
    const svc = services[i % services.length];
    const customer = users[(i * 7) % users.length];
    const duration = (i % 3) + 1;
    const status = statuses[i % statuses.length];
    const day = new Date();
    day.setDate(day.getDate() + (i % 20));

    out.push({
      serviceId: svc._id,
      customerId: customer._id,
      providerId: svc.providerId,
      date: day,
      time: times[i % times.length],
      duration,
      status,
      totalPrice: (svc.hourlyRate || 0) * duration,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  return out;
}

export async function seedBookings({ limit = 0 } = {}) {
  await connectDB();
  const db = getDB();
  const bookings = db.collection('bookings');
  const services = db.collection('services');
  const users = db.collection('users');

  try {
    const svcDocs = await services
      .find({ status: { $ne: 'deleted' } })
      .toArray();
    const userDocs = await users.find({}).toArray();
    if (!svcDocs.length || !userDocs.length) {
      throw new Error('Need services + users before seeding bookings.');
    }

    const dataPath = path.join(__dirname, 'data', 'bookings.json');
    let rows = safeReadJSON(dataPath);
    if (!rows) rows = synthBookings(200, svcDocs, userDocs);
    if (limit && Number(limit) > 0) rows = rows.slice(0, Number(limit));

    const docs = rows.map((b, i) => {
      const svc = svcDocs[i % svcDocs.length];
      const customer = userDocs[(i * 13) % userDocs.length];

      const status = ALLOWED_STATUS.has(String(b.status).toLowerCase())
        ? String(b.status).toLowerCase()
        : 'pending';
      const duration = Number(b.duration || 1);
      const date = new Date(b.date || Date.now());
      const time = b.time || '10:00';

      return {
        serviceId: new ObjectId(b.serviceId || svc._id),
        customerId: new ObjectId(b.customerId || customer._id),
        providerId: new ObjectId(b.providerId || svc.providerId),
        date,
        time,
        duration,
        status,
        totalPrice: Number(b.totalPrice ?? (svc.hourlyRate || 0) * duration),
        messages: Array.isArray(b.messages) ? b.messages : [],
        createdAt: new Date(b.createdAt || Date.now()),
        updatedAt: new Date(b.updatedAt || Date.now()),
      };
    });

    await bookings.deleteMany({});
    const result = await bookings.insertMany(docs, { ordered: false });
    const inserted = Object.keys(result.insertedIds || {}).length;
    console.log(`✅ Inserted ${inserted} bookings`);
    return { inserted };
  } catch (err) {
    console.error('❌ Error seeding bookings:', err.message);
    throw err;
  } finally {
    await closeDB();
  }
}
