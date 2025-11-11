// seed/index.js
import 'dotenv/config';
import { seedUsers } from './seedUsers.js';
import { seedServices } from './seedServices.js';
import { seedBookings } from './seedBookings.js';
import { seedReviews } from './seedReviews.js';

const SMALL = process.env.SEED_SMALL === '1';

console.log('🌱 Starting ServiceHub data seeding…\n');

(async () => {
  try {
    console.log('1️⃣  Seeding users…');
    await seedUsers({ limit: SMALL ? 50 : 400 });

    console.log('\n2️⃣  Seeding services…');
    await seedServices({ limit: SMALL ? 75 : 600 });

    console.log('\n3️⃣  Seeding bookings…');
    await seedBookings({ limit: SMALL ? 60 : 500 });

    console.log('\n4️⃣  Seeding reviews…');
    await seedReviews({ limit: SMALL ? 80 : 300 });

    console.log('\n✅ All data seeded successfully!');
  } catch (e) {
    console.error('\n❌ Seeding failed:', e.message);
    process.exit(1);
  }
})();
