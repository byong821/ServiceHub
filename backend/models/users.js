import { getDB } from '../utils/db.js';
import crypto, { hash } from 'crypto';
import { ObjectId } from 'bson';

const COLLECTION = 'users';

// create secure password hash using crypto module
function hashPassword(password, salt = crypto.randomBytes(16)) {
  const key = crypto.scryptSync(password, salt, 64);
  return { salt: salt.toString('hex'), hash: key.toString('hex') };
}

// validates log in attempts by hashing the provided password with the stored salt and comparing it to the stored hash
export function verifyPassword(password, saltHex, hashHex) {
  const test = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64);
  const given = Buffer.from(hashHex, 'hex');
  return crypto.timingSafeEqual(test, given);
}

// checks email ends with .edu using regex pattern
export function isEduEmail(email) {
  return /^[^@]+@[^@]+\.(edu)$/i.test(email);
}

// creates unique indexes on email and username fields in MongoDB collection
export async function ensureUserIndexes() {
  const col = getDB().collection(COLLECTION);
  await col.createIndex({ email: 1 }, { unique: true });
  await col.createIndex({ username: 1 }, { unique: true });
}

// registers new users with validations
/* requires .edu email, minimum 8 character password, 
hashes password using scrypt, stores, role, major, graduation year, 
sets isVerified to true, 
returns sanitized user data */
export async function createUser({
  username,
  email,
  password,
  role = 'student',
  major = '',
  gradYear = null,
}) {
  if (!isEduEmail(email)) {
    const e = new Error('Only .edu emails are allowed for registration');
    e.status = 400;
    throw e;
  }
  if (!password || password.length < 8) {
    const e = new Error('Password must be at least 8 characters long');
    e.status = 400;
    throw e;
  }

  const col = getDB().collection(COLLECTION);
  const { salt, hash } = hashPassword(password);
  const doc = {
    username,
    email: email.toLowerCase(),
    passwordHash: hash,
    passwordSalt: salt,
    role,
    major,
    gradYear: gradYear ? Number(gradYear) : null,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const res = await col.insertOne(doc);
  return {
    _id: res.insertedId,
    username: doc.username,
    email: doc.email,
    role: doc.role,
    major: doc.major,
    gradYear: doc.gradYear,
    isVerified: doc.isVerified,
  };
}

export async function findByEmail(email) {
  return getDB()
    .collection(COLLECTION)
    .findOne({ email: (email || '').toLowerCase() });
}

export async function findById(id) {
  return getDB()
    .collection(COLLECTION)
    .findOne(
      { _id: new ObjectId(id) },
      { projection: { passwordHash: 0, passwordSalt: 0 } }
    );
}

export async function updateUser(userId, patch) {
  const col = getDB().collection(COLLECTION);
  const allowed = {};
  if (typeof patch.username === 'string') allowed.username = patch.username;
  if (typeof patch.major === 'string') allowed.major = patch.major;
  if (patch.gradYear !== undefined)
    allowed.gradYear = patch.gradYear ? Number(patch.gradYear) : null;
  allowed.updatedAt = new Date();
  const res = await col.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: allowed },
    {
      returnDocument: 'after',
      projection: { passwordHash: 0, passwordSalt: 0 },
    }
  );
  return res.value;
}
