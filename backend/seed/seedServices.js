// seed/seedServices.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';
import { connectDB, closeDB, getDB } from '../utils/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function safeReadJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}

function synthServices(n = 60, userIds = []) {
  const cats = ['tech', 'tutoring', 'moving', 'photo'];
  const locs = [
    'Northeastern',
    'Campus Center',
    'Library',
    'Dorms',
    'Off-campus',
  ];
  const out = [];
  for (let i = 0; i < n; i++) {
    const cat = cats[i % cats.length];
    const providerId = userIds[i % userIds.length] || userIds[0];
    out.push({
      title: `${cat[0].toUpperCase() + cat.slice(1)} Service ${i + 1}`,
      description: `Affordable ${cat} help #${i + 1}.`,
      category: cat,
      hourlyRate: 10 + (i % 10) * 5,
      providerId,
      images: [],
      availability: [],
      status: 'active',
      isEmergency: false,
      location: locs[i % locs.length],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  return out;
}

export async function seedServices({ limit = 0 } = {}) {
  await connectDB();
  const db = getDB();
  const users = db.collection('users');
  const services = db.collection('services');

  try {
    const userDocs = await users.find({}).toArray();
    if (!userDocs.length) throw new Error('No users found. Seed users first.');
    const userIds = userDocs.map((u) => new ObjectId(u._id));

    const dataPath = path.join(__dirname, 'data', 'services.json');
    let rows = safeReadJSON(dataPath);
    if (!rows) rows = synthServices(120, userIds);
    if (limit && Number(limit) > 0) rows = rows.slice(0, Number(limit));

    const docs = rows.map((s, i) => {
      const providerId = s.providerId
        ? new ObjectId(s.providerId)
        : userIds[i % userIds.length];
      return {
        title: String(s.title || `Service ${i + 1}`).trim(),
        description: String(s.description || '').trim(),
        category: String(s.category || 'tech'),
        hourlyRate: Number(s.hourlyRate || 20),
        providerId,
        images: Array.isArray(s.images) ? s.images : [],
        availability: Array.isArray(s.availability) ? s.availability : [],
        status: s.status === 'deleted' ? 'deleted' : 'active',
        isEmergency: Boolean(s.isEmergency),
        location: String(s.location || 'Northeastern'),
        createdAt: new Date(s.createdAt || Date.now()),
        updatedAt: new Date(s.updatedAt || Date.now()),
      };
    });

    await services.deleteMany({});
    const result = await services.insertMany(docs, { ordered: false });
    const inserted = Object.keys(result.insertedIds || {}).length;
    console.log(`✅ Inserted ${inserted} services`);
    return { inserted };
  } catch (err) {
    console.error('❌ Error seeding services:', err.message);
    throw err;
  } finally {
    await closeDB();
  }
}
