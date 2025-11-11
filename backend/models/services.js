// backend/models/services.js
import { getDB } from '../utils/db.js';
import { ObjectId } from 'mongodb';

const COLLECTION = 'services';

export async function ensureServiceIndexes() {
  const col = getDB().collection(COLLECTION);
  // text index for search
  await col.createIndex({ title: 'text', description: 'text' });
  // common filters/sorts
  await col.createIndex({ category: 1 });
  await col.createIndex({ providerId: 1 });
  await col.createIndex({ hourlyRate: 1 });
  await col.createIndex({ createdAt: -1, updatedAt: -1 });
}

export async function createService(doc) {
  const col = getDB().collection(COLLECTION);

  const payload = {
    title: String(doc.title || '').trim(),
    description: String(doc.description || '').trim(),
    category: String(doc.category || '').trim(),
    hourlyRate: Number(doc.hourlyRate || 0),
    providerId: new ObjectId(doc.providerId),
    images: Array.isArray(doc.images) ? doc.images : [],
    availability: doc.availability || [], // [{ day, start, end }]
    status: 'active',
    isEmergency: !!doc.isEmergency,
    location: String(doc.location || '').trim(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const res = await col.insertOne(payload);
  return { _id: res.insertedId, ...payload };
}

export async function getService(id) {
  try {
    const _id = new ObjectId(id);
    return getDB().collection(COLLECTION).findOne({ _id });
  } catch {
    // invalid ObjectId → treat as not found instead of throwing
    return null;
  }
}

export async function updateService(id, providerId, patch) {
  const col = getDB().collection(COLLECTION);

  let _id, pid;
  try {
    _id = new ObjectId(id);
    pid = new ObjectId(providerId);
  } catch {
    return null; // bad ids
  }

  const existing = await col.findOne({ _id });
  if (!existing || existing.status === 'deleted') return null;

  const ownerOk = new ObjectId(existing.providerId).equals(pid);
  if (!ownerOk) return null;

  const res = await col.findOneAndUpdate(
    { _id },
    { $set: { ...patch, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  return res.value ?? (await col.findOne({ _id }));
}

export async function deleteService(id, providerId) {
  const col = getDB().collection(COLLECTION);

  let _id, pid;
  try {
    _id = new ObjectId(id);
    pid = new ObjectId(providerId);
  } catch {
    return null;
  }

  const existing = await col.findOne({ _id });
  if (!existing || existing.status === 'deleted') return null;

  const ownerOk = new ObjectId(existing.providerId).equals(pid);
  if (!ownerOk) return null;

  const res = await col.findOneAndUpdate(
    { _id },
    { $set: { status: 'deleted', updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  return res.value ?? { _id, status: 'deleted' };
}

/**
 * List only the current user's listings (for /api/services/mine).
 */
export async function listServicesByProvider(
  providerId,
  { page = 1, limit = 12 } = {}
) {
  let pid;
  try {
    pid = new ObjectId(providerId);
  } catch {
    return { items: [], total: 0, page: Number(page), limit: Number(limit) };
  }

  const col = getDB().collection(COLLECTION);
  const filter = { providerId: pid, status: 'active' };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    col
      .find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .toArray(),
    col.countDocuments(filter),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

/**
 * Search/browse services (homepage + profile fallback).
 * Accepts optional providerId (non-throwing if invalid).
 */
export async function searchServices({
  q = '',
  category,
  min = 0,
  max = 1e9,
  page = 1,
  limit = 12,
  providerId, // NEW (optional)
} = {}) {
  const col = getDB().collection(COLLECTION);

  const filter = {
    status: 'active',
    hourlyRate: { $gte: Number(min), $lte: Number(max) },
  };

  if (category) filter.category = String(category);

  // if providerId is supplied, add it when it's valid; ignore if invalid
  if (providerId) {
    try {
      filter.providerId = new ObjectId(providerId);
    } catch {
      // ignore invalid providerId to avoid the “24 hex” crash
    }
  }

  // Put $text into the first $match if q is present
  const firstMatch =
    q && q.trim()
      ? { $match: { ...filter, $text: { $search: q.trim() } } }
      : { $match: filter };

  const skip = (Number(page) - 1) * Number(limit);

  const pipeline = [
    firstMatch,
    { $sort: q ? { score: { $meta: 'textScore' } } : { createdAt: -1 } },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: Number(limit) }],
        total: [{ $count: 'count' }],
      },
    },
  ];

  const [res] = await col.aggregate(pipeline).toArray();
  const total = res?.total?.[0]?.count || 0;

  return {
    items: res?.items || [],
    total,
    page: Number(page),
    limit: Number(limit),
  };
}
