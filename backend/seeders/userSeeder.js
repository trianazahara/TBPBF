const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Fungsi untuk menghasilkan password yang di-hash
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Buat koneksi database langsung dengan nama database yang benar
async function createConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'pandu',
    });
    
    console.log('Koneksi database berhasil dibuat');
    return connection;
  } catch (error) {
    console.error('Gagal membuat koneksi database:', error);
    throw error;
  }
}

function generateCustomId() {
  const segments = [
    Math.random().toString(16).substring(2, 6),
    Math.random().toString(16).substring(2, 6),
    Math.random().toString(16).substring(2, 6),
    Math.random().toString(16).substring(2, 12)
  ];
  return segments.join('-');
}

// Fungsi seeder pengguna
async function seedUsers() {
  let connection;
  
  try {
    connection = await createConnection();
    
    console.log('Menjalankan seeder pengguna...');

    const users = [
      {
        id_users: generateCustomId(), 
        username: 'admin_test',
        password: await hashPassword('admin123'),
        email: 'admin_test@example.com',
        nama: 'Admin Test',
        role: 'admin', 
        profile_picture: null,
        is_active: 1,
        nip: '123458',
        id_bidang: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Masukkan pengguna ke database
    for (const user of users) {
      console.log(`Mencoba menambahkan pengguna: ${user.username}`);
      
    
      const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [user.username, user.email]
      );
      
      if (existingUsers.length === 0) {
        try {
          const [columns] = await connection.query('SHOW COLUMNS FROM users');
          const columnNames = columns.map(col => col.Field);
          console.log('Kolom-kolom dalam tabel users:', columnNames.join(', '));
          

          const validUserData = {};
          for (const key in user) {
            if (columnNames.includes(key)) {
              validUserData[key] = user[key];
            } else {
              console.log(`Kolom '${key}' tidak ada dalam tabel users, dilewati`);
            }
          }
          
          const validColumns = Object.keys(validUserData).join(', ');
          const placeholders = Object.keys(validUserData).map(() => '?').join(', ');
          const values = Object.values(validUserData);
          

          console.log(`Menjalankan query: INSERT INTO users (${validColumns}) VALUES (...)`);
          
          const [result] = await connection.query(
            `INSERT INTO users (${validColumns}) VALUES (${placeholders})`,
            values
          );
          
          console.log(`✓ Pengguna ${user.username} berhasil ditambahkan. ID: ${result.insertId}`);
        } catch (insertError) {
          console.error(`ERROR saat menyisipkan pengguna ${user.username}:`, insertError.message);
          if (insertError.sql) {
            console.error('Query SQL yang gagal:', insertError.sql.split('VALUES')[0] + 'VALUES (...)');
          }
        }
      } else {
        console.log(`! Pengguna ${user.username} sudah ada, dilewati`);
      }
    }

    console.log('✓ Proses seeder pengguna selesai');
  } catch (error) {
    console.error('ERROR utama saat menjalankan seeder:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Koneksi database ditutup');
    }
  }
}

module.exports = seedUsers;
 
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('Seeding selesai, keluar...');
      process.exit(0);
    })
    .catch(err => {
      console.error('Seeding gagal:', err);
      process.exit(1);
    });
}