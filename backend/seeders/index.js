// Import semua seeder
const seedUsers = require('./userSeeder');



async function runSeeders() {
  try {
    console.log('Memulai seeding database...');
    await seedUsers();
    
    console.log('Semua seeder berhasil dijalankan');
    process.exit(0);
  } catch (error) {
    console.error('Error saat menjalankan seeder:', error);
    process.exit(1);
  }
}

runSeeders();