// seed/seedUsers.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

function synthUsers(n = 25) {
  const majors = ['CS', 'Data Science', 'Biology', 'Finance', 'Design'];
  const out = [];
  for (let i = 0; i < n; i++) {
    const username = `user${i + 1}`;
    out.push({
      username,
      email: `${username}@example.edu`,
      role: 'student',
      major: majors[i % majors.length],
      gradYear: 2026 + (i % 3),
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  return out;
}

export async function seedUsers({ limit = 0 } = {}) {
  await connectDB();
  const db = getDB();
  const users = db.collection('users');

  try {
    const dataPath = path.join(__dirname, 'data', 'users.json');
    let rows = safeReadJSON(dataPath) || synthUsers(50);
    if (limit && Number(limit) > 0) rows = rows.slice(0, Number(limit));

    // Normalize + make emails unique to avoid unique index collisions
    const seen = new Set();
    const docs = rows.map((u, i) => {
      let email = String(u.email || `user${i + 1}@example.edu`).toLowerCase();
      if (seen.has(email)) {
        const [name, domain] = email.split('@');
        email = `${name}+${i}@${domain}`;
      }
      seen.add(email);

      const username = String(u.username || email.split('@')[0]).toLowerCase();

      return {
        username,
        email,
        role: u.role === 'admin' ? 'admin' : 'student',
        major: String(u.major || 'CS'),
        gradYear: Number(u.gradYear || 2026),
        isVerified: Boolean(
          typeof u.isVerified === 'boolean' ? u.isVerified : true
        ),
        createdAt: new Date(u.createdAt || Date.now()),
        updatedAt: new Date(u.updatedAt || Date.now()),
      };
    });

    await users.deleteMany({}); // wipe for repeatable runs
    const result = await users.insertMany(docs, { ordered: false });
    const inserted = Object.keys(result.insertedIds || {}).length;
    console.log(`✅ Inserted ${inserted} users`);
    return { inserted };
  } catch (err) {
    console.error('❌ Error seeding users:', err.message);
    throw err;
  } finally {
    await closeDB();
  }
}
