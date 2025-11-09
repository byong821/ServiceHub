import { execSync } from 'child_process';

console.log('🌱 Starting ServiceHub data seeding...\n');

try {
  console.log('1️⃣ Seeding users...');
  execSync('node seed/seedUsers.js', { stdio: 'inherit' });

  console.log('\n2️⃣ Seeding services...');
  execSync('node seed/seedServices.js', { stdio: 'inherit' });

  console.log('\n3️⃣ Seeding bookings...');
  execSync('node seed/seedBookings.js', { stdio: 'inherit' });

  console.log('\n4️⃣ Seeding reviews...');
  execSync('node seed/seedReviews.js', { stdio: 'inherit' });

  console.log('\n✅ All data seeded successfully!');
  console.log('📊 Total records: 400 users + 600 services + 500 bookings + 300 reviews = 1,800 records');
} catch (error) {
  console.error('\n❌ Seeding failed:', error.message);
  process.exit(1);
}
