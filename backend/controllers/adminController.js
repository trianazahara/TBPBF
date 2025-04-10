const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const adminController = {
    addAdmin: async (req, res) => {
        try {
            const { username, password, email, nama, nip, id_bidang, role } = req.body;
   
            // Cek kelengkapan data wajib
            if (!username || !password || !email || !nama || !id_bidang || !role) {
                return res.status(400).json({ message: 'Semua data (username, password, email, nama, role) harus diisi.' });
            }
   
            // Cek format email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Format email tidak valid.' });
            }
   
            // Cek role admin/superadmin
            const validRoles = ['admin', 'superadmin'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: `Role tidak valid. Pilihan yang valid adalah: ${validRoles.join(', ')}` });
            }
   
            // Cek duplikasi username/email
            const [existingUsers] = await pool.execute(
                'SELECT * FROM users WHERE username = ? OR email = ?',
                [username, email]
            );
            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Username atau email sudah digunakan.' });
            }

            // Cek keberadaan bidang
            const [bidangExists] = await pool.execute(
                'SELECT id_bidang FROM bidang WHERE id_bidang = ?',
                [id_bidang]
            );
            if (bidangExists.length === 0) {
                return res.status(400).json({ message: 'Bidang tidak ditemukan.' });
            }
   
            const hashedPassword = await bcrypt.hash(password, 10);
            const id_users = uuidv4();
   
            // Simpan data admin baru
            await pool.execute(
                `INSERT INTO users (id_users, username, password, email, nama, nip, id_bidang, role, is_active, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, NOW())`,
                [id_users, username, hashedPassword, email, nama, nip, id_bidang, role]
            );
   
            res.status(201).json({
                message: 'Admin berhasil ditambahkan.',
                data: { id_users, username, email, nama, nip, id_bidang, role },
            })
        } catch (error) {
            console.error('Add admin error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan server.' });
        }
    },

    deleteAdmin: async (req, res) => {
        try {
            const { id } = req.params;

            // Mulai transaksi untuk hapus data terkait
            const connection = await pool.getConnection();
            await connection.beginTransaction();
           
            try {
                // Reset mentor_id peserta
                await connection.execute(
                    'UPDATE peserta_magang SET mentor_id = NULL WHERE mentor_id = ?',
                    [id]
                );

                // Hapus notifikasi user
                await connection.execute(
                    'DELETE FROM notifikasi WHERE user_id = ?',
                    [id]
                );
               
                // Reset created_by peserta
                await connection.execute(
                    'UPDATE peserta_magang SET created_by = NULL WHERE created_by = ?',
                    [id]
                );
               
                // Hapus user admin
                const [result] = await connection.execute(
                    'DELETE FROM users WHERE id_users = ? AND role = "admin"',
                    [id]
                );
               
                if (result.affectedRows === 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(404).json({ 
                        message: 'Admin tidak ditemukan atau tidak dapat dihapus.' 
                    });
                }

                await connection.commit();
                connection.release();
               
                res.json({ 
                    message: 'Admin berhasil dihapus. Semua peserta magang yang dibimbing oleh admin ini akan diset tanpa mentor.'
                });
               
            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }
           
        } catch (error) {
            console.error('Delete admin error:', error);
            res.status(500).json({
                message: 'Terjadi kesalahan server.',
                detail: error.message
            });
        }    
    },

    getAdmin: async (req, res) => {
        try {
            // Ambil data admin dengan info bidang
            const [admins] = await pool.execute(`
                SELECT u.id_users, u.username, u.email, u.nama, u.nip,
                   u.id_bidang, b.nama_bidang, u.role, u.last_login,
                   u.is_active
            FROM users u
            LEFT JOIN bidang b ON u.id_bidang = b.id_bidang
            WHERE u.role = 'admin'
            ORDER BY u.created_at DESC
            `);
            res.json(admins);
   
        } catch (error) {
            console.error('Error fetching admin data:', error);
            res.status(500).json({ message: 'Terjadi kesalahan server.' });
        }
    },

    editAdmin: async (req, res) => {
        try {
            const { id } = req.params;
            const { nama, username, email, password, nip, id_bidang} = req.body;
           
            // Cek minimal satu field diisi
            if (!username && !email && !nama && !password && !nip && !id_bidang) {
                return res.status(400).json({ message: 'Setidaknya satu kolom harus diisi untuk diperbarui.' });
            }
   
            const updates = [];
            const params = [];
   
            // Siapkan query update sesuai field yang diisi
            if (username) {
                updates.push('username = ?');
                params.push(username);
            }
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ message: 'Format email tidak valid.' });
                }
                updates.push('email = ?');
                params.push(email);
            }
            if (nama) {
                updates.push('nama = ?');
                params.push(nama);
            }
            if (nip) {
                updates.push('nip = ?');
                params.push(nip);
            }
            if (id_bidang) {
                updates.push('id_bidang = ?');
                params.push(id_bidang);
            }
            if (password) {
                const bcrypt = require('bcrypt');
                const hashedPassword = await bcrypt.hash(password, 10);
                updates.push('password = ?');
                params.push(hashedPassword);
            }

            params.push(id);

            // Eksekusi update admin
            const [result] = await pool.execute(
                `UPDATE users SET ${updates.join(', ')} WHERE id_users = ? AND role = "admin"`,
                params
            );
   
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Admin tidak ditemukan atau tidak dapat diupdate.' });
            }
   
            res.json({ message: 'Profil admin berhasil diperbarui.' });
           
        } catch (error) {
            console.error('Update admin error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan server' });
        }
    },
};

module.exports = adminController;